import { GOAL_SALES, MOCHI_PRICES, TIME_LIMIT_SECONDS } from '../config/GameRules.js';
import { createInitialOrder, getMochiColor } from '../orders/Order.js';
import { FRUIT_INGREDIENTS, makeFruitMochi } from '../production/MochiMaker.js';

export class PlayScene extends Phaser.Scene {
  constructor() {
    super('PlayScene');
  }

  create() {
    const order = createInitialOrder();
    const graphics = this.add.graphics();

    this.hasDough = false;

    graphics.fillStyle(0xfff9ee, 1);
    graphics.fillRect(0, 0, 1280, 720);
    graphics.fillStyle(0xddeeff, 1);
    graphics.fillCircle(1160, 95, 180);
    graphics.fillStyle(0xddf3dd, 1);
    graphics.fillCircle(120, 650, 200);

    this.createStatusCard(graphics, 805, 32, 180, 92, 0xe8dfff, '남은 시간', this.formatTime(TIME_LIMIT_SECONDS));
    this.createStatusCard(graphics, 1005, 32, 220, 92, 0xffdde7, '보유 금액', '0원');
    this.createOrderPanel(graphics, order);
    this.createWorkshop(graphics);
    this.createIngredientControls(graphics);

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

    this.createButton(graphics, 870, 600, 220, 60, 0xffa9c0, '결과 화면 보기', () => {
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
    this.drawFruitMochi(graphics, 210, 325, order);
    this.add.text(210, 386, order, {
      color: '#5a466b',
      fontFamily: 'sans-serif',
      fontSize: '28px',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.text(210, 470, `판매가 ${MOCHI_PRICES[order]}원`, {
      color: '#5a466b',
      fontFamily: 'sans-serif',
      fontSize: '26px',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.text(210, 515, `목표 판매 0 / ${GOAL_SALES}개`, {
      color: '#5a466b',
      fontFamily: 'sans-serif',
      fontSize: '21px',
    }).setOrigin(0.5);
  }

  formatTime(totalSeconds) {
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');

    return `${minutes} : ${seconds}`;
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
    this.madeMochiGraphics = this.add.graphics();
    this.workshopMessage = this.add.text(817, 442, '찹쌀 반죽과 과일을 선택하세요', {
      color: '#5a466b',
      fontFamily: 'sans-serif',
      fontSize: '20px',
    }).setOrigin(0.5);
  }

  createIngredientControls(graphics) {
    this.createButton(graphics, 440, 495, 140, 52, 0xfff1b8, '찹쌀 반죽', () => {
      this.hasDough = true;
      this.madeMochiGraphics.clear();
      this.workshopMessage.setText('찹쌀 반죽을 준비했어요\n과일을 선택하세요');
    });

    FRUIT_INGREDIENTS.forEach((fruit, index) => {
      const x = 595 + index * 140;
      const colors = [0xff9bb3, 0xb89ae6, 0xffc1ae, 0xffd86b];
      this.createButton(graphics, x, 495, 125, 52, colors[index], fruit, () => {
        this.makeMochi(fruit);
      });
    });
  }

  makeMochi(fruit) {
    const mochi = makeFruitMochi(this.hasDough, fruit);

    if (!mochi) {
      this.workshopMessage.setText('찹쌀 반죽부터 선택하세요');
      return;
    }

    this.hasDough = false;
    this.madeMochiGraphics.clear();
    this.drawFruitMochi(this.madeMochiGraphics, 817, 377, mochi);
    this.workshopMessage.setText(`${mochi} 완성!`);
  }

  drawFruitMochi(graphics, x, y, order) {
    graphics.fillStyle(getMochiColor(order), 1);
    graphics.fillCircle(x, y, 48);
    graphics.lineStyle(4, 0x5a466b, 1);
    graphics.strokeCircle(x, y, 48);

    if (order === '딸기 모찌') {
      graphics.fillStyle(0x5a466b, 1);
      [-17, 0, 17].forEach((seedX) => graphics.fillCircle(x + seedX, y + 10, 3));
      graphics.fillStyle(0x70b66b, 1);
      graphics.fillTriangle(x - 20, y - 35, x, y - 56, x + 6, y - 27);
      graphics.fillTriangle(x - 6, y - 27, x + 18, y - 50, x + 22, y - 24);
    }

    if (order === '포도 모찌') {
      graphics.fillStyle(0x8767c3, 1);
      [[-13, -9], [13, -9], [0, 9], [-13, 18], [13, 18]].forEach(([grapeX, grapeY]) => {
        graphics.fillCircle(x + grapeX, y + grapeY, 11);
      });
      graphics.fillStyle(0x70b66b, 1);
      graphics.fillTriangle(x - 4, y - 40, x + 14, y - 55, x + 15, y - 30);
    }

    if (order === '복숭아 모찌') {
      graphics.fillStyle(0xff8d9e, 1);
      graphics.fillCircle(x - 17, y + 9, 12);
      graphics.fillCircle(x + 17, y + 9, 12);
      graphics.fillStyle(0x70b66b, 1);
      graphics.fillTriangle(x - 3, y - 41, x + 20, y - 54, x + 13, y - 27);
    }

    if (order === '망고 모찌') {
      graphics.fillStyle(0xffb942, 1);
      graphics.fillEllipse(x, y + 6, 49, 57);
      graphics.lineStyle(3, 0xe5972d, 1);
      graphics.strokeEllipse(x, y + 6, 49, 57);
      graphics.fillStyle(0x70b66b, 1);
      graphics.fillTriangle(x - 2, y - 37, x + 21, y - 54, x + 13, y - 25);
    }
  }

  createButton(graphics, x, y, width, height, color, label, onClick) {
    graphics.fillStyle(0xc98aa2, 1);
    graphics.fillRoundedRect(x, y + 10, width, height, 24);
    graphics.fillStyle(color, 1);
    graphics.fillRoundedRect(x, y, width, height, 24);
    graphics.lineStyle(4, 0x5a466b, 1);
    graphics.strokeRoundedRect(x, y, width, height, 24);
    this.add.text(x + width / 2, y + height / 2, label, {
      color: '#ffffff',
      fontFamily: 'sans-serif',
      fontSize: '19px',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    const button = this.add.zone(x + width / 2, y + height / 2 + 5, width, height + 10)
      .setInteractive({ useHandCursor: true });
    button.on('pointerdown', onClick);
  }

  drawPanel(graphics, x, y, width, height, color, radius) {
    graphics.fillStyle(color, 1);
    graphics.fillRoundedRect(x, y, width, height, radius);
    graphics.lineStyle(5, 0x5a466b, 1);
    graphics.strokeRoundedRect(x, y, width, height, radius);
  }
}
