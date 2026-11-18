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

export function createInitialOrder() {
  const randomIndex = Phaser.Math.Between(0, FRUIT_MOCHI_TYPES.length - 1);

  return FRUIT_MOCHI_TYPES[randomIndex];
}

export function getMochiColor(order) {
  return FRUIT_MOCHI_COLORS[order];
}
