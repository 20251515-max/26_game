import { PREP_TIME_SECONDS, TIME_LIMIT_SECONDS, getRoundRules } from '../config/GameRules.js';
import { playSound } from '../audio/SoundEffects.js';
import { ROLL_CLICKS, WRAP_CLICKS } from '../production/MochiMaker.js';
import { CUT_CLICKS, PIECES_PER_PREP, WASH_CLICKS } from '../production/FruitPrep.js';

export const TUTORIAL_ORDER = '딸기 모찌';
const TUTORIAL_FRUIT = '딸기';
const FIRST_ROUND = getRoundRules(1);
const OUTLINE_COLOR = 0x5a466b;
const DEPTH = 50;

// waitFor: 이 행동이 끝나야 다음 단계로 넘어간다. 없으면 [다음] 버튼으로 넘어간다.
// allow: 이 단계에서 허용하는 조작
// arrow: 화살표 끝 위치와 가리키는 방향
const STEPS = [
  {
    text: '먼저 손님이 오기 전에 과일을 손질해 둬요.\n영업이 시작되면 손질할 수 없어요!',
    target: [606, 452, 580, 102],
    arrow: [817, 558, 'up'],
  },
  {
    text: `손질할 ${TUTORIAL_FRUIT} 그림을 클릭해 도마에 올려요.`,
    target: [616, 455, 122, 96],
    arrow: [677, 558, 'up'],
    allow: 'prepStart',
    waitFor: 'prepStarted',
  },
  {
    text: `도마의 ${TUTORIAL_FRUIT}를 ${WASH_CLICKS}번 클릭해 깨끗이 씻어요.`,
    target: [515, 227, 605, 182],
    arrow: [950, 307, 'left'],
    allow: 'prepPress',
    waitFor: 'washed',
  },
  {
    text: `이번엔 ${CUT_CLICKS}번 클릭해 잘라요.\n손질된 ${TUTORIAL_FRUIT} ${PIECES_PER_PREP}개가 생겨요!`,
    target: [515, 227, 605, 182],
    arrow: [950, 307, 'left'],
    allow: 'prepPress',
    waitFor: 'prepDone',
  },
  {
    text: '과일 칸의 분홍 숫자가 손질된 과일 개수예요.\n준비됐으면 [영업 시작]을 눌러요!',
    target: [92, 454, 236, 72],
    arrow: [332, 486, 'left'],
    allow: 'call',
    waitFor: 'customerCalled',
  },
  {
    text: `손님이 원하는 모찌가 여기에 나와요.\n지금 손님은 ${TUTORIAL_ORDER}를 원해요!`,
    target: [48, 158, 324, 414],
    arrow: [210, 156, 'down'],
  },
  {
    text: '먼저 찹쌀 반죽 그림을 클릭해 작업대에 올려요.',
    target: [476, 455, 122, 96],
    arrow: [537, 558, 'up'],
    allow: 'dough',
    waitFor: 'doughPlaced',
  },
  {
    text: `작업대의 반죽을 ${ROLL_CLICKS}번 클릭해 납작하게 밀어요.`,
    target: [515, 227, 605, 182],
    arrow: [950, 307, 'left'],
    allow: 'press',
    waitFor: 'rolled',
  },
  {
    text: `주문과 같은 과일을 골라요. ${TUTORIAL_FRUIT} 그림을 클릭!`,
    target: [616, 455, 122, 96],
    arrow: [677, 558, 'up'],
    allow: 'fruit',
    waitFor: 'fruitAdded',
  },
  {
    text: `반죽을 ${WRAP_CLICKS}번 더 클릭해 ${TUTORIAL_FRUIT}를 감싸요.\n완성되면 손님에게 바로 팔려요!`,
    target: [515, 227, 605, 182],
    arrow: [950, 307, 'left'],
    allow: 'press',
    waitFor: 'sold',
  },
  {
    text: '판매 성공! 번 돈은 보유 금액에 쌓여요.',
    target: [1000, 27, 230, 102],
    arrow: [1115, 136, 'up'],
  },
  {
    text: `실전 라운드는 먼저 손질 시간이에요. ${PREP_TIME_SECONDS}초 안에\n손질 재고 ${FIRST_ROUND.prepGoal}개를 만들지 못하면 실패!`,
    target: [800, 27, 190, 102],
    arrow: [895, 136, 'up'],
  },
  {
    text: `다음은 영업 시간이에요. 손님이 계속 와요.\n${TIME_LIMIT_SECONDS}초 안에 모찌 ${FIRST_ROUND.goalSales}개를 팔면 다음 라운드로!`,
    target: [75, 518, 270, 44],
    arrow: [352, 540, 'left'],
  },
  {
    text: '라운드가 오를수록 손님이 줄을 서고, 여러 개를 주문해요.\n왼쪽 게이지가 다 줄면 손님이 떠나니 서둘러요!',
    target: [48, 158, 324, 414],
    arrow: [210, 156, 'down'],
  },
  {
    text: '주문한 과일이 모자라면 [다음 손님]을 눌러\n손님을 넘겨요. 그러니 넉넉히 손질해 둬요!',
    target: [92, 454, 236, 72],
    arrow: [332, 486, 'left'],
  },
  {
    text: '[다음]을 누르면 실전처럼 손질부터 다시 연습해요.\n시간 제한은 없고, 언제든 [실전 시작]을 누를 수 있어요!',
    target: [862, 592, 236, 84],
    arrow: [1104, 630, 'left'],
  },
];

