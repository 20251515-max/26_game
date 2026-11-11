export class StartScene extends Phaser.Scene {
  constructor() {
    super('StartScene');
  }

  create() {
    this.add.text(640, 260, '모찌 공장', {
      color: '#6b3c28',
      fontFamily: 'sans-serif',
      fontSize: '72px',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(640, 350, '손님이 원하는 모찌를 만들어 보세요.', {
      color: '#8b5e47',
      fontFamily: 'sans-serif',
      fontSize: '28px',
    }).setOrigin(0.5);

    const startButton = this.add.text(640, 475, '시작하기', {
      backgroundColor: '#f39a72',
      color: '#ffffff',
      fontFamily: 'sans-serif',
      fontSize: '32px',
      padding: { x: 36, y: 18 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    startButton.on('pointerdown', () => {
      this.scene.start('PlayScene');
    });
  }
}
