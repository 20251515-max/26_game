import { FRUIT_INGREDIENTS } from './MochiMaker.js';

export const WASH_CLICKS = 2;
export const CUT_CLICKS = 2;
export const PIECES_PER_PREP = 2;

// 손질 단계: empty(빈 도마) → wash(씻기) → cut(자르기) → 손질된 과일 재고 증가
export class FruitPrep {
  constructor() {
    this.stock = {};
    FRUIT_INGREDIENTS.forEach((fruit) => {
      this.stock[fruit] = 0;
    });
    this.reset();
  }

  reset() {
    this.step = 'empty';
    this.fruit = null;
    this.washCount = 0;
    this.cutCount = 0;
  }

  get isBusy() {
    return this.step !== 'empty';
  }

  start(fruit) {
    if (this.isBusy || !FRUIT_INGREDIENTS.includes(fruit)) {
      return false;
    }

    this.fruit = fruit;
    this.step = 'wash';
    return true;
  }

  // 도마의 과일을 클릭했을 때: 씻기 또는 자르기를 한 번 진행한다.
  press() {
    if (this.step === 'wash') {
      this.washCount += 1;

      if (this.washCount >= WASH_CLICKS) {
        this.step = 'cut';
      }

      return { action: 'wash' };
    }

    if (this.step === 'cut') {
      this.cutCount += 1;

      if (this.cutCount >= CUT_CLICKS) {
        const { fruit } = this;

        this.stock[fruit] += PIECES_PER_PREP;
        this.reset();
        return { action: 'done', fruit };
      }

      return { action: 'cut' };
    }

    return { action: 'none' };
  }

  hasStock(fruit) {
    return this.stock[fruit] > 0;
  }

  hasAnyStock() {
    return FRUIT_INGREDIENTS.some((fruit) => this.hasStock(fruit));
  }

  useStock(fruit) {
    if (!this.hasStock(fruit)) {
      return false;
    }

    this.stock[fruit] -= 1;
    return true;
  }
}
