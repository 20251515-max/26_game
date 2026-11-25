import { drawCustomer, drawFruitMochi } from './CuteShapes.js';
import { createButton, drawPanel, popText, textStyle } from './Widgets.js';

const FRONT_X = 210;
const FRONT_Y = 262;
// 맨 앞 손님 뒤에 작게 줄 서는 손님 자리 (최대 2명)
const WAITING_POSITIONS = [[293, 278], [338, 278]];
const WAITING_SCALE = 0.55;
const ITEM_Y = 368;
const MAX_ITEMS = 3;
// 맨 앞 손님 왼쪽의 세로 참을성 게이지
const PATIENCE_X = 118;
const PATIENCE_Y = 228;
const PATIENCE_WIDTH = 18;
const PATIENCE_HEIGHT = 66;
const CUSTOMER_FACE_COLORS = [0xffe6cc, 0xfff0e0, 0xf9dcc8];
const CUSTOMER_BOW_COLORS = [0xffa9c0, 0x9fd0ff, 0x9ed99a, 0xc6b3ff];

// 줄에 선 손님마다 얼굴색과 리본색을 정해 두어, 앞으로 와도 같은 모습으로 보이게 한다.
export function pickCustomerLook() {
  return {
    face: Phaser.Utils.Array.GetRandom(CUSTOMER_FACE_COLORS),
    bow: Phaser.Utils.Array.GetRandom(CUSTOMER_BOW_COLORS),
  };
}

function itemPositions(count) {
  const positions = { 1: [210], 2: [165, 255], 3: [140, 210, 280] };

  return positions[count];
}

function drawCheck(graphics) {
  graphics.fillStyle(0x8fd48a, 1);
  graphics.fillCircle(0, 0, 12);
  graphics.lineStyle(3, 0x5a466b, 1);
  graphics.strokeCircle(0, 0, 12);
  graphics.lineStyle(4, 0xffffff, 1);
  graphics.beginPath();
  graphics.moveTo(-6, 0);
  graphics.lineTo(-1, 5);
  graphics.lineTo(7, -5);
  graphics.strokePath();
}

