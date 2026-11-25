export const FRUIT_MOCHI_TYPES = [
  '딸기 모찌',
  '포도 모찌',
  '복숭아 모찌',
  '망고 모찌',
];

export const FRUIT_MOCHI_COLORS = {
  '딸기 모찌': 0xff9bb3,
  '포도 모찌': 0xb89ae6,
  '복숭아 모찌': 0xffc1ae,
  '망고 모찌': 0xffd86b,
};

export function getMochiColor(mochi) {
  return FRUIT_MOCHI_COLORS[mochi];
}

export function fruitOf(mochi) {
  return mochi.replace(' 모찌', '');
}

// 손님 한 명의 주문: 모찌 여러 개(종류가 섞일 수 있음)와 각 모찌의 완성 여부
export class Order {
  constructor(items) {
    this.items = [...items].sort((a, b) => FRUIT_MOCHI_TYPES.indexOf(a) - FRUIT_MOCHI_TYPES.indexOf(b));
    this.done = this.items.map(() => false);
  }

  get remaining() {
    return this.items.filter((item, index) => !this.done[index]);
  }

  get isComplete() {
    return this.done.every(Boolean);
  }

  // 만든 모찌를 아직 완성되지 않은 같은 칸에 채운다. 채운 칸 번호, 맞는 칸이 없으면 -1을 돌려준다.
  fill(mochi) {
    const index = this.items.findIndex((item, i) => item === mochi && !this.done[i]);

    if (index >= 0) {
      this.done[index] = true;
    }

    return index;
  }

  // 남은 주문을 만드는 데 필요한 과일 개수 { 과일: 개수 }
  neededFruits() {
    const counts = {};

    this.remaining.forEach((item) => {
      const fruit = fruitOf(item);

      counts[fruit] = (counts[fruit] || 0) + 1;
    });

    return counts;
  }
}

export function createOrder(minItems, maxItems) {
  const count = Phaser.Math.Between(minItems, maxItems);
  const items = Array.from({ length: count }, () => Phaser.Utils.Array.GetRandom(FRUIT_MOCHI_TYPES));

  return new Order(items);
}
