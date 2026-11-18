export const FRUIT_INGREDIENTS = ['딸기', '포도', '복숭아', '망고'];
export const ROLL_CLICKS = 3;
export const WRAP_CLICKS = 3;

// 제작 단계: empty(빈 작업대) → dough(반죽 밀기) → rolled(과일 올리기) → filled(반죽 감싸기) → 완성
export class MochiMaker {
  constructor() {
    this.reset();
  }

  reset() {
    this.step = 'empty';
    this.rollCount = 0;
    this.wrapCount = 0;
    this.fruit = null;
  }

  placeDough() {
    if (this.step !== 'empty') {
      return false;
    }

    this.step = 'dough';
    return true;
  }

  addFruit(fruit) {
    if (this.step !== 'rolled' || !FRUIT_INGREDIENTS.includes(fruit)) {
      return false;
    }

    this.fruit = fruit;
    this.step = 'filled';
    return true;
  }

  // 작업대의 반죽을 클릭했을 때: 밀기 또는 감싸기를 한 번 진행한다.
  pressDough() {
    if (this.step === 'dough') {
      this.rollCount += 1;

      if (this.rollCount >= ROLL_CLICKS) {
        this.step = 'rolled';
      }

      return { action: 'roll' };
    }

    if (this.step === 'filled') {
      this.wrapCount += 1;

      if (this.wrapCount >= WRAP_CLICKS) {
        const mochi = `${this.fruit} 모찌`;

        this.reset();
        return { action: 'done', mochi };
      }

      return { action: 'wrap' };
    }

    return { action: 'none' };
  }
}
