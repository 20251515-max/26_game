import {
  PATIENCE_BASE_SECONDS,
  PATIENCE_PER_MOCHI_SECONDS,
  PRICE_BONUS_PER_LEVEL,
} from '../config/GameRules.js';
import { Order, createOrder } from '../orders/Order.js';
import { MochiMaker, ROLL_CLICKS, WRAP_CLICKS } from '../production/MochiMaker.js';
import { CUT_CLICKS, FruitPrep, PIECES_PER_PREP, WASH_CLICKS } from '../production/FruitPrep.js';
import { GameProgress } from '../state/GameProgress.js';
import { drawPlayBackground } from '../ui/PlayBackground.js';
import { OrderPanel, pickCustomerLook } from '../ui/OrderPanel.js';
import { Workbench } from '../ui/Workbench.js';
import { IngredientTray } from '../ui/IngredientTray.js';
import { addShopDecor } from '../ui/ShopDecor.js';
import { createButton, createStatusCard, popText, showFloatingText, textStyle } from '../ui/Widgets.js';
import { TUTORIAL_ORDER, TutorialGuide } from '../tutorial/TutorialGuide.js';
import { playSound } from '../audio/SoundEffects.js';
import { playMusic } from '../audio/BackgroundMusic.js';
import { createMusicButton } from '../ui/MusicButton.js';

// 플레이 장면: 화면 모듈을 배치하고, 조작에 따라 손질·손님·제작·판매·확장·라운드 흐름을 진행한다.
// 라운드마다 phase: prep(1단계 손질) → serving(맨 앞 손님 주문 처리 중) ⇄ waiting(다음 손님이 오는 중) → clear(라운드 성공)
export class PlayScene extends Phaser.Scene {
  constructor() {
    super('PlayScene');
  }

  init(data) {
    this.isTutorial = Boolean(data && data.tutorial);
    // 자유 연습: 안내가 끝난 뒤 실전과 같은 순서로 하되 시간 제한과 손질 개수 조건이 없다.
    this.isFreePractice = Boolean(data && data.freePractice);
  }

  create() {
    drawPlayBackground(this);

    this.maker = new MochiMaker();
    this.prep = new FruitPrep();
    this.progress = new GameProgress();
    this.phase = 'prep';
    // 줄 선 손님들 [{ order, look }], 맨 앞이 지금 주문을 받는 손님
    this.queue = [];
    this.order = null;
    this.patienceLeft = 0;
    this.patienceMax = 0;
    // 장면 객체는 재시작해도 그대로 쓰이므로 이전 판의 타이머를 지운다.
    this.countdown = null;
    this.isPlaying = true;

    const graphics = this.add.graphics();

    this.timeText = createStatusCard(this, graphics, 805, 32, 180, 92, 0xe8dfff, '남은 시간',
      this.isTutorial ? '연습' : this.formatTime(this.progress.remainingSeconds),
    );
    this.moneyText = createStatusCard(this, graphics, 1005, 32, 220, 92, 0xffdde7, '보유 금액', '0원');
    this.shopText = createStatusCard(this, graphics, 55, 32, 240, 92, 0xe8dfff, '내 가게', '기본 가게');
    this.orderPanel = new OrderPanel(this, graphics, () => this.onOrderButton());
    this.workbench = new Workbench(this, graphics, () => this.onBoardClick());
    // 연습 안내(TutorialGuide)도 이 글자에 안내 문구를 쓴다.
    this.workshopMessage = this.workbench.message;
    this.tray = new IngredientTray(this, graphics, () => this.placeDough(), (fruit) => this.onFruitTile(fruit));

    this.add.text(640, 62, '모찌 공장', textStyle(40)).setOrigin(0.5);
    this.stageText = this.add.text(640, 115, '', textStyle(22, false)).setOrigin(0.5);

    if (this.isTutorial) {
      createButton(this, 870, 600, 220, 60, 0x8fd48a, '실전 시작', () => {
        this.scene.start('PlayScene', { tutorial: false });
      });
      this.tutorial = this.isFreePractice ? null : new TutorialGuide(this);
    } else {
      this.tutorial = null;
      createButton(this, 870, 600, 220, 60, 0xffa9c0, '결과 화면 보기', () => {
        this.scene.start('ResultScene', { message: '이번 판이 끝났습니다.' });
      });
      this.countdown = this.time.addEvent({
        delay: 1000,
        loop: true,
        callback: () => this.tickTime(),
      });
    }

    this.expandButton = createButton(this, 330, 600, 240, 60, 0xb59cf0, '', () => this.expandShop());
    this.updateExpandButton();
    createMusicButton(this);
    playMusic(this, 'game');
    this.enterPrep();

    if (this.tutorial) {
      this.tutorial.start();
    }
  }

