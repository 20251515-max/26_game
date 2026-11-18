import { GOAL_SALES, MOCHI_PRICES, TIME_LIMIT_SECONDS } from '../config/GameRules.js';
import { createInitialOrder, createNextOrder, getMochiColor } from '../orders/Order.js';
import { FRUIT_INGREDIENTS, MochiMaker, ROLL_CLICKS, WRAP_CLICKS } from '../production/MochiMaker.js';
import {
  FRUIT_COLORS,
  drawCustomer,
  drawDough,
  drawDrop,
  drawFruitIcon,
  drawHeart,
  drawRollingPin,
  drawStar,
} from '../ui/CuteShapes.js';
import { TUTORIAL_ORDER, TutorialGuide } from '../tutorial/TutorialGuide.js';
import { playSound } from '../audio/SoundEffects.js';

const BOARD_X = 817;
const BOARD_Y = 307;
const PIN_REST_Y = BOARD_Y - 62;
const CUSTOMER_X = 210;
const CUSTOMER_Y = 262;
const CUSTOMER_FACE_COLORS = [0xffe6cc, 0xfff0e0, 0xf9dcc8];
const CUSTOMER_BOW_COLORS = [0xffa9c0, 0x9fd0ff, 0x9ed99a, 0xc6b3ff];

export class PlayScene extends Phaser.Scene {
  constructor() {
    super('PlayScene');
  }

  init(data) {
    this.isTutorial = Boolean(data && data.tutorial);
  }

  create() {
    const background = this.add.graphics();

    this.maker = new MochiMaker();
    this.money = 0;
    this.salesCount = 0;

    background.fillStyle(0xfff9ee, 1);
    background.fillRect(0, 0, 1280, 720);
    background.fillStyle(0xddeeff, 1);
    background.fillCircle(1160, 95, 180);
    background.fillStyle(0xddf3dd, 1);
    background.fillCircle(120, 650, 200);
    this.createBackgroundDecorations();

    const graphics = this.add.graphics();

    this.isPlaying = true;
    this.remainingSeconds = TIME_LIMIT_SECONDS;
    this.timeText = this.createStatusCard(graphics, 805, 32, 180, 92, 0xe8dfff, '남은 시간',
      this.isTutorial ? '연습' : this.formatTime(this.remainingSeconds),
    );
    this.moneyText = this.createStatusCard(graphics, 1005, 32, 220, 92, 0xffdde7, '보유 금액', '0원');
    this.createOrderPanel(graphics);
    this.createWorkshop(graphics);
    this.createIngredientTray(graphics);

    this.add.text(640, 62, '모찌 공장', {
      color: '#5a466b',
      fontFamily: 'sans-serif',
      fontSize: '40px',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(640, 115, this.isTutorial ? '연습 모드 - 천천히 따라 해 보세요!' : '주문에 맞는 모찌를 만들어 보세요!', {
      color: '#5a466b',
      fontFamily: 'sans-serif',
      fontSize: '22px',
    }).setOrigin(0.5);

    if (this.isTutorial) {
      this.createButton(870, 600, 220, 60, 0x8fd48a, '실전 시작', () => {
        this.scene.start('PlayScene', { tutorial: false });
      });
      this.showOrder(TUTORIAL_ORDER);
      this.tutorial = new TutorialGuide(this);
      this.tutorial.start();
      return;
    }

    this.tutorial = null;
    this.createButton(870, 600, 220, 60, 0xffa9c0, '결과 화면 보기', () => {
      this.scene.start('ResultScene', { message: '이번 판이 끝났습니다.' });
    });

    this.showOrder(createInitialOrder());

    this.countdown = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => this.tickTime(),
    });
  }

