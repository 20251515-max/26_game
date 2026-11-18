export const FRUIT_INGREDIENTS = ['딸기', '포도', '복숭아', '망고'];

export function makeFruitMochi(hasDough, fruit) {
  if (!hasDough || !FRUIT_INGREDIENTS.includes(fruit)) {
    return null;
  }

  return `${fruit} 모찌`;
}
