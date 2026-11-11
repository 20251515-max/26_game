export const FRUIT_MOCHI_TYPES = [
  '딸기 모찌',
  '포도 모찌',
  '복숭아 모찌',
  '망고 모찌',
];

export function createInitialOrder() {
  const randomIndex = Phaser.Math.Between(0, FRUIT_MOCHI_TYPES.length - 1);

  return FRUIT_MOCHI_TYPES[randomIndex];
}