// 왼쪽 손님 주문 카드: 줄 선 손님, 주문 모찌들과 완성 체크, 참을성, 판매가, 목표 개수, [영업 시작]·[다음 손님] 버튼
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

    this.waitingGraphics = WAITING_POSITIONS.map(([x, y]) => scene.add.graphics({ x, y }).setScale(WAITING_SCALE));
    this.customerGraphics = scene.add.graphics({ x: FRONT_X, y: FRONT_Y });
    scene.tweens.add({
      targets: this.customerGraphics,
      y: FRONT_Y - 5,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    this.patienceGraphics = scene.add.graphics();

    this.emptyGraphics = scene.add.graphics({ x: 210, y: ITEM_Y });
    this.itemGraphics = [];
    this.checkGraphics = [];
    for (let i = 0; i < MAX_ITEMS; i += 1) {
      const check = scene.add.graphics().setVisible(false);

      drawCheck(check);
      this.itemGraphics.push(scene.add.graphics({ x: 210, y: ITEM_Y }));
      this.checkGraphics.push(check);
    }

    this.nameText = scene.add.text(210, 432, '', textStyle(28)).setOrigin(0.5);
    this.priceText = scene.add.text(210, 490, '', textStyle(26)).setOrigin(0.5);
    this.goalText = scene.add.text(210, 540, '', textStyle(21, false)).setOrigin(0.5);
    this.button = createButton(scene, 100, 462, 220, 48, 0x8fd48a, '', onButton);
    this.button.setVisible(false);
  }

  // 맨 앞 손님이 다가와 주문을 보여 준다.
  showOrder(order, look, price) {
    const { scene } = this;
    const count = order.items.length;
    const positions = itemPositions(count);
    const scale = count === 1 ? 1 : 0.6;

    this.hideButton();
    this.priceText.setVisible(true);
    this.emptyGraphics.clear();

    this.customerGraphics.clear();
    drawCustomer(this.customerGraphics, look.face, look.bow);
    this.customerGraphics.setScale(0);
    scene.tweens.add({ targets: this.customerGraphics, scale: 1, duration: 350, ease: 'Back.easeOut' });

    scene.tweens.killTweensOf(this.itemGraphics);
    this.itemGraphics.forEach((graphics, i) => {
      graphics.clear().setAlpha(1).setScale(0);
      this.checkGraphics[i].setVisible(false);

      if (i >= count) {
        return;
      }

      graphics.setPosition(positions[i], ITEM_Y);
      drawFruitMochi(graphics, 0, 0, order.items[i]);
      scene.tweens.add({ targets: graphics, scale, duration: 350, delay: 120 + i * 60, ease: 'Back.easeOut' });
    });

    this.nameText.setText(count === 1 ? order.items[0] : `모찌 ${count}개 주문`);
    this.setPrice(price);
  }

  // 완성한 모찌가 날아갈 주문 칸 위치
  slotPosition(index) {
    return { x: this.itemGraphics[index].x, y: ITEM_Y };
  }

  markDone(index) {
    const item = this.itemGraphics[index];
    const check = this.checkGraphics[index];

    item.setAlpha(0.4);
    check.setPosition(item.x + 20, ITEM_Y + 20).setVisible(true).setScale(0);
    this.scene.tweens.add({ targets: check, scale: 1, duration: 250, ease: 'Back.easeOut' });
  }

  setPrice(price) {
    this.priceText.setText(`판매가 ${price}원`);
  }

  // 맨 앞 손님 뒤에 기다리는 손님들
  setWaiting(looks) {
    this.waitingGraphics.forEach((graphics, i) => {
      graphics.clear();

      if (looks[i]) {
        drawCustomer(graphics, looks[i].face, looks[i].bow);
      }
    });
  }

  // ratio: 남은 참을성 비율(0~1), null이면 게이지를 숨긴다.
  setPatience(ratio) {
    const graphics = this.patienceGraphics;

    graphics.clear();

    if (ratio === null) {
      return;
    }

    const fillHeight = Math.max(0, ratio) * (PATIENCE_HEIGHT - 6);

    graphics.fillStyle(0xffffff, 1);
    graphics.fillRoundedRect(PATIENCE_X, PATIENCE_Y, PATIENCE_WIDTH, PATIENCE_HEIGHT, 9);
    graphics.fillStyle(ratio > 0.3 ? 0x8fd48a : 0xff6f8e, 1);
    graphics.fillRoundedRect(
      PATIENCE_X + 3,
      PATIENCE_Y + 3 + (PATIENCE_HEIGHT - 6 - fillHeight),
      PATIENCE_WIDTH - 6,
      fillHeight,
      Math.min(6, fillHeight / 2),
    );
    graphics.lineStyle(3, 0x5a466b, 1);
    graphics.strokeRoundedRect(PATIENCE_X, PATIENCE_Y, PATIENCE_WIDTH, PATIENCE_HEIGHT, 9);
  }

  showEmpty() {
    this.customerGraphics.clear();
    this.itemGraphics.forEach((graphics) => graphics.clear());
    this.checkGraphics.forEach((check) => check.setVisible(false));
    this.emptyGraphics.clear();
    this.emptyGraphics.fillStyle(0x5a466b, 0.35);
    [-24, 0, 24].forEach((dx) => this.emptyGraphics.fillCircle(dx, 0, 8));
    this.nameText.setText('손님 없음');
    this.priceText.setVisible(false);
    this.setPatience(null);
  }

  // 판매한 모찌가 손님에게 도착한 뒤 손님이 떠난다.
  leave() {
    this.hideButton();
    this.setPatience(null);
    this.checkGraphics.forEach((check) => check.setVisible(false));
    this.scene.tweens.killTweensOf(this.itemGraphics);
    this.scene.tweens.add({
      targets: [this.customerGraphics, ...this.itemGraphics],
      scale: 0,
      duration: 250,
      delay: 450,
      ease: 'Back.easeIn',
      onComplete: () => this.showEmpty(),
    });
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

  setPrepGoal(stock, goal) {
    this.goalText.setText(`손질 재고 ${stock} / ${goal}개`);
  }

  setSales(count, goal) {
    this.goalText.setText(`목표 판매 ${count} / ${goal}개`);
  }

  popGoal() {
    popText(this.scene, this.goalText);
  }
}
