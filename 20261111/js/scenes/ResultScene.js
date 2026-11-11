export class ResultScene extends Phaser.Scene {
  constructor() {
    super('ResultScene');
  }

  init(data) {
    this.message = data.message;
  }

  create() {
    this.add.text(640, 245, '결과 화면', {
      color: '#6b3c28',
      fontFamily: 'sans-serif',
      fontSize: '56px',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(640, 340, this.message, {
      color: '#8b5e47',
      fontFamily: 'sans-serif',
      fontSize: '28px',
    }).setOrigin(0.5);

    const retryButton = this.add.text(640, 475, '다시 하기', {
      backgroundColor: '#f39a72',
      color: '#ffffff',
      fontFamily: 'sans-serif',
      fontSize: '32px',
      padding: { x: 36, y: 18 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    retryButton.on('pointerdown', () => {
      this.scene.start('PlayScene');
    });
  }
}
