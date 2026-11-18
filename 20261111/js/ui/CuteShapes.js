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

export const FRUIT_COLORS = {
  '딸기': 0xff6f8e,
  '포도': 0x9a78d6,
  '복숭아': 0xffb3a1,
  '망고': 0xffb942,
};

export function drawDough(graphics, x, y, width, height) {
  graphics.fillStyle(0xfffaf2, 1);
  graphics.fillEllipse(x, y, width, height);
  graphics.lineStyle(4, OUTLINE_COLOR, 1);
  graphics.strokeEllipse(x, y, width, height);
  graphics.fillStyle(0xffffff, 1);
  graphics.fillEllipse(x - width * 0.18, y - height * 0.2, width * 0.25, height * 0.18);
}

function drawLeaf(graphics, x, y, r) {
  graphics.fillStyle(0x70b66b, 1);
  graphics.fillEllipse(x + r * 0.3, y, r * 0.8, r * 0.4);
  graphics.lineStyle(2, OUTLINE_COLOR, 1);
  graphics.strokeEllipse(x + r * 0.3, y, r * 0.8, r * 0.4);
}

export function drawFruitIcon(graphics, fruit, x, y, r) {
  if (fruit === '딸기') {
    const shape = (color, grow) => {
      graphics.fillStyle(color, 1);
      graphics.fillCircle(x - r * 0.45, y - r * 0.2, r * 0.65 + grow);
      graphics.fillCircle(x + r * 0.45, y - r * 0.2, r * 0.65 + grow);
      graphics.fillTriangle(
        x - r * 1.08 - grow, y - r * 0.1,
        x + r * 1.08 + grow, y - r * 0.1,
        x, y + r * 1.05 + grow * 1.6,
      );
    };

    shape(OUTLINE_COLOR, 3);
    shape(FRUIT_COLORS[fruit], 0);
    graphics.fillStyle(0xfff1b8, 1);
    [[-0.45, -0.1], [0.45, -0.1], [0, 0.15], [-0.25, 0.5], [0.25, 0.5]].forEach(([dx, dy]) => {
      graphics.fillCircle(x + r * dx, y + r * dy, Math.max(1.5, r * 0.08));
    });
    graphics.fillStyle(0x70b66b, 1);
    graphics.fillTriangle(x - r * 0.6, y - r * 0.75, x, y - r * 1.15, x + r * 0.1, y - r * 0.6);
    graphics.fillTriangle(x - r * 0.1, y - r * 0.6, x + r * 0.6, y - r * 1.1, x + r * 0.65, y - r * 0.6);
  }

  if (fruit === '포도') {
    const grapes = [[-0.4, -0.35], [0.4, -0.35], [0, -0.35], [-0.2, 0.15], [0.2, 0.15], [0, 0.6]];

    drawLeaf(graphics, x, y - r * 0.85, r);
    grapes.forEach(([dx, dy]) => {
      graphics.fillStyle(FRUIT_COLORS[fruit], 1);
      graphics.fillCircle(x + r * dx, y + r * dy, r * 0.38);
      graphics.lineStyle(2.5, OUTLINE_COLOR, 1);
      graphics.strokeCircle(x + r * dx, y + r * dy, r * 0.38);
      graphics.fillStyle(0xffffff, 0.7);
      graphics.fillCircle(x + r * (dx - 0.12), y + r * (dy - 0.12), r * 0.08);
    });
  }

  if (fruit === '복숭아') {
    graphics.fillStyle(FRUIT_COLORS[fruit], 1);
    graphics.fillCircle(x, y, r);
    graphics.fillStyle(0xff8d9e, 0.7);
    graphics.fillCircle(x + r * 0.3, y + r * 0.2, r * 0.5);
    graphics.lineStyle(3, OUTLINE_COLOR, 1);
    graphics.strokeCircle(x, y, r);
    graphics.lineStyle(2, OUTLINE_COLOR, 0.6);
    graphics.beginPath();
    graphics.arc(x - r * 0.9, y, r * 0.9, -Math.PI * 0.35, Math.PI * 0.35, false);
    graphics.strokePath();
    drawLeaf(graphics, x, y - r * 0.95, r);
  }

  if (fruit === '망고') {
    graphics.fillStyle(FRUIT_COLORS[fruit], 1);
    graphics.fillEllipse(x, y, r * 2.2, r * 1.75);
    graphics.fillStyle(0xff8a5c, 0.55);
    graphics.fillEllipse(x + r * 0.45, y - r * 0.3, r * 0.9, r * 0.6);
    graphics.lineStyle(3, OUTLINE_COLOR, 1);
    graphics.strokeEllipse(x, y, r * 2.2, r * 1.75);
    drawLeaf(graphics, x, y - r * 0.85, r);
  }
}

export function drawRollingPin(graphics) {
  graphics.fillStyle(0xb97c55, 1);
  graphics.fillRoundedRect(-112, -7, 30, 14, 7);
  graphics.fillRoundedRect(82, -7, 30, 14, 7);
  graphics.lineStyle(3, OUTLINE_COLOR, 1);
  graphics.strokeRoundedRect(-112, -7, 30, 14, 7);
  graphics.strokeRoundedRect(82, -7, 30, 14, 7);
  graphics.fillStyle(0xf2c99a, 1);
  graphics.fillRoundedRect(-85, -13, 170, 26, 13);
  graphics.lineStyle(4, OUTLINE_COLOR, 1);
  graphics.strokeRoundedRect(-85, -13, 170, 26, 13);
  graphics.fillStyle(0xffffff, 0.6);
  graphics.fillRoundedRect(-70, -8, 80, 5, 2.5);
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
