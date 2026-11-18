const OUTLINE_COLOR = 0x5a466b;

// 모든 도형은 graphics의 (0, 0)을 중심으로 그린다.

export function drawCustomer(graphics, faceColor, bowColor) {
  graphics.fillStyle(faceColor, 1);
  graphics.fillCircle(0, 0, 34);
  graphics.lineStyle(4, OUTLINE_COLOR, 1);
  graphics.strokeCircle(0, 0, 34);

  graphics.fillStyle(OUTLINE_COLOR, 1);
  graphics.fillCircle(-12, -3, 4.5);
  graphics.fillCircle(12, -3, 4.5);
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(-10.5, -4.5, 1.6);
  graphics.fillCircle(13.5, -4.5, 1.6);

  graphics.fillStyle(0xffa9c0, 0.8);
  graphics.fillEllipse(-21, 9, 12, 7);
  graphics.fillEllipse(21, 9, 12, 7);

  graphics.lineStyle(3, OUTLINE_COLOR, 1);
  graphics.beginPath();
  graphics.arc(0, 6, 6, Math.PI * 0.15, Math.PI * 0.85, false);
  graphics.strokePath();

  graphics.fillStyle(bowColor, 1);
  graphics.fillCircle(-12, -34, 9);
  graphics.fillCircle(12, -34, 9);
  graphics.lineStyle(3, OUTLINE_COLOR, 1);
  graphics.strokeCircle(-12, -34, 9);
  graphics.strokeCircle(12, -34, 9);
  graphics.fillCircle(0, -34, 5);
  graphics.strokeCircle(0, -34, 5);
}

export function drawHeart(graphics, size, color) {
  const r = size * 0.3;

  graphics.fillStyle(color, 1);
  graphics.fillCircle(-r, -r * 0.4, r);
  graphics.fillCircle(r, -r * 0.4, r);
  graphics.fillTriangle(-r * 1.95, -r * 0.2, r * 1.95, -r * 0.2, 0, r * 2.1);
}

export function drawStar(graphics, size, color) {
  const points = [];

  for (let i = 0; i < 10; i += 1) {
    const radius = i % 2 === 0 ? size / 2 : size / 3.2;
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;

    points.push(new Phaser.Geom.Point(Math.cos(angle) * radius, Math.sin(angle) * radius));
  }

  graphics.fillStyle(color, 1);
  graphics.fillPoints(points, true);
}

export function drawDrop(graphics, size, color) {
  const r = size * 0.35;

  graphics.fillStyle(color, 1);
  graphics.fillCircle(0, r * 0.4, r);
  graphics.fillTriangle(-r * 0.92, r * 0.05, r * 0.92, r * 0.05, 0, -r * 1.6);
}