export class TutorialGuide {
  constructor(scene) {
    this.scene = scene;
    this.stepIndex = -1;
    this.isDone = false;
    this.createPanel();
    this.highlight = scene.add.graphics().setDepth(DEPTH);
    this.arrow = scene.add.graphics().setDepth(DEPTH);
    this.drawArrow();
    scene.tweens.add({
      targets: this.highlight,
      alpha: 0.35,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });
  }

  start() {
    this.goToStep(0);
  }

  get step() {
    return STEPS[this.stepIndex];
  }

  // 지금 단계에서 해도 되는 조작인지 확인한다. 막힌 조작이면 안내 창을 흔들어 알려 준다.
  allows(action, fruit) {
    if (this.isDone) {
      return true;
    }

    const needsFruit = action === 'fruit' || action === 'prepStart';

    if (this.step.allow === action && (!needsFruit || fruit === TUTORIAL_FRUIT)) {
      return true;
    }

    if (this.step.allow === 'fruit' && action === 'fruit') {
      this.scene.workshopMessage.setText(`주문은 ${TUTORIAL_ORDER}예요. ${TUTORIAL_FRUIT}를 골라 주세요`);
    }

    if (this.step.allow === 'prepStart' && action === 'prepStart') {
      this.scene.workshopMessage.setText(`이번엔 ${TUTORIAL_FRUIT}를 손질해 봐요`);
    }

    playSound(this.scene, 'error');
    this.nudgePanel();
    return false;
  }

  notify(event) {
    if (this.isDone || this.step.waitFor !== event) {
      return;
    }

    // 판매 애니메이션을 볼 수 있게 잠깐 기다렸다 넘어간다.
    const delay = event === 'sold' ? 700 : 150;

    this.scene.time.delayedCall(delay, () => this.goToStep(this.stepIndex + 1));
  }

  goToStep(index) {
    if (index >= STEPS.length) {
      this.finish();
      return;
    }

    this.stepIndex = index;
    this.text.setText(this.step.text);
    this.nextButton.setVisible(!this.step.waitFor);
    this.nextZone.setVisible(!this.step.waitFor);
    this.drawHighlight(this.step.target);
    this.placeArrow(this.step.arrow);
    this.panel.setScale(0.95);
    this.scene.tweens.add({ targets: this.panel, scale: 1, duration: 200, ease: 'Back.easeOut' });
  }