  tickTime() {
    this.remainingSeconds -= 1;
    this.timeText.setText(this.formatTime(this.remainingSeconds));

    if (this.remainingSeconds <= 10 && this.remainingSeconds > 0) {
      this.popText(this.timeText);
      playSound(this, 'tick');
    }

    if (this.remainingSeconds <= 0) {
      this.finishGame('시간 종료!', `시간이 끝났어요. 실패! (판매 ${this.salesCount}개, ${this.money}원)`, 'fail');
    }
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

  createBackgroundDecorations() {
    const decorations = [
      [drawHeart, 60, 60, 26, 0xffb8cb],
      [drawStar, 160, 128, 24, 0xffe08a],
      [drawDrop, 300, 50, 22, 0xa9d4ff],
      [drawHeart, 430, 135, 18, 0xffb8cb],
      [drawStar, 760, 140, 18, 0xffe08a],
      [drawStar, 100, 620, 26, 0xffe08a],
      [drawHeart, 270, 668, 24, 0xffb8cb],
      [drawDrop, 450, 618, 22, 0xa9d4ff],
      [drawStar, 640, 680, 20, 0xffe08a],
      [drawHeart, 770, 622, 20, 0xffb8cb],
      [drawStar, 1170, 640, 24, 0xffe08a],
      [drawDrop, 1240, 688, 20, 0xa9d4ff],
    ];

    decorations.forEach(([draw, x, y, size, color]) => {
      const shape = this.add.graphics({ x, y }).setAlpha(0.85);

      draw(shape, size, color);
      this.tweens.add({
        targets: shape,
        y: y - 6,
        duration: Phaser.Math.Between(1500, 2300),
        delay: Phaser.Math.Between(0, 800),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    });
  }

  createStatusCard(graphics, x, y, width, height, color, label, value) {
    this.drawPanel(graphics, x, y, width, height, color, 24);
    this.add.text(x + width / 2, y + 28, label, {
      color: '#5a466b',
      fontFamily: 'sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    return this.add.text(x + width / 2, y + 63, value, {
      color: '#5a466b',
      fontFamily: 'sans-serif',
      fontSize: '27px',
      fontStyle: 'bold',
    }).setOrigin(0.5);
  }

  createOrderPanel(graphics) {
    this.drawPanel(graphics, 55, 165, 310, 400, 0xfff1b8, 34);
    this.add.text(210, 196, '손님 주문', {
      color: '#5a466b',
      fontFamily: 'sans-serif',
      fontSize: '30px',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // 손님 말풍선
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRoundedRect(92, 308, 236, 146, 28);
    graphics.lineStyle(4, 0x5a466b, 1);
    graphics.strokeRoundedRect(92, 308, 236, 146, 28);
    graphics.fillTriangle(198, 311, 222, 311, 210, 298);
    graphics.lineBetween(198, 308, 210, 298);
    graphics.lineBetween(210, 298, 222, 308);

    this.customerGraphics = this.add.graphics({ x: CUSTOMER_X, y: CUSTOMER_Y });
    this.tweens.add({
      targets: this.customerGraphics,
      y: CUSTOMER_Y - 5,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.orderMochiGraphics = this.add.graphics({ x: 210, y: 368 });
    this.orderNameText = this.add.text(210, 432, '', {
      color: '#5a466b',
      fontFamily: 'sans-serif',
      fontSize: '28px',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.orderPriceText = this.add.text(210, 490, '', {
      color: '#5a466b',
      fontFamily: 'sans-serif',
      fontSize: '26px',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.salesText = this.add.text(210, 530, `목표 판매 0 / ${GOAL_SALES}개`, {
      color: '#5a466b',
      fontFamily: 'sans-serif',
      fontSize: '21px',
    }).setOrigin(0.5);
  }

  showOrder(order) {
    this.order = order;

    this.customerGraphics.clear();
    drawCustomer(
      this.customerGraphics,
      Phaser.Utils.Array.GetRandom(CUSTOMER_FACE_COLORS),
      Phaser.Utils.Array.GetRandom(CUSTOMER_BOW_COLORS),
    );
    this.orderMochiGraphics.clear();
    this.drawFruitMochi(this.orderMochiGraphics, 0, 0, order);
    this.orderNameText.setText(order);
    this.orderPriceText.setText(`판매가 ${MOCHI_PRICES[order]}원`);

    this.customerGraphics.setScale(0);
    this.orderMochiGraphics.setScale(0);
    this.tweens.add({ targets: this.customerGraphics, scale: 1, duration: 350, ease: 'Back.easeOut' });
    this.tweens.add({ targets: this.orderMochiGraphics, scale: 1, duration: 350, delay: 120, ease: 'Back.easeOut' });
  }

  formatTime(totalSeconds) {
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');

    return `${minutes} : ${seconds}`;
  }

  createWorkshop(graphics) {
    this.drawPanel(graphics, 410, 165, 815, 400, 0xddeeff, 34);
    this.add.text(817, 198, '제작 영역', {
      color: '#5a466b',
      fontFamily: 'sans-serif',
      fontSize: '30px',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // 나무 작업대
    graphics.fillStyle(0xc98a69, 1);
    graphics.fillRoundedRect(520, 244, 595, 160, 30);
    graphics.lineStyle(5, 0x5a466b, 1);
    graphics.strokeRoundedRect(520, 244, 595, 160, 30);
    graphics.fillStyle(0xe8b987, 1);
    graphics.fillRoundedRect(530, 232, 575, 150, 28);
    graphics.lineStyle(4, 0x5a466b, 1);
    graphics.strokeRoundedRect(530, 232, 575, 150, 28);

    this.workGraphics = this.add.graphics({ x: BOARD_X, y: BOARD_Y });
    this.pinGraphics = this.add.graphics({ x: BOARD_X, y: PIN_REST_Y }).setVisible(false);
    drawRollingPin(this.pinGraphics);

    this.workshopMessage = this.add.text(817, 425, '반죽 그림을 클릭해 작업대에 올리세요', {
      color: '#5a466b',
      fontFamily: 'sans-serif',
      fontSize: '20px',
    }).setOrigin(0.5);

    const board = this.add.zone(817, 312, 595, 172).setInteractive({ useHandCursor: true });
    board.on('pointerdown', () => this.pressDough());
  }

  createIngredientTray(graphics) {
    graphics.fillStyle(0xfff1b8, 1);
    graphics.fillRoundedRect(445, 452, 745, 102, 26);
    graphics.lineStyle(4, 0x5a466b, 1);
    graphics.strokeRoundedRect(445, 452, 745, 102, 26);

    this.createIngredientTile(537, '찹쌀 반죽', (icon) => drawDough(icon, 0, 0, 52, 42), () => {
      this.placeDough();
    });

    FRUIT_INGREDIENTS.forEach((fruit, index) => {
      this.createIngredientTile(677 + index * 140, fruit, (icon) => drawFruitIcon(icon, fruit, 0, 0, 20), () => {
        this.addFruit(fruit);
      });
    });
  }

  createIngredientTile(x, label, drawIcon, onClick) {
    const tile = this.add.graphics();
    const icon = this.add.graphics({ x: 0, y: -10 });
    const text = this.add.text(0, 26, label, {
      color: '#5a466b',
      fontFamily: 'sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    tile.fillStyle(0xffffff, 1);
    tile.fillRoundedRect(-55, -42, 110, 84, 22);
    tile.lineStyle(3, 0x5a466b, 1);
    tile.strokeRoundedRect(-55, -42, 110, 84, 22);
    drawIcon(icon);

    const container = this.add.container(x, 503, [tile, icon, text]);
    const zone = this.add.zone(x, 503, 110, 84).setInteractive({ useHandCursor: true });

    zone.on('pointerover', () => container.setScale(1.06));
    zone.on('pointerout', () => container.setScale(1));
    zone.on('pointerdown', () => {
      this.tweens.add({ targets: container, scale: 0.92, duration: 70, yoyo: true });
      onClick();
    });
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

    if (!this.maker.placeDough()) {
      this.workshopMessage.setText('작업대의 반죽을 먼저 완성하세요');
      playSound(this, 'error');
      return;
    }

    playSound(this, 'doughPlace');
    this.notifyTutorial('doughPlaced');
    this.resetWorkGraphics();
    this.drawWorkStage();
    this.workGraphics.setScale(0);
    this.tweens.add({ targets: this.workGraphics, scale: 1, duration: 250, ease: 'Back.easeOut' });
    this.pinGraphics.setPosition(BOARD_X, PIN_REST_Y).setVisible(true);
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

    this.drawWorkStage();
    this.squashDough();
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

    this.puffFlour();

    if (result.action === 'roll') {
      this.drawWorkStage();
      this.squashDough();
      this.sweepPin();
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
      this.drawWorkStage();
      this.squashDough();
      this.workshopMessage.setText(`반죽으로 감싸는 중 (${this.maker.wrapCount}/${WRAP_CLICKS})`);
      playSound(this, 'wrap');
      return;
    }

    this.completeMochi(result.mochi);
  }

  // 제작 단계에 맞춰 작업대 위 반죽 모양을 다시 그린다.
  drawWorkStage() {
    const graphics = this.workGraphics;
    const { step, rollCount, wrapCount, fruit } = this.maker;

    graphics.clear();

    if (step === 'dough' || step === 'rolled') {
      drawDough(graphics, 0, 0, 80 + rollCount * 40, 80 - rollCount * 14);
    }

    if (step === 'filled' && wrapCount === 0) {
      drawDough(graphics, 0, 0, 200, 38);
      drawFruitIcon(graphics, fruit, 0, -16, 24);
    }

    if (step === 'filled' && wrapCount === 1) {
      drawFruitIcon(graphics, fruit, 0, -18, 22);
      drawDough(graphics, 0, 8, 160, 50);
    }

    if (step === 'filled' && wrapCount === 2) {
      drawDough(graphics, 0, 0, 110, 88);
      graphics.fillStyle(FRUIT_COLORS[fruit], 1);
      graphics.fillCircle(0, -30, 10);
      graphics.lineStyle(3, 0x5a466b, 1);
      graphics.strokeCircle(0, -30, 10);
    }
  }

  resetWorkGraphics() {
    this.tweens.killTweensOf(this.workGraphics);
    this.workGraphics.clear();
    this.workGraphics.setPosition(BOARD_X, BOARD_Y).setScale(1).setAlpha(1);
  }

  squashDough() {
    this.tweens.killTweensOf(this.workGraphics);
    this.workGraphics.setScale(1);
    this.tweens.add({ targets: this.workGraphics, scaleY: 0.85, scaleX: 1.08, duration: 80, yoyo: true });
  }

  sweepPin() {
    const pin = this.pinGraphics;

    this.tweens.killTweensOf(pin);
    pin.setPosition(BOARD_X - 50, BOARD_Y - 4);
    this.tweens.add({
      targets: pin,
      x: BOARD_X + 50,
      duration: 150,
      yoyo: true,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        pin.setPosition(BOARD_X, PIN_REST_Y);
        pin.setVisible(this.maker.step === 'dough');
      },
    });
  }

  puffFlour() {
    for (let i = 0; i < 5; i += 1) {
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const puff = this.add.circle(
        BOARD_X + Math.cos(angle) * 40,
        BOARD_Y + Math.sin(angle) * 20,
        Phaser.Math.Between(4, 7),
        0xffffff,
        0.9,
      );

      this.tweens.add({
        targets: puff,
        x: puff.x + Math.cos(angle) * 40,
        y: puff.y + Math.sin(angle) * 25 - 10,
        alpha: 0,
        scale: 0.5,
        duration: 400,
        onComplete: () => puff.destroy(),
      });
    }
  }

  completeMochi(mochi) {
    this.resetWorkGraphics();
    this.drawFruitMochi(this.workGraphics, 0, 0, mochi);
    this.workGraphics.setScale(0.7);
    playSound(this, 'complete');

    if (mochi !== this.order) {
      this.workshopMessage.setText(`${mochi}는 주문과 달라요. 다시 만들어 보세요`);
      this.time.delayedCall(200, () => playSound(this, 'wrong'));
      this.tweens.add({ targets: this.workGraphics, scale: 1, duration: 250, ease: 'Back.easeOut' });
      this.tweens.add({
        targets: this.workGraphics,
        x: BOARD_X + 8,
        duration: 50,
        delay: 250,
        yoyo: true,
        repeat: 3,
      });
      return;
    }

    this.sellMochi(mochi);
  }

  sellMochi(mochi) {
    const price = MOCHI_PRICES[mochi];

    this.money += price;
    this.salesCount += 1;
    this.moneyText.setText(`${this.money}원`);
    this.salesText.setText(`목표 판매 ${this.salesCount} / ${GOAL_SALES}개`);
    this.workshopMessage.setText(`${mochi} 판매 완료! +${price}원`);
    this.popText(this.moneyText);
    this.showFloatingText(1115, 140, `+${price}원`);
    this.time.delayedCall(150, () => playSound(this, 'sell'));

    // 완성된 모찌가 통 튄 뒤 손님에게 날아간다.
    this.tweens.add({
      targets: this.workGraphics,
      scale: 1.2,
      duration: 200,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: this.workGraphics,
          x: CUSTOMER_X,
          y: CUSTOMER_Y,
          scale: 0.4,
          alpha: 0,
          duration: 350,
          ease: 'Cubic.easeIn',
        });
      },
    });

    this.notifyTutorial('sold');

    if (!this.isTutorial && this.salesCount >= GOAL_SALES) {
      this.popText(this.salesText);
      this.finishGame(
        `목표 ${GOAL_SALES}개 달성!`,
        `목표 달성! 성공! (판매 ${this.salesCount}개, ${this.money}원)`,
        'success',
      );
      return;
    }

    this.time.delayedCall(500, () => playSound(this, 'customer'));
    this.showOrder(createNextOrder(this.order));
  }

  popText(text) {
    this.tweens.killTweensOf(text);
    text.setScale(1);
    this.tweens.add({ targets: text, scale: 1.25, duration: 120, yoyo: true, ease: 'Back.easeOut' });
  }

  showFloatingText(x, y, message) {
    const text = this.add.text(x, y, message, {
      color: '#5a466b',
      fontFamily: 'sans-serif',
      fontSize: '26px',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: text,
      y: y - 40,
      alpha: 0,
      duration: 800,
      ease: 'Cubic.easeOut',
      onComplete: () => text.destroy(),
    });
  }

  drawFruitMochi(graphics, x, y, order) {
    graphics.fillStyle(getMochiColor(order), 1);
    graphics.fillCircle(x, y, 48);
    graphics.lineStyle(4, 0x5a466b, 1);
    graphics.strokeCircle(x, y, 48);

    if (order === '딸기 모찌') {
      graphics.fillStyle(0x5a466b, 1);
      [-17, 0, 17].forEach((seedX) => graphics.fillCircle(x + seedX, y + 10, 3));
      graphics.fillStyle(0x70b66b, 1);
      graphics.fillTriangle(x - 20, y - 35, x, y - 56, x + 6, y - 27);
      graphics.fillTriangle(x - 6, y - 27, x + 18, y - 50, x + 22, y - 24);
    }

    if (order === '포도 모찌') {
      graphics.fillStyle(0x8767c3, 1);
      [[-13, -9], [13, -9], [0, 9], [-13, 18], [13, 18]].forEach(([grapeX, grapeY]) => {
        graphics.fillCircle(x + grapeX, y + grapeY, 11);
      });
      graphics.fillStyle(0x70b66b, 1);
      graphics.fillTriangle(x - 4, y - 40, x + 14, y - 55, x + 15, y - 30);
    }

    if (order === '복숭아 모찌') {
      graphics.fillStyle(0xff8d9e, 1);
      graphics.fillCircle(x - 17, y + 9, 12);
      graphics.fillCircle(x + 17, y + 9, 12);
      graphics.fillStyle(0x70b66b, 1);
      graphics.fillTriangle(x - 3, y - 41, x + 20, y - 54, x + 13, y - 27);
    }

    if (order === '망고 모찌') {
      graphics.fillStyle(0xffb942, 1);
      graphics.fillEllipse(x, y + 6, 49, 57);
      graphics.lineStyle(3, 0xe5972d, 1);
      graphics.strokeEllipse(x, y + 6, 49, 57);
      graphics.fillStyle(0x70b66b, 1);
      graphics.fillTriangle(x - 2, y - 37, x + 21, y - 54, x + 13, y - 25);
    }
  }

  // 누르면 버튼 면이 내려가 아래 그림자가 줄어든다.
  createButton(x, y, width, height, color, label, onClick) {
    const shadow = this.add.graphics();
    const faceGraphics = this.add.graphics();
    const text = this.add.text(width / 2, height / 2, label, {
      color: '#ffffff',
      fontFamily: 'sans-serif',
      fontSize: '19px',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    const face = this.add.container(x, y, [faceGraphics, text]);

    shadow.fillStyle(0xc98aa2, 1);
    shadow.fillRoundedRect(x, y + 10, width, height, 24);
    faceGraphics.fillStyle(color, 1);
    faceGraphics.fillRoundedRect(0, 0, width, height, 24);
    faceGraphics.lineStyle(4, 0x5a466b, 1);
    faceGraphics.strokeRoundedRect(0, 0, width, height, 24);

    const button = this.add.zone(x + width / 2, y + height / 2 + 5, width, height + 10)
      .setInteractive({ useHandCursor: true });
    button.on('pointerdown', () => {
      face.y = y + 6;
      playSound(this, 'button');
      onClick();
    });
    button.on('pointerup', () => {
      face.y = y;
    });
    button.on('pointerout', () => {
      face.y = y;
    });
  }

  drawPanel(graphics, x, y, width, height, color, radius) {
    graphics.fillStyle(color, 1);
    graphics.fillRoundedRect(x, y, width, height, radius);
    graphics.lineStyle(5, 0x5a466b, 1);
    graphics.strokeRoundedRect(x, y, width, height, radius);
  }
}
