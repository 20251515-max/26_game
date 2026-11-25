import { EXPANSION_COSTS, MOCHI_PRICES, PRICE_BONUS_PER_LEVEL } from '../config/GameRules.js';

// 가게 확장 단계와 그에 따른 판매가를 관리한다.
export class ShopExpansion {
  constructor() {
    this.level = 0;
  }

  get isMaxed() {
    return this.level >= EXPANSION_COSTS.length;
  }

  get nextCost() {
    return EXPANSION_COSTS[this.level];
  }

  expand() {
    this.level += 1;
  }

  priceOf(mochi) {
    return MOCHI_PRICES[mochi] + this.level * PRICE_BONUS_PER_LEVEL;
  }
}
