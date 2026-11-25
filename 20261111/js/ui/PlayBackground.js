import { drawDrop, drawHeart, drawStar } from './CuteShapes.js';

const DECORATIONS = [
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

// 크림색 바탕과 둥실거리는 하트·별·물방울 장식
export function drawPlayBackground(scene) {
  const background = scene.add.graphics();

  background.fillStyle(0xfff9ee, 1);
  background.fillRect(0, 0, 1280, 720);
  background.fillStyle(0xddeeff, 1);
  background.fillCircle(1160, 95, 180);
  background.fillStyle(0xddf3dd, 1);
  background.fillCircle(120, 650, 200);

  DECORATIONS.forEach(([draw, x, y, size, color]) => {
    const shape = scene.add.graphics({ x, y }).setAlpha(0.85);

    draw(shape, size, color);
    scene.tweens.add({
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
