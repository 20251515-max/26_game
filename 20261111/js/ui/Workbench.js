import { FRUIT_COLORS, drawDough, drawFruitIcon, drawFruitMochi, drawRollingPin } from './CuteShapes.js';
import { PrepStation } from './PrepStation.js';
import { drawPanel, textStyle } from './Widgets.js';

const BOARD_X = 817;
const BOARD_Y = 307;
const PIN_REST_Y = BOARD_Y - 62;

// 가운데 제작 영역: 나무 작업대, 반죽·밀대 연출, 과일 손질 도마, 안내 글자
export class Workbench {
  constructor(scene, graphics, onClick) {
    this.scene = scene;

    drawPanel(graphics, 410, 165, 815, 400, 0xddeeff, 34);
    scene.add.text(817, 198, '제작 영역', textStyle(30)).setOrigin(0.5);

    // 나무 작업대
    graphics.fillStyle(0xc98a69, 1);
    graphics.fillRoundedRect(520, 244, 595, 160, 30);
    graphics.lineStyle(5, 0x5a466b, 1);
    graphics.strokeRoundedRect(520, 244, 595, 160, 30);
    graphics.fillStyle(0xe8b987, 1);
    graphics.fillRoundedRect(530, 232, 575, 150, 28);
    graphics.lineStyle(4, 0x5a466b, 1);
    graphics.strokeRoundedRect(530, 232, 575, 150, 28);

    this.workGraphics = scene.add.graphics({ x: BOARD_X, y: BOARD_Y });
    this.pinGraphics = scene.add.graphics({ x: BOARD_X, y: PIN_REST_Y }).setVisible(false);
    drawRollingPin(this.pinGraphics);
    this.prepStation = new PrepStation(scene, BOARD_X, BOARD_Y);

    this.message = scene.add.text(817, 425, '', textStyle(20, false)).setOrigin(0.5);

    const board = scene.add.zone(817, 312, 595, 172).setInteractive({ useHandCursor: true });
    board.on('pointerdown', () => onClick());
  }

  hidePin() {
    this.pinGraphics.setVisible(false);
  }

  // 도마를 보이면 반죽 작업은 잠시 숨긴다.
  showPrep(visible, maker) {
    this.prepStation.setVisible(visible);
    this.workGraphics.setVisible(!visible);
    this.pinGraphics.setVisible(!visible && maker.step === 'dough');
  }

  reset() {
    this.scene.tweens.killTweensOf(this.workGraphics);
    this.workGraphics.clear();
    this.workGraphics.setPosition(BOARD_X, BOARD_Y).setScale(1).setAlpha(1);
  }

  placeDough(maker) {
    this.reset();
    this.drawStage(maker);
    this.workGraphics.setScale(0);
    this.scene.tweens.add({ targets: this.workGraphics, scale: 1, duration: 250, ease: 'Back.easeOut' });
    this.pinGraphics.setPosition(BOARD_X, PIN_REST_Y).setVisible(true);
  }

  // 제작 단계에 맞춰 작업대 위 반죽 모양을 다시 그린다.
  drawStage(maker) {
    const graphics = this.workGraphics;
    const { step, rollCount, wrapCount, fruit } = maker;

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

  squash() {
    this.scene.tweens.killTweensOf(this.workGraphics);
    this.workGraphics.setScale(1);
    this.scene.tweens.add({ targets: this.workGraphics, scaleY: 0.85, scaleX: 1.08, duration: 80, yoyo: true });
  }

  sweepPin(maker) {
    const pin = this.pinGraphics;

    this.scene.tweens.killTweensOf(pin);
    pin.setPosition(BOARD_X - 50, BOARD_Y - 4);
    this.scene.tweens.add({
      targets: pin,
      x: BOARD_X + 50,
      duration: 150,
      yoyo: true,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        pin.setPosition(BOARD_X, PIN_REST_Y);
        pin.setVisible(maker.step === 'dough');
      },
    });
  }

  puffFlour() {
    for (let i = 0; i < 5; i += 1) {
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const puff = this.scene.add.circle(
        BOARD_X + Math.cos(angle) * 40,
        BOARD_Y + Math.sin(angle) * 20,
        Phaser.Math.Between(4, 7),
        0xffffff,
        0.9,
      );

      this.scene.tweens.add({
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

  showMochi(mochi) {
    this.reset();
    drawFruitMochi(this.workGraphics, 0, 0, mochi);
    this.workGraphics.setScale(0.7);
  }

  // 주문과 다른 모찌: 커졌다가 좌우로 흔들린다.
  shakeWrong() {
    this.scene.tweens.add({ targets: this.workGraphics, scale: 1, duration: 250, ease: 'Back.easeOut' });
    this.scene.tweens.add({
      targets: this.workGraphics,
      x: BOARD_X + 8,
      duration: 50,
      delay: 250,
      yoyo: true,
      repeat: 3,
    });
  }

  // 완성된 모찌가 통 튄 뒤 손님에게 날아간다.
  sendMochi(x, y) {
    this.scene.tweens.add({
      targets: this.workGraphics,
      scale: 1.2,
      duration: 200,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.scene.tweens.add({
          targets: this.workGraphics,
          x,
          y,
          scale: 0.4,
          alpha: 0,
          duration: 350,
          ease: 'Cubic.easeIn',
        });
      },
    });
  }
}
