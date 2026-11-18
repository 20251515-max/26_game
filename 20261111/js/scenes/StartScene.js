export class StartScene extends Phaser.Scene {
  constructor() {
    super('StartScene');
  }

  create() {
    const graphics = this.add.graphics();

    graphics.fillStyle(0xfff9ee, 1);
    graphics.fillRect(0, 0, 1280, 720);
    graphics.fillStyle(0xddeeff, 1);
    graphics.fillCircle(110, 105, 150);
    graphics.fillStyle(0xddeff0, 1);
    graphics.fillCircle(1160, 620, 180);
    graphics.fillStyle(0xffdde7, 1);
    graphics.fillCircle(1160, 125, 95);
    graphics.fillStyle(0xfff1b8, 1);
    graphics.fillRoundedRect(315, 128, 650, 430, 48);
    graphics.lineStyle(5, 0x5a466b, 1);
    graphics.strokeRoundedRect(315, 128, 650, 430, 48);

    this.createMochi(graphics, 640, 220);

    this.add.text(640, 310, '모찌 공장', {
      color: '#5a466b',
      fontFamily: 'sans-serif',
      fontSize: '60px',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(640, 375, '손님이 원하는 과일 모찌를 만들어 보세요!', {
      color: '#5a466b',
      fontFamily: 'sans-serif',
      fontSize: '24px',
    }).setOrigin(0.5);

    graphics.fillStyle(0xc98aa2, 1);
    graphics.fillRoundedRect(495, 452, 290, 82, 28);
    graphics.fillStyle(0xffa9c0, 1);
    graphics.fillRoundedRect(495, 440, 290, 82, 28);
    graphics.lineStyle(5, 0x5a466b, 1);
    graphics.strokeRoundedRect(495, 440, 290, 82, 28);

    this.add.text(640, 479, '시작하기', {
      color: '#ffffff',
      fontFamily: 'sans-serif',
      fontSize: '28px',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const startButton = this.add.zone(640, 487, 290, 94)
      .setInteractive({ useHandCursor: true });
    startButton.on('pointerdown', () => {
      this.scene.start('PlayScene');
    });
  }

  createMochi(graphics, x, y) {
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(x, y, 62);
    graphics.lineStyle(5, 0x5a466b, 1);
    graphics.strokeCircle(x, y, 62);
    graphics.fillStyle(0xffdde7, 1);
    graphics.fillCircle(x - 30, y + 13, 11);
    graphics.fillCircle(x + 30, y + 13, 11);
    graphics.fillStyle(0x5a466b, 1);
    graphics.fillCircle(x - 20, y - 3, 6);
    graphics.fillCircle(x + 20, y - 3, 6);
    graphics.lineStyle(4, 0x5a466b, 1);
    graphics.beginPath();
    graphics.arc(x, y + 8, 14, 0, Math.PI, false);
    graphics.strokePath();
    graphics.fillStyle(0xddf3dd, 1);
    graphics.fillTriangle(x - 4, y - 66, x + 8, y - 98, x + 24, y - 60);
    graphics.lineStyle(4, 0x5a466b, 1);
    graphics.strokeTriangle(x - 4, y - 66, x + 8, y - 98, x + 24, y - 60);
  }
}
