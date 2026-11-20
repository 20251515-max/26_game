import { WASH_CLICKS } from '../production/FruitPrep.js';
import { drawCuttingBoard, drawFruitIcon, drawKnife } from './CuteShapes.js';

// 흙 자국 위치 (씻을수록 줄어든다)
const DIRT_SPOTS = [[-22, -12], [18, -20], [-6, 18], [24, 12], [-26, 14], [6, -28]];

// 작업대 위 도마에서 과일을 씻고 자르는 모습을 그린다.
export class PrepStation {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.knifeRestX = x + 100;
    this.knifeRestY = y + 10;

    this.board = scene.add.graphics({ x, y });
    drawCuttingBoard(this.board);
    this.fruitGraphics = scene.add.graphics({ x, y });
    this.knife = scene.add.graphics({ x: this.knifeRestX, y: this.knifeRestY });
    drawKnife(this.knife);
    this.setVisible(false);
  }

  setVisible(visible) {
    this.board.setVisible(visible);
    this.fruitGraphics.setVisible(visible);

    if (!visible) {
      this.knife.setVisible(false);
    }
  }

  draw(prep) {
    const graphics = this.fruitGraphics;

    graphics.clear();
    this.knife.setVisible(prep.step === 'cut');

    if (prep.step === 'empty') {
      return;
    }

    drawFruitIcon(graphics, prep.fruit, 0, 0, 40);

    if (prep.step === 'wash') {
      const dirtLeft = Math.ceil(DIRT_SPOTS.length * (1 - prep.washCount / WASH_CLICKS));

      graphics.fillStyle(0x9b6b4a, 0.8);
      DIRT_SPOTS.slice(0, dirtLeft).forEach(([dx, dy]) => graphics.fillCircle(dx, dy, 4));
    }

    if (prep.step === 'cut') {
      // 깨끗해진 반짝임
      graphics.fillStyle(0xffffff, 1);
      graphics.fillEllipse(36, -36, 6, 22);
      graphics.fillEllipse(36, -36, 22, 6);
      graphics.fillCircle(-36, -24, 4);

      if (prep.cutCount > 0) {
        graphics.lineStyle(5, 0xffffff, 1);
        graphics.lineBetween(0, -40, 0, 40);
        graphics.lineStyle(2, 0x5a466b, 1);
        graphics.lineBetween(-3, -40, -3, 40);
      }
    }
  }

  popIn() {
    this.fruitGraphics.setScale(0);
    this.scene.tweens.add({ targets: this.fruitGraphics, scale: 1, duration: 250, ease: 'Back.easeOut' });
  }

  splash() {
    for (let i = 0; i < 6; i += 1) {
      const bubble = this.scene.add.circle(
        this.x + Phaser.Math.Between(-45, 45),
        this.y + Phaser.Math.Between(-10, 30),
        Phaser.Math.Between(4, 9),
        0xa9d4ff,
        0.9,
      ).setStrokeStyle(2, 0x5a466b, 0.6);

      this.scene.tweens.add({
        targets: bubble,
        y: bubble.y - Phaser.Math.Between(40, 70),
        alpha: 0,
        duration: Phaser.Math.Between(400, 600),
        onComplete: () => bubble.destroy(),
      });
    }

    this.wobble();
  }

  chop() {
    const { knife } = this;

    this.scene.tweens.killTweensOf(knife);
    knife.setPosition(this.x, this.y - 30);
    this.scene.tweens.add({
      targets: knife,
      y: this.y + 30,
      duration: 90,
      yoyo: true,
      onComplete: () => knife.setPosition(this.knifeRestX, this.knifeRestY),
    });
    this.wobble();
  }

  wobble() {
    this.scene.tweens.killTweensOf(this.fruitGraphics);
    this.fruitGraphics.setScale(1);
    this.scene.tweens.add({ targets: this.fruitGraphics, scaleX: 1.1, scaleY: 0.9, duration: 80, yoyo: true });
  }

  // 손질된 과일 조각 두 개가 재료 칸으로 날아간다.
  sendPieces(fruit, targetX, targetY, onArrive) {
    [-28, 28].forEach((dx, index) => {
      const piece = this.scene.add.graphics({ x: this.x + dx, y: this.y });

      drawFruitIcon(piece, fruit, 0, 0, 24);
      this.scene.tweens.add({
        targets: piece,
        x: targetX,
        y: targetY,
        scale: 0.5,
        duration: 450,
        delay: index * 90,
        ease: 'Cubic.easeIn',
        onComplete: () => {
          piece.destroy();

          if (index === 1) {
            onArrive();
          }
        },
      });
    });
  }
}