  // 맨 앞 손님의 참을성이 줄어든다. 연습 모드에는 참을성이 없다.
  update(time, delta) {
    if (!this.isPlaying || this.phase !== 'serving' || this.isTutorial) {
      return;
    }

    this.patienceLeft -= delta / 1000;
    this.orderPanel.setPatience(this.patienceLeft / this.patienceMax);

    if (this.patienceLeft <= 0) {
      this.customerGivesUp();
    }
  }

  updateStageText() {
    const { round, rules, stage } = this.progress;
    let message = stage === 'prep'
      ? `${round}라운드 · 손질 재고 ${rules.prepGoal}개 만들기`
      : `${round}라운드 · 모찌 ${rules.goalSales}개 팔기`;

    if (this.isFreePractice) {
      message = stage === 'prep' ? '자유 연습 · 손질 단계' : '자유 연습 · 영업 단계';
    } else if (this.isTutorial) {
      message = '연습 모드 - 천천히 따라 해요!';
    }

    this.stageText.setText(message);
    popText(this, this.stageText);
  }

  get isPrepGoalReached() {
    return this.prep.totalStock >= this.progress.rules.prepGoal;
  }

  // 1단계 손질: 손님 없이 과일만 손질한다.
  enterPrep() {
    this.phase = 'prep';
    this.queue = [];
    this.order = null;
    this.maker.reset();
    this.workbench.reset();
    this.workbench.hidePin();
    this.updateTileStates();
    this.showPrepStation(true);
    this.orderPanel.showEmpty();
    this.orderPanel.setWaiting([]);
    this.orderPanel.showButton('영업 시작');
    this.orderPanel.setPrepGoal(this.prep.totalStock, this.progress.rules.prepGoal);
    this.updateStageText();

    if (!this.isTutorial) {
      this.timeText.setText(this.formatTime(this.progress.remainingSeconds));
    }

    this.workshopMessage.setText('손님이 오기 전이에요. 과일 그림을 클릭해 손질해 두세요');
  }

  // 손님 카드 아래 버튼: 1단계에서는 [영업 시작], 영업 중에는 [다음 손님]
  onOrderButton() {
    if (this.phase === 'prep') {
      this.startServing(false);
      return;
    }

    this.skipCustomer();
  }

  // 2단계 영업 시작: [영업 시작]을 누르거나 손질 시간이 끝나면 넘어온다.
  startServing(isTimeUp) {
    if (!this.isPlaying || this.phase !== 'prep') {
      return;
    }

    if (!isTimeUp) {
      if (!this.allowsAction('call')) {
        return;
      }

      if (this.prep.isBusy) {
        this.workshopMessage.setText('도마의 과일 손질을 먼저 끝내세요');
        playSound(this, 'error');
        return;
      }

      // 연습 모드에서는 손질 개수를 채우지 않아도 된다.
      if (!this.isTutorial && !this.isPrepGoalReached) {
        this.workshopMessage.setText(
          `손질 재고가 ${this.progress.rules.prepGoal}개 이상이어야 영업할 수 있어요 (지금 ${this.prep.totalStock}개)`,
        );
        playSound(this, 'error');
        return;
      }

      if (this.isFreePractice && !this.prep.hasAnyStock()) {
        this.workshopMessage.setText('손질한 과일이 없어요. 먼저 과일을 손질하세요');
        playSound(this, 'error');
        return;
      }
    }

    // 시간이 끝나 넘어오면 손질하던 과일은 버린다.
    this.prep.reset();
    this.progress.startServing();
    this.orderPanel.setSales(0, this.progress.rules.goalSales);
    this.updateStageText();

    if (!this.isTutorial) {
      this.timeText.setText(this.formatTime(this.progress.remainingSeconds));
      popText(this, this.timeText);
    }

    this.callCustomer();
  }

