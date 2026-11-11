import { createInitialOrder } from '../orders/Order.js';

export class PlayScene extends Phaser.Scene {
  constructor() {
    super('PlayScene');
  }

  create() {
    const order = createInitialOrder();

    this.add.text(640, 170, '플레이 화면', {
      color: '#6b3c28',
      fontFamily: 'sans-serif',
      fontSize: '56px',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(640, 275, '손님 주문', {
      color: '#8b5e47',
      fontFamily: 'sans-serif',
      fontSize: '26px',
    }).setOrigin(0.5);

    this.add.text(640, 330, order, {
      backgroundColor: '#fffdf9',
      color: '#6b3c28',
      fontFamily: 'sans-serif',
      fontSize: '38px',
      padding: { x: 36, y: 18 },
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