  finish() {
    this.isDone = true;
    this.scene.tweens.killTweensOf([this.highlight, this.arrow]);
    [this.panel, this.nextZone, this.highlight, this.arrow].forEach((item) => item.destroy());
    this.scene.startFreePractice();
  }

  createPanel() {
    const { scene } = this;
    const background = scene.add.graphics();

    background.fillStyle(0xffffff, 1);
    background.fillRoundedRect(0, 0, 800, 104, 26);
    background.lineStyle(4, OUTLINE_COLOR, 1);
    background.strokeRoundedRect(0, 0, 800, 104, 26);
    background.fillStyle(0xffdde7, 1);
    background.fillRoundedRect(16, 16, 72, 72, 20);
    background.lineStyle(3, OUTLINE_COLOR, 1);
    background.strokeRoundedRect(16, 16, 72, 72, 20);

    const badge = scene.add.text(52, 52, '연습', {
      color: '#5a466b',
      fontFamily: 'sans-serif',
      fontSize: '22px',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.text = scene.add.text(108, 52, '', {
      color: '#5a466b',
      fontFamily: 'sans-serif',
      fontSize: '21px',
      lineSpacing: 6,
      wordWrap: { width: 540 },
    }).setOrigin(0, 0.5);

    const nextGraphics = scene.add.graphics();

    nextGraphics.fillStyle(0xc98aa2, 1);
    nextGraphics.fillRoundedRect(662, 30, 118, 52, 20);
    nextGraphics.fillStyle(0xffa9c0, 1);
    nextGraphics.fillRoundedRect(662, 22, 118, 52, 20);
    nextGraphics.lineStyle(4, OUTLINE_COLOR, 1);
    nextGraphics.strokeRoundedRect(662, 22, 118, 52, 20);

    const nextLabel = scene.add.text(721, 48, '다음', {
      color: '#ffffff',
      fontFamily: 'sans-serif',
      fontSize: '22px',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.nextButton = scene.add.container(0, 0, [nextGraphics, nextLabel]);
    this.panel = scene.add.container(40, 604, [background, badge, this.text, this.nextButton])
      .setDepth(DEPTH);

    this.nextZone = scene.add.zone(40 + 721, 604 + 52, 118, 60)
      .setInteractive({ useHandCursor: true })
      .setDepth(DEPTH);
    this.nextZone.on('pointerdown', () => {
      if (!this.step.waitFor) {
        playSound(this.scene, 'next');
        this.goToStep(this.stepIndex + 1);
      }
    });
  }

  drawHighlight([x, y, width, height]) {
    this.highlight.clear();
    this.highlight.lineStyle(6, 0xff6f8e, 1);
    this.highlight.strokeRoundedRect(x, y, width, height, 30);
  }

  // 아래를 가리키는 화살표를 (0, 0)이 끝이 되도록 그린다.
  drawArrow() {
    this.arrow.fillStyle(0xffd86b, 1);
    this.arrow.fillRoundedRect(-9, -44, 18, 26, 6);
    this.arrow.lineStyle(3, OUTLINE_COLOR, 1);
    this.arrow.strokeRoundedRect(-9, -44, 18, 26, 6);
    this.arrow.fillTriangle(-20, -22, 20, -22, 0, 0);
    this.arrow.strokeTriangle(-20, -22, 20, -22, 0, 0);
  }

  placeArrow([x, y, direction]) {
    const rotations = { down: 0, up: Math.PI, left: Math.PI / 2 };
    const offsets = { down: [0, -8], up: [0, 8], left: [8, 0] };
    const [dx, dy] = offsets[direction];

    this.scene.tweens.killTweensOf(this.arrow);
    this.arrow.setPosition(x, y).setRotation(rotations[direction]);
    this.scene.tweens.add({
      targets: this.arrow,
      x: x + dx,
      y: y + dy,
      duration: 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  nudgePanel() {
    this.scene.tweens.add({
      targets: this.panel,
      x: 48,
      duration: 50,
      yoyo: true,
      repeat: 2,
      onComplete: () => this.panel.setX(40),
    });
  }
}