  newCustomer() {
    const { minItems, maxItems } = this.progress.rules;
    const isFirstTutorialOrder = this.tutorial && this.progress.totalSales === 0 && this.queue.length === 0;

    return {
      order: isFirstTutorialOrder ? new Order([TUTORIAL_ORDER]) : createOrder(minItems, maxItems),
      look: pickCustomerLook(),
    };
  }

  // 줄을 채우고 맨 앞 손님의 주문을 받는다.
  callCustomer() {
    while (this.queue.length < this.progress.rules.queueSize) {
      this.queue.push(this.newCustomer());
    }

    const [front, ...waiting] = this.queue;

    this.phase = 'serving';
    this.order = front.order;
    this.patienceMax = PATIENCE_BASE_SECONDS + PATIENCE_PER_MOCHI_SECONDS * this.order.items.length;
    this.patienceLeft = this.patienceMax;
    this.orderPanel.showOrder(this.order, front.look, this.progress.priceOfOrder(this.order));
    this.orderPanel.setWaiting(waiting.map((customer) => customer.look));
    this.orderPanel.setPatience(this.isTutorial ? null : 1);
    playSound(this, 'customer');
    this.showPrepStation(false);
    this.maker.reset();
    this.workbench.reset();
    this.updateTileStates();

    if (this.updateSkipButton()) {
      this.workshopMessage.setText('어서 오세요! 반죽 그림을 클릭해 작업대에 올리세요');
    }

    this.notifyTutorial('customerCalled');
  }

  // 남은 주문을 지금 재고로 만들 수 있는지 (작업대에 이미 올린 과일도 셈한다)
  canFillOrder() {
    const needed = this.order.neededFruits();

    if (this.maker.step === 'filled' && needed[this.maker.fruit]) {
      needed[this.maker.fruit] -= 1;
    }

    return Object.keys(needed).every((fruit) => this.prep.stock[fruit] >= needed[fruit]);
  }

  // 재고가 모자라면 [다음 손님] 버튼을 띄운다. 만들 수 있으면 true를 돌려준다.
  updateSkipButton() {
    if (this.canFillOrder()) {
      return true;
    }

    this.orderPanel.showButton('다음 손님');
    this.workshopMessage.setText('손질된 과일이 모자라요. [다음 손님]을 눌러 넘기세요');
    return false;
  }

  // 판매하거나 손님이 떠나면 줄이 한 칸 당겨지고, 잠시 뒤 다음 손님이 주문한다.
  sendCustomerAway() {
    this.phase = 'waiting';
    this.queue.shift();
    this.workbench.hidePin();
    this.orderPanel.leave();
    this.time.delayedCall(900, () => {
      if (!this.isPlaying || this.phase !== 'waiting') {
        return;
      }

      // 자유 연습은 시간이 끝나지 않으므로, 손질한 과일을 다 쓰면 연습을 마친다.
      if (this.isFreePractice && !this.prep.hasAnyStock()) {
        this.finishPractice();
        return;
      }

      this.callCustomer();
    });
  }

  // [다음 손님]: 남은 주문을 만들 재고가 없을 때만 손님을 넘길 수 있다.
  skipCustomer() {
    if (!this.isPlaying || this.phase !== 'serving' || this.canFillOrder() || !this.allowsAction('skip')) {
      return;
    }

    this.maker.reset();
    this.workbench.reset();
    this.workshopMessage.setText('손님을 다음으로 넘겼어요');
    this.sendCustomerAway();
  }

  customerGivesUp() {
    this.maker.reset();
    this.workbench.reset();
    this.workshopMessage.setText('손님이 기다리다 지쳐 떠났어요');
    playSound(this, 'wrong');
    this.sendCustomerAway();
  }

  // 안내가 끝나면 실전처럼 1단계 손질부터 다시 시작한다.
  startFreePractice() {
    this.scene.start('PlayScene', { tutorial: true, freePractice: true });
  }

  finishPractice() {
    this.isPlaying = false;
    this.workshopMessage.setText('연습 완료! [실전 시작]을 눌러 실제 게임을 해 보세요');
    popText(this, this.workshopMessage);
    playSound(this, 'success');
  }

