import { GOAL_SALES, MOCHI_PRICES, TIME_LIMIT_SECONDS } from '../config/GameRules.js';
import { createInitialOrder, createNextOrder, getMochiColor } from '../orders/Order.js';
import { FRUIT_INGREDIENTS, makeFruitMochi } from '../production/MochiMaker.js';
import { drawCustomer, drawDrop, drawHeart, drawStar } from '../ui/CuteShapes.js';

const PLATE_X = 817;
const PLATE_Y = 377;
const CUSTOMER_X = 210;
const CUSTOMER_Y = 262;
const CUSTOMER_FACE_COLORS = [0xffe6cc, 0xfff0e0, 0xf9dcc8];
const CUSTOMER_BOW_COLORS = [0xffa9c0, 0x9fd0ff, 0x9ed99a, 0xc6b3ff];

export class PlayScene extends Phaser.Scene {
  constructor() {
    super('PlayScene');
  }

  create() {
    const background = this.add.graphics();

    this.hasDough = false;
    this.money = 0;
    this.salesCount = 0;

    background.fillStyle(0xfff9ee, 1);
    background.fillRect(0, 0, 1280, 720);
    background.fillStyle(0xddeeff, 1);
    background.fillCircle(1160, 95, 180);
    background.fillStyle(0xddf3dd, 1);
    background.fillCircle(120, 650, 200);
    this.createBackgroundDecorations();

    const graphics = this.add.graphics();

    this.createStatusCard(graphics, 805, 32, 180, 92, 0xe8dfff, '남은 시간', this.formatTime(TIME_LIMIT_SECONDS));
    this.moneyText = this.createStatusCard(graphics, 1005, 32, 220, 92, 0xffdde7, '보유 금액', '0원');
    this.createOrderPanel(graphics);
    this.createWorkshop(graphics);
    this.createIngredientControls();

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

    this.createButton(870, 600, 220, 60, 0xffa9c0, '결과 화면 보기', () => {
      this.scene.start('ResultScene', { message: '이번 판이 끝났습니다.' });
    });

    this.showOrder(createInitialOrder());
  }

