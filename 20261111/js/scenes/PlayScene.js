import { createInitialOrder } from '../orders/Order.js';

export class PlayScene extends Phaser.Scene {
  constructor() {
    super('PlayScene');
  }

  create() {
    const order = createInitialOrder();
    const graphics = this.add.graphics();

    graphics.fillStyle(0xfff9ee, 1);
    graphics.fillRect(0, 0, 1280, 720);
    graphics.fillStyle(0xddeeff, 1);
    graphics.fillCircle(1160, 95, 180);
    graphics.fillStyle(0xddf3dd, 1);
    graphics.fillCircle(120, 650, 200);

    this.createStatusCard(graphics, 805, 32, 180, 92, 0xe8dfff, '남은 시간', '-- : --');
    this.createStatusCard(graphics, 1005, 32, 220, 92, 0xffdde7, '보유 금액', '0원');
    this.createOrderPanel(graphics, order);
    this.createWorkshop(graphics);

    this.add.text(640, 62, '모찌 공장', {
      color: '#5a466b',
      fontFamily: 'sans-serif',
      fontSize: '40px',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(640, 115, '주문에 맞는 모찌를 만들어 보세요!', {
      color: '#5a466b',
      fontFamily: 'sans-serif',
      fontSize: '22px',
    }).setOrigin(0.5);

    this.createButton(graphics, 870, 565, 220, 68, 0xffa9c0, '결과 화면 보기', () => {
      this.scene.start('ResultScene', { message: '이번 판이 끝났습니다.' });
    });
  }

  createStatusCard(graphics, x, y, width, height, color, label, value) {
    this.drawPanel(graphics, x, y, width, height, color, 24);
    this.add.text(x + width / 2, y + 28, label, {
      color: '#5a466b',
      fontFamily: 'sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.text(x + width / 2, y + 63, value, {
      color: '#5a466b',
      fontFamily: 'sans-serif',
      fontSize: '27px',
      fontStyle: 'bold',
    }).setOrigin(0.5);
  }

  createOrderPanel(graphics, order) {
    this.drawPanel(graphics, 55, 165, 310, 400, 0xfff1b8, 34);
    this.add.text(210, 210, '손님 주문', {
      color: '#5a466b',
      fontFamily: 'sans-serif',
      fontSize: '30px',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRoundedRect(92, 255, 236, 172, 28);
    graphics.lineStyle(4, 0x5a466b, 1);
    graphics.strokeRoundedRect(92, 255, 236, 172, 28);
    graphics.fillStyle(0xffdde7, 1);
    graphics.fillCircle(210, 325, 48);
    graphics.lineStyle(4, 0x5a466b, 1);
    graphics.strokeCircle(210, 325, 48);
    this.add.text(210, 386, order, {
      color: '#5a466b',
      fontFamily: 'sans-serif',
      fontSize: '28px',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.text(210, 490, '만들 모찌', {
      color: '#5a466b',
      fontFamily: 'sans-serif',
      fontSize: '21px',
    }).setOrigin(0.5);
  }

  createWorkshop(graphics) {
    this.drawPanel(graphics, 410, 165, 815, 400, 0xddeeff, 34);
    this.add.text(817, 214, '제작 영역', {
      color: '#5a466b',
      fontFamily: 'sans-serif',
      fontSize: '30px',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    graphics.fillStyle(0xc98a69, 1);
    graphics.fillRoundedRect(485, 345, 665, 145, 30);
    graphics.lineStyle(5, 0x5a466b, 1);
    graphics.strokeRoundedRect(485, 345, 665, 145, 30);
    graphics.fillStyle(0xe8b987, 1);
    graphics.fillRoundedRect(495, 332, 645, 130, 28);
    graphics.lineStyle(4, 0x5a466b, 1);
    graphics.strokeRoundedRect(495, 332, 645, 130, 28);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(817, 377, 54);
    graphics.lineStyle(4, 0x5a466b, 1);
    graphics.strokeCircle(817, 377, 54);
    this.add.text(817, 442, '아직 만든 모찌가 없습니다', {
      color: '#5a466b',
      fontFamily: 'sans-serif',
      fontSize: '23px',
    }).setOrigin(0.5);
  }

  createButton(graphics, x, y, width, height, color, label, onClick) {
    graphics.fillStyle(0xc98aa2, 1);
    graphics.fillRoundedRect(x, y + 10, width, height, 24);
    graphics.fillStyle(color, 1);
    graphics.fillRoundedRect(x, y, width, height, 24);
    graphics.lineStyle(4, 0x5a466b, 1);
    graphics.strokeRoundedRect(x, y, width, height, 24);
    const button = this.add.text(x + width / 2, y + height / 2, label, {
      color: '#ffffff',
      fontFamily: 'sans-serif',
      fontSize: '22px',
      fontStyle: 'bold',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    button.on('pointerdown', onClick);
  }

  drawPanel(graphics, x, y, width, height, color, radius) {
    graphics.fillStyle(color, 1);
    graphics.fillRoundedRect(x, y, width, height, radius);
    graphics.lineStyle(5, 0x5a466b, 1);
    graphics.strokeRoundedRect(x, y, width, height, radius);
  }
}