  // 라운드 성공: 잠시 축하한 뒤 다음 라운드의 손질 단계로 넘어간다.
  clearRound() {
    const { round } = this.progress;

    this.phase = 'clear';
    this.queue = [];
    this.orderPanel.popGoal();
    this.orderPanel.leave();
    this.orderPanel.setWaiting([]);
    this.workshopMessage.setText(`${round}라운드 성공! 다음 라운드를 준비해요`);
    popText(this, this.workshopMessage);
    this.time.delayedCall(300, () => playSound(this, 'success'));

    this.time.delayedCall(1800, () => {
      if (!this.isPlaying) {
        return;
      }

      this.progress.nextRound();
      this.enterPrep();
      popText(this, this.timeText);
    });
  }

  // 가게 확장: 손님이 있든 없든 돈이 모이면 언제든 할 수 있다.
  expandShop() {
    if (!this.isPlaying || !this.allowsAction('expand')) {
      return;
    }

    const { shop } = this.progress;

    if (shop.isMaxed) {
      this.workshopMessage.setText('가게를 모두 확장했어요!');
      playSound(this, 'error');
      return;
    }

    if (!this.progress.canExpand) {
      this.workshopMessage.setText(`확장하려면 ${shop.nextCost - this.progress.money}원이 더 필요해요`);
      playSound(this, 'error');
      return;
    }

    const cost = this.progress.expand();

    this.moneyText.setText(`${this.progress.money}원`);
    this.shopText.setText(shop.isMaxed ? '나만의 가게' : `${shop.level}단계 가게`);
    popText(this, this.shopText);
    showFloatingText(this, 1115, 140, `-${cost}원`);
    showFloatingText(this, 450, 575, `판매가 +${PRICE_BONUS_PER_LEVEL}원!`);
    addShopDecor(this, shop.level);
    this.updateExpandButton();
    this.time.delayedCall(150, () => playSound(this, 'expand'));

    if (this.phase === 'serving') {
      this.orderPanel.setPrice(this.progress.priceOfOrder(this.order));
    }
  }

  // 확장 비용을 표시하고, 돈이 모자라거나 다 확장했으면 버튼을 흐리게 한다.
  updateExpandButton() {
    const button = this.expandButton;
    const { shop } = this.progress;

    if (shop.isMaxed) {
      button.setLabel('확장 완료');
      button.setAlpha(0.5);
      return;
    }

    button.setLabel(`가게 확장 ${shop.nextCost}원`);
    button.setAlpha(this.progress.canExpand ? 1 : 0.5);
  }

  tickTime() {
    // 라운드 성공 후 다음 라운드를 준비하는 동안에는 시간이 흐르지 않는다.
    if (this.phase === 'clear') {
      return;
    }

    this.progress.tick();
    const seconds = this.progress.remainingSeconds;

    this.timeText.setText(this.formatTime(seconds));

    if (seconds <= 10 && seconds > 0) {
      popText(this, this.timeText);
      playSound(this, 'tick');
    }

    if (!this.progress.isTimeUp) {
      return;
    }

    const { round, rules, totalSales, money } = this.progress;
    const summary = `통과 ${round - 1}라운드, 총 판매 ${totalSales}개, ${money}원`;

    if (this.progress.stage === 'serving') {
      this.finishGame('시간 종료!', `${round}라운드 영업 시간이 끝났어요. 실패! (${summary})`, 'fail');
      return;
    }

    if (this.isPrepGoalReached) {
      this.startServing(true);
      return;
    }

    this.prep.reset();
    this.showPrepStation(false);
    this.finishGame(
      '손질 시간 종료!',
      `${round}라운드 손질 재고 ${this.prep.totalStock} / ${rules.prepGoal}개. 실패! (${summary})`,
      'fail',
    );
  }

  finishGame(workshopMessage, resultMessage, sound) {
    this.isPlaying = false;
    this.countdown.remove();
    this.workshopMessage.setText(workshopMessage);
    this.time.delayedCall(300, () => playSound(this, sound));

    this.time.delayedCall(1200, () => {
      this.scene.start('ResultScene', { message: resultMessage });
    });
  }

  formatTime(totalSeconds) {
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');

    return `${minutes} : ${seconds}`;
  }

  updateTileStates() {
    this.tray.update(this.phase, this.prep);
  }

  onBoardClick() {
    if (!this.isPlaying) {
      return;
    }

    if (this.prep.isBusy) {
      this.pressPrep();
      return;
    }

    if (this.phase === 'prep') {
      if (this.allowsAction('prepPress')) {
        this.workshopMessage.setText('과일 그림을 클릭해 손질을 시작하세요');
        playSound(this, 'error');
      }
      return;
    }

    if (this.phase === 'serving') {
      this.pressDough();
    }
  }