  createBackgroundDecorations() {
    const decorations = [
      [drawHeart, 60, 60, 26, 0xffb8cb],
      [drawStar, 160, 128, 24, 0xffe08a],
      [drawDrop, 300, 50, 22, 0xa9d4ff],
      [drawHeart, 430, 135, 18, 0xffb8cb],
      [drawStar, 760, 140, 18, 0xffe08a],
      [drawStar, 100, 620, 26, 0xffe08a],
      [drawHeart, 270, 668, 24, 0xffb8cb],
      [drawDrop, 450, 618, 22, 0xa9d4ff],
      [drawStar, 640, 680, 20, 0xffe08a],
      [drawHeart, 770, 622, 20, 0xffb8cb],
      [drawStar, 1170, 640, 24, 0xffe08a],
      [drawDrop, 1240, 688, 20, 0xa9d4ff],
    ];

    decorations.forEach(([draw, x, y, size, color]) => {
      const shape = this.add.graphics({ x, y }).setAlpha(0.85);

      draw(shape, size, color);
      this.tweens.add({
        targets: shape,
        y: y - 6,
        duration: Phaser.Math.Between(1500, 2300),
        delay: Phaser.Math.Between(0, 800),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
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

    return this.add.text(x + width / 2, y + 63, value, {
      color: '#5a466b',
      fontFamily: 'sans-serif',
      fontSize: '27px',
      fontStyle: 'bold',
    }).setOrigin(0.5);
  }

  createOrderPanel(graphics) {
    this.drawPanel(graphics, 55, 165, 310, 400, 0xfff1b8, 34);
    this.add.text(210, 196, '손님 주문', {
      color: '#5a466b',
      fontFamily: 'sans-serif',
      fontSize: '30px',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // 손님 말풍선
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRoundedRect(92, 308, 236, 146, 28);
    graphics.lineStyle(4, 0x5a466b, 1);
    graphics.strokeRoundedRect(92, 308, 236, 146, 28);
    graphics.fillTriangle(198, 311, 222, 311, 210, 298);
    graphics.lineBetween(198, 308, 210, 298);
    graphics.lineBetween(210, 298, 222, 308);

    this.customerGraphics = this.add.graphics({ x: CUSTOMER_X, y: CUSTOMER_Y });
    this.tweens.add({
      targets: this.customerGraphics,
      y: CUSTOMER_Y - 5,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.orderMochiGraphics = this.add.graphics({ x: 210, y: 368 });
    this.orderNameText = this.add.text(210, 432, '', {
      color: '#5a466b',
      fontFamily: 'sans-serif',
      fontSize: '28px',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.orderPriceText = this.add.text(210, 490, '', {
      color: '#5a466b',
      fontFamily: 'sans-serif',
      fontSize: '26px',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.salesText = this.add.text(210, 530, `목표 판매 0 / ${GOAL_SALES}개`, {
      color: '#5a466b',
      fontFamily: 'sans-serif',
      fontSize: '21px',
    }).setOrigin(0.5);
  }

  showOrder(order) {
    this.order = order;

    this.customerGraphics.clear();
    drawCustomer(
      this.customerGraphics,
      Phaser.Utils.Array.GetRandom(CUSTOMER_FACE_COLORS),
      Phaser.Utils.Array.GetRandom(CUSTOMER_BOW_COLORS),
    );
    this.orderMochiGraphics.clear();
    this.drawFruitMochi(this.orderMochiGraphics, 0, 0, order);
    this.orderNameText.setText(order);
    this.orderPriceText.setText(`판매가 ${MOCHI_PRICES[order]}원`);

    this.customerGraphics.setScale(0);
    this.orderMochiGraphics.setScale(0);
    this.tweens.add({ targets: this.customerGraphics, scale: 1, duration: 350, ease: 'Back.easeOut' });
    this.tweens.add({ targets: this.orderMochiGraphics, scale: 1, duration: 350, delay: 120, ease: 'Back.easeOut' });
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
    graphics.fillCircle(PLATE_X, PLATE_Y, 54);
    graphics.lineStyle(4, 0x5a466b, 1);
    graphics.strokeCircle(PLATE_X, PLATE_Y, 54);
    this.madeMochiGraphics = this.add.graphics({ x: PLATE_X, y: PLATE_Y });
    this.workshopMessage = this.add.text(817, 442, '찹쌀 반죽과 과일을 선택하세요', {
      color: '#5a466b',
      fontFamily: 'sans-serif',
      fontSize: '20px',
    }).setOrigin(0.5);
  }

  createIngredientControls() {
    this.createButton(440, 495, 140, 52, 0xfff1b8, '찹쌀 반죽', () => {
      this.hasDough = true;
      this.resetMadeMochi();
      this.workshopMessage.setText('찹쌀 반죽을 준비했어요\n과일을 선택하세요');
    });

    FRUIT_INGREDIENTS.forEach((fruit, index) => {
      const x = 595 + index * 140;
      const colors = [0xff9bb3, 0xb89ae6, 0xffc1ae, 0xffd86b];
      this.createButton(x, 495, 125, 52, colors[index], fruit, () => {
        this.makeMochi(fruit);
      });
    });
  }

  resetMadeMochi() {
    this.tweens.killTweensOf(this.madeMochiGraphics);
    this.madeMochiGraphics.clear();
    this.madeMochiGraphics.setPosition(PLATE_X, PLATE_Y).setScale(1).setAlpha(1);
  }

  makeMochi(fruit) {
    const mochi = makeFruitMochi(this.hasDough, fruit);

    if (!mochi) {
      this.workshopMessage.setText('찹쌀 반죽부터 선택하세요');
      return;
    }

    this.hasDough = false;
    this.resetMadeMochi();
    this.drawFruitMochi(this.madeMochiGraphics, 0, 0, mochi);

    if (mochi !== this.order) {
      this.workshopMessage.setText(`${mochi}는 주문과 달라요\n다시 만들어 보세요`);
      this.tweens.add({
        targets: this.madeMochiGraphics,
        x: PLATE_X + 8,
        duration: 50,
        yoyo: true,
        repeat: 3,
      });
      return;
    }

    this.sellMochi(mochi);
  }

  sellMochi(mochi) {
    const price = MOCHI_PRICES[mochi];

    this.money += price;
    this.salesCount += 1;
    this.moneyText.setText(`${this.money}원`);
    this.salesText.setText(`목표 판매 ${this.salesCount} / ${GOAL_SALES}개`);
    this.workshopMessage.setText(`${mochi} 판매 완료! +${price}원`);
    this.popText(this.moneyText);
    this.showFloatingText(1115, 140, `+${price}원`);

    // 완성된 모찌가 통 튄 뒤 손님에게 날아간다.
    this.tweens.add({
      targets: this.madeMochiGraphics,
      scale: 1.2,
      duration: 120,
      yoyo: true,
      onComplete: () => {
        this.tweens.add({
          targets: this.madeMochiGraphics,
          x: CUSTOMER_X,
          y: CUSTOMER_Y,
          scale: 0.4,
          alpha: 0,
          duration: 350,
          ease: 'Cubic.easeIn',
        });
      },
    });

    this.showOrder(createNextOrder(this.order));
  }

  popText(text) {
    this.tweens.killTweensOf(text);
    text.setScale(1);
    this.tweens.add({ targets: text, scale: 1.25, duration: 120, yoyo: true, ease: 'Back.easeOut' });
  }

  showFloatingText(x, y, message) {
    const text = this.add.text(x, y, message, {
      color: '#5a466b',
      fontFamily: 'sans-serif',
      fontSize: '26px',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: text,
      y: y - 40,
      alpha: 0,
      duration: 800,
      ease: 'Cubic.easeOut',
      onComplete: () => text.destroy(),
    });
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

  // 누르면 버튼 면이 내려가 아래 그림자가 줄어든다.
  createButton(x, y, width, height, color, label, onClick) {
    const shadow = this.add.graphics();
    const faceGraphics = this.add.graphics();
    const text = this.add.text(width / 2, height / 2, label, {
      color: '#ffffff',
      fontFamily: 'sans-serif',
      fontSize: '19px',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    const face = this.add.container(x, y, [faceGraphics, text]);

    shadow.fillStyle(0xc98aa2, 1);
    shadow.fillRoundedRect(x, y + 10, width, height, 24);
    faceGraphics.fillStyle(color, 1);
    faceGraphics.fillRoundedRect(0, 0, width, height, 24);
    faceGraphics.lineStyle(4, 0x5a466b, 1);
    faceGraphics.strokeRoundedRect(0, 0, width, height, 24);

    const button = this.add.zone(x + width / 2, y + height / 2 + 5, width, height + 10)
      .setInteractive({ useHandCursor: true });
    button.on('pointerdown', () => {
      face.y = y + 6;
      onClick();
    });
    button.on('pointerup', () => {
      face.y = y;
    });
    button.on('pointerout', () => {
      face.y = y;
    });
  }

  drawPanel(graphics, x, y, width, height, color, radius) {
    graphics.fillStyle(color, 1);
    graphics.fillRoundedRect(x, y, width, height, radius);
    graphics.lineStyle(5, 0x5a466b, 1);
    graphics.strokeRoundedRect(x, y, width, height, radius);
  }
}
