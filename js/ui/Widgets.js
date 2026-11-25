import { playSound } from '../audio/SoundEffects.js';

// 플레이 화면 여러 곳에서 쓰는 글자·패널·버튼·효과

export function textStyle(fontSize, bold = true) {
  return {
    color: '#5a466b',
    fontFamily: 'sans-serif',
    fontSize: `${fontSize}px`,
    ...(bold ? { fontStyle: 'bold' } : {}),
  };
}

export function drawPanel(graphics, x, y, width, height, color, radius) {
  graphics.fillStyle(color, 1);
  graphics.fillRoundedRect(x, y, width, height, radius);
  graphics.lineStyle(5, 0x5a466b, 1);
  graphics.strokeRoundedRect(x, y, width, height, radius);
}

// 제목과 값을 담은 카드. 값 글자를 돌려준다.
export function createStatusCard(scene, graphics, x, y, width, height, color, label, value) {
  drawPanel(graphics, x, y, width, height, color, 24);
  scene.add.text(x + width / 2, y + 28, label, textStyle(20)).setOrigin(0.5);

  return scene.add.text(x + width / 2, y + 63, value, textStyle(27)).setOrigin(0.5);
}

// 누르면 버튼 면이 내려가 아래 그림자가 줄어든다.
export function createButton(scene, x, y, width, height, color, label, onClick) {
  const shadow = scene.add.graphics();
  const faceGraphics = scene.add.graphics();
  const text = scene.add.text(width / 2, height / 2, label, {
    color: '#ffffff',
    fontFamily: 'sans-serif',
    fontSize: '19px',
    fontStyle: 'bold',
  }).setOrigin(0.5);
  const face = scene.add.container(x, y, [faceGraphics, text]);

  shadow.fillStyle(0xc98aa2, 1);
  shadow.fillRoundedRect(x, y + 10, width, height, 24);
  faceGraphics.fillStyle(color, 1);
  faceGraphics.fillRoundedRect(0, 0, width, height, 24);
  faceGraphics.lineStyle(4, 0x5a466b, 1);
  faceGraphics.strokeRoundedRect(0, 0, width, height, 24);

  const button = scene.add.zone(x + width / 2, y + height / 2 + 5, width, height + 10)
    .setInteractive({ useHandCursor: true });
  button.on('pointerdown', () => {
    face.y = y + 6;
    playSound(scene, 'button');
    onClick();
  });
  button.on('pointerup', () => {
    face.y = y;
  });
  button.on('pointerout', () => {
    face.y = y;
  });

  return {
    setLabel: (newLabel) => text.setText(newLabel),
    setAlpha: (alpha) => {
      shadow.setAlpha(alpha);
      face.setAlpha(alpha);
    },
    setVisible: (visible) => {
      shadow.setVisible(visible);
      face.setVisible(visible);

      if (visible) {
        button.setInteractive();
      } else {
        button.disableInteractive();
      }
    },
  };
}

export function popText(scene, text) {
  scene.tweens.killTweensOf(text);
  text.setScale(1);
  scene.tweens.add({ targets: text, scale: 1.25, duration: 120, yoyo: true, ease: 'Back.easeOut' });
}

export function showFloatingText(scene, x, y, message) {
  const text = scene.add.text(x, y, message, textStyle(26)).setOrigin(0.5);

  scene.tweens.add({
    targets: text,
    y: y - 40,
    alpha: 0,
    duration: 800,
    ease: 'Cubic.easeOut',
    onComplete: () => text.destroy(),
  });
}