  onFruitTile(fruit) {
    if (!this.isPlaying) {
      return;
    }

    if (this.phase === 'prep') {
      this.startPrep(fruit);
      return;
    }

    if (this.phase !== 'serving') {
      return;
    }

    // 영업 중에는 손질할 수 없다.
    if (!this.prep.hasStock(fruit)) {
      this.workshopMessage.setText(`손질된 ${fruit}가 없어요. 영업 중에는 손질할 수 없어요`);
      playSound(this, 'error');
      return;
    }

    this.addFruit(fruit);
  }

  showPrepStation(visible) {
    this.workbench.showPrep(visible, this.maker);
  }

  startPrep(fruit) {
    if (!this.allowsAction('prepStart', fruit)) {
      return;
    }

    if (!this.prep.start(fruit)) {
      this.workshopMessage.setText('도마의 과일 손질을 먼저 끝내세요');
      playSound(this, 'error');
      return;
    }

    const { prepStation } = this.workbench;

    this.showPrepStation(true);
    prepStation.draw(this.prep);
    prepStation.popIn();
    playSound(this, 'fruit');
    this.workshopMessage.setText(`${fruit}를 클릭해 씻어 주세요 (0/${WASH_CLICKS})`);
    this.notifyTutorial('prepStarted');
  }

  pressPrep() {
    if (!this.allowsAction('prepPress')) {
      return;
    }

    const { prepStation } = this.workbench;
    const result = this.prep.press();

    prepStation.draw(this.prep);

    if (result.action === 'wash') {
      prepStation.splash();
      playSound(this, 'wash');

      if (this.prep.step === 'cut') {
        this.workshopMessage.setText(`깨끗해졌어요! 클릭해 잘라 주세요 (0/${CUT_CLICKS})`);
        this.notifyTutorial('washed');
      } else {
        this.workshopMessage.setText(`씻는 중 (${this.prep.washCount}/${WASH_CLICKS})`);
      }
      return;
    }

    if (result.action === 'cut') {
      prepStation.chop();
      playSound(this, 'cut');
      this.workshopMessage.setText(`자르는 중 (${this.prep.cutCount}/${CUT_CLICKS})`);
      return;
    }

    const tile = this.tray.fruitTile(result.fruit);
    const { prepGoal } = this.progress.rules;
    const wasGoalReached = this.prep.totalStock - PIECES_PER_PREP >= prepGoal;

    playSound(this, 'cut');
    this.time.delayedCall(150, () => playSound(this, 'prepDone'));
    this.orderPanel.setPrepGoal(this.prep.totalStock, prepGoal);
    this.updateTileStates();
    prepStation.sendPieces(result.fruit, tile.x, tile.y - 10, () => this.tray.pop(tile));
    this.notifyTutorial('prepDone');

    if (!this.isTutorial && !wasGoalReached && this.isPrepGoalReached) {
      this.orderPanel.popGoal();
      this.workshopMessage.setText('손질 목표 달성! 더 손질하거나 [영업 시작]을 누르세요');
      return;
    }

    this.workshopMessage.setText(`손질된 ${result.fruit} +${PIECES_PER_PREP}개!`);
  }

  // 연습 안내 중에는 지금 단계에서 허용한 조작만 할 수 있다.
  allowsAction(action, fruit) {
    return !this.tutorial || this.tutorial.allows(action, fruit);
  }

  notifyTutorial(event) {
    if (this.tutorial) {
      this.tutorial.notify(event);
    }
  }

  placeDough() {
    if (!this.isPlaying || !this.allowsAction('dough')) {
      return;
    }

    if (this.phase === 'prep') {
      this.workshopMessage.setText('영업을 시작하면 모찌를 만들 수 있어요');
      playSound(this, 'error');
      return;
    }

    if (this.phase !== 'serving') {
      return;
    }

    if (!this.maker.placeDough()) {
      this.workshopMessage.setText('작업대의 반죽을 먼저 완성하세요');
      playSound(this, 'error');
      return;
    }

    playSound(this, 'doughPlace');
    this.notifyTutorial('doughPlaced');
    this.workbench.placeDough(this.maker);
    this.workshopMessage.setText(`반죽을 클릭해 밀어 주세요 (0/${ROLL_CLICKS})`);
  }

