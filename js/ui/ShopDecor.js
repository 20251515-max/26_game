const OUTLINE_COLOR = 0x5a466b;

function drawFlowerPot(graphics) {
  graphics.lineStyle(2, OUTLINE_COLOR, 1);
  graphics.fillStyle(0x70b66b, 1);
  graphics.fillEllipse(-13, -30, 24, 12);
  graphics.strokeEllipse(-13, -30, 24, 12);
  graphics.fillEllipse(13, -30, 24, 12);
  graphics.strokeEllipse(13, -30, 24, 12);

  graphics.fillStyle(0xffa9c0, 1);
  for (let i = 0; i < 5; i += 1) {
    const angle = (Math.PI * 2 * i) / 5;

    graphics.fillCircle(Math.cos(angle) * 9, -46 + Math.sin(angle) * 9, 7);
    graphics.strokeCircle(Math.cos(angle) * 9, -46 + Math.sin(angle) * 9, 7);
  }
  graphics.fillStyle(0xffe08a, 1);
  graphics.fillCircle(0, -46, 6);
  graphics.strokeCircle(0, -46, 6);

  const pot = [{ x: -22, y: -16 }, { x: 22, y: -16 }, { x: 17, y: 22 }, { x: -17, y: 22 }];

  graphics.lineStyle(4, OUTLINE_COLOR, 1);
  graphics.fillStyle(0xf0a88a, 1);
  graphics.fillPoints(pot, true);
  graphics.strokePoints(pot, true, true);
  graphics.fillRoundedRect(-27, -24, 54, 12, 5);
  graphics.strokeRoundedRect(-27, -24, 54, 12, 5);
}

// 화면 맨 위에 걸리는 분홍·흰색 줄무늬 차양
function drawAwning(graphics) {
  const stripe = 40;

  for (let x = 0; x < 1280; x += stripe) {
    graphics.fillStyle((x / stripe) % 2 === 0 ? 0xffa9c0 : 0xffffff, 1);
    graphics.fillRect(x, 0, stripe, 8);
    graphics.beginPath();
    graphics.arc(x + stripe / 2, 8, stripe / 2, 0, Math.PI, false);
    graphics.closePath();
    graphics.fillPath();
    graphics.lineStyle(3, OUTLINE_COLOR, 1);
    graphics.strokePath();
  }
}

// 왕관을 쓴 모찌 마스코트
function drawMascot(graphics) {
  const crown = [
    { x: -20, y: -30 }, { x: -20, y: -52 }, { x: -10, y: -40 }, { x: 0, y: -56 },
    { x: 10, y: -40 }, { x: 20, y: -52 }, { x: 20, y: -30 },
  ];

  graphics.lineStyle(3, OUTLINE_COLOR, 1);
  graphics.fillStyle(0xffe08a, 1);
  graphics.fillPoints(crown, true);
  graphics.strokePoints(crown, true, true);

  graphics.fillStyle(0xfffaf2, 1);
  graphics.fillEllipse(0, 0, 96, 72);
  graphics.lineStyle(4, OUTLINE_COLOR, 1);
  graphics.strokeEllipse(0, 0, 96, 72);

  graphics.fillStyle(OUTLINE_COLOR, 1);
  graphics.fillCircle(-14, -4, 4.5);
  graphics.fillCircle(14, -4, 4.5);
  graphics.fillStyle(0xffa9c0, 0.8);
  graphics.fillEllipse(-26, 8, 14, 8);
  graphics.fillEllipse(26, 8, 14, 8);
  graphics.lineStyle(3, OUTLINE_COLOR, 1);
  graphics.beginPath();
  graphics.arc(0, 4, 7, Math.PI * 0.15, Math.PI * 0.85, false);
  graphics.strokePath();
}

// 확장 단계마다 가게에 붙는 장식 [그리기, x, y]
const LEVEL_DECOR = {
  1: [[drawFlowerPot, 95, 640], [drawFlowerPot, 1185, 640]],
  2: [[drawAwning, 0, 0]],
  3: [[drawMascot, 720, 636]],
};

export function addShopDecor(scene, level) {
  LEVEL_DECOR[level].forEach(([draw, x, y]) => {
    const graphics = scene.add.graphics({ x, y });

    draw(graphics);
    graphics.setScale(1, 0);
    scene.tweens.add({ targets: graphics, scaleY: 1, duration: 400, ease: 'Back.easeOut' });

    if (draw === drawMascot) {
      scene.tweens.add({
        targets: graphics,
        y: y - 6,
        duration: 800,
        delay: 400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  });
}
