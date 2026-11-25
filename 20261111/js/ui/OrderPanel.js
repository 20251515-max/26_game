import { GOAL_SALES, PREP_GOAL_PIECES } from '../config/GameRules.js';
import { drawCustomer, drawFruitMochi } from './CuteShapes.js';
import { createButton, drawPanel, popText, textStyle } from './Widgets.js';

export const CUSTOMER_X = 210;
export const CUSTOMER_Y = 262;
const CUSTOMER_FACE_COLORS = [0xffe6cc, 0xfff0e0, 0xf9dcc8];
const CUSTOMER_BOW_COLORS = [0xffa9c0, 0x9fd0ff, 0x9ed99a, 0xc6b3ff];

// 왼쪽 손님 주문 카드: 손님, 주문 모찌, 판매가, 목표 개수, [영업 시작]·[다음 손님] 버튼
export class OrderPanel {
  constructor(scene, graphics, onButton) {
    this.scene = scene;

    drawPanel(graphics, 55, 165, 310, 400, 0xfff1b8, 34);
    scene.add.text(210, 196, '손님 주문', textStyle(30)).setOrigin(0.5);

    // 손님 말풍선
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRoundedRect(92, 308, 236, 146, 28);
    graphics.lineStyle(4, 0x5a466b, 1);
    graphics.strokeRoundedRect(92, 308, 236, 146, 28);
    graphics.fillTriangle(198, 311, 222, 311, 210, 298);
    graphics.lineBetween(198, 308, 210, 298);
    graphics.lineBetween(210, 298, 222, 308);

    this.customerGraphics = scene.add.graphics({ x: CUSTOMER_X, y: CUSTOMER_Y });
    scene.tweens.add({
      targets: this.customerGraphics,
      y: CUSTOMER_Y - 5,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.mochiGraphics = scene.add.graphics({ x: 210, y: 368 });
    this.nameText = scene.add.text(210, 432, '', textStyle(28)).setOrigin(0.5);
    this.priceText = scene.add.text(210, 490, '', textStyle(26)).setOrigin(0.5);
    this.goalText = scene.add.text(210, 540, '', textStyle(21, false)).setOrigin(0.5);
    this.button = createButton(scene, 100, 462, 220, 48, 0x8fd48a, '', onButton);
    this.button.setVisible(false);
  }

  showOrder(order, price) {
    const { scene } = this;

    this.hideButton();
    this.priceText.setVisible(true);

    this.customerGraphics.clear();
    drawCustomer(
      this.customerGraphics,
      Phaser.Utils.Array.GetRandom(CUSTOMER_FACE_COLORS),
      Phaser.Utils.Array.GetRandom(CUSTOMER_BOW_COLORS),
    );
    this.mochiGraphics.clear();
    drawFruitMochi(this.mochiGraphics, 0, 0, order);
    this.nameText.setText(order);
    this.setPrice(price);

    this.customerGraphics.setScale(0);
    this.mochiGraphics.setScale(0);
    scene.tweens.add({ targets: this.customerGraphics, scale: 1, duration: 350, ease: 'Back.easeOut' });
    scene.tweens.add({ targets: this.mochiGraphics, scale: 1, duration: 350, delay: 120, ease: 'Back.easeOut' });
  }

  setPrice(price) {
    this.priceText.setText(`판매가 ${price}원`);
  }

  showEmpty() {
    this.customerGraphics.clear();
    this.mochiGraphics.clear().setScale(1);
    this.mochiGraphics.fillStyle(0x5a466b, 0.35);
    [-24, 0, 24].forEach((dx) => this.mochiGraphics.fillCircle(dx, 0, 8));
    this.nameText.setText('손님 없음');
    this.priceText.setVisible(false);
  }

  // 판매가 자리에 버튼을 띄운다.
  showButton(label) {
    this.priceText.setVisible(false);
    this.button.setLabel(label);
    this.button.setVisible(true);
  }

  hideButton() {
    this.button.setVisible(false);
  }

  // 판매한 모찌가 손님에게 도착한 뒤 손님이 떠난다.
  leave() {
    this.hideButton();
    this.scene.tweens.add({
      targets: [this.customerGraphics, this.mochiGraphics],
      scale: 0,
      duration: 250,
      delay: 450,
      ease: 'Back.easeIn',
      onComplete: () => this.showEmpty(),
    });
  }

  setPrepped(count) {
    this.goalText.setText(`목표 손질 ${count} / ${PREP_GOAL_PIECES}개`);
  }

  setSales(count) {
    this.goalText.setText(`목표 판매 ${count} / ${GOAL_SALES}개`);
  }

  popGoal() {
    popText(this.scene, this.goalText);
  }
}