  addFruit(fruit) {
    if (!this.isPlaying || !this.allowsAction('fruit', fruit)) {
      return;
    }

    if (!this.maker.addFruit(fruit)) {
      const messages = {
        empty: '반죽부터 작업대에 올려 주세요',
        dough: `반죽을 먼저 다 밀어 주세요 (${this.maker.rollCount}/${ROLL_CLICKS})`,
        filled: '이미 과일을 올렸어요. 반죽을 클릭해 감싸 주세요',
      };

      this.workshopMessage.setText(messages[this.maker.step]);
      playSound(this, 'error');
      return;
    }

    this.prep.useStock(fruit);
    this.updateTileStates();
    this.workbench.drawStage(this.maker);
    this.workbench.squash();
    this.workshopMessage.setText(`반죽을 클릭해 과일을 감싸 주세요 (0/${WRAP_CLICKS})`);
    playSound(this, 'fruit');
    this.notifyTutorial('fruitAdded');
  }

  pressDough() {
    if (!this.isPlaying || !this.allowsAction('press')) {
      return;
    }

    const result = this.maker.pressDough();

    if (result.action === 'none') {
      this.workshopMessage.setText(
        this.maker.step === 'rolled' ? '과일 그림을 클릭해 반죽 위에 올리세요' : '반죽 그림을 클릭해 작업대에 올리세요',
      );
      playSound(this, 'error');
      return;
    }

    this.workbench.puffFlour();

    if (result.action === 'roll') {
      this.workbench.drawStage(this.maker);
      this.workbench.squash();
      this.workbench.sweepPin(this.maker);
      playSound(this, 'roll');
      this.workshopMessage.setText(
        this.maker.step === 'rolled'
          ? '반죽을 다 밀었어요! 과일 그림을 클릭하세요'
          : `반죽을 밀고 있어요 (${this.maker.rollCount}/${ROLL_CLICKS})`,
      );

      if (this.maker.step === 'rolled') {
        playSound(this, 'rollDone');
        this.notifyTutorial('rolled');
      }
      return;
    }

    if (result.action === 'wrap') {
      this.workbench.drawStage(this.maker);
      this.workbench.squash();
      this.workshopMessage.setText(`반죽으로 감싸는 중 (${this.maker.wrapCount}/${WRAP_CLICKS})`);
      playSound(this, 'wrap');
      return;
    }

    this.completeMochi(result.mochi);
  }

  // 완성한 모찌를 주문의 남은 칸에 채운다. 주문을 모두 채우면 한꺼번에 판매한다.
  completeMochi(mochi) {
    this.workbench.showMochi(mochi);
    playSound(this, 'complete');

    const index = this.order.fill(mochi);

    if (index < 0) {
      this.workshopMessage.setText(`${mochi}는 주문에 없어요. 다시 만들어 보세요`);
      this.time.delayedCall(200, () => playSound(this, 'wrong'));
      this.workbench.shakeWrong();
      this.updateSkipButton();
      return;
    }

    const slot = this.orderPanel.slotPosition(index);

    this.workbench.sendMochi(slot.x, slot.y);
    this.time.delayedCall(550, () => {
      this.orderPanel.markDone(index);
      playSound(this, 'deliver');
    });

    if (!this.order.isComplete) {
      this.workshopMessage.setText(`${mochi} 완성! 남은 주문 ${this.order.remaining.length}개`);
      return;
    }

    this.sellOrder();
  }

  sellOrder() {
    const price = this.progress.sell(this.order);
    const { roundSales, rules, money } = this.progress;

    this.moneyText.setText(`${money}원`);
    this.updateExpandButton();
    this.orderPanel.setSales(roundSales, rules.goalSales);
    this.workshopMessage.setText(`주문 완성! 판매 완료 +${price}원`);
    popText(this, this.moneyText);
    showFloatingText(this, 1115, 140, `+${price}원`);
    // 모찌가 손님에게 도착한 뒤 돈 받는 소리가 난다.
    this.time.delayedCall(700, () => playSound(this, 'sell'));

    this.notifyTutorial('sold');

    if (!this.isTutorial && this.progress.isGoalReached) {
      this.clearRound();
      return;
    }

    this.sendCustomerAway();
  }
}
