export class PlayScene extends Phaser.Scene {
  constructor() {
    super('PlayScene');
  }

  create() {
    this.add.text(640, 170, '플레이 화면', {
      color: '#6b3c28',
      fontFamily: 'sans-serif',
      fontSize: '56px',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(640, 280, '주문과 모찌 제작 기능은 다음 작업에서 추가됩니다.', {
      color: '#8b5e47',
      fontFamily: 'sans-serif',
      fontSize: '28px',
    }).setOrigin(0.5);

    const resultButton = this.add.text(640, 465, '결과 화면 보기', {
      backgroundColor: '#f39a72',
      color: '#ffffff',
      fontFamily: 'sans-serif',
      fontSize: '30px',
      padding: { x: 32, y: 16 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    resultButton.on('pointerdown', () => {
      this.scene.start('ResultScene', { message: '이번 판이 끝났습니다.' });
    });
  }
}
