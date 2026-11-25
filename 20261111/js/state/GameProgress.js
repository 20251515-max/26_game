import { GOAL_SALES, PREP_GOAL_PIECES, PREP_TIME_SECONDS, TIME_LIMIT_SECONDS } from '../config/GameRules.js';
import { ShopExpansion } from '../shop/ShopExpansion.js';

// 한 판의 진행 상태: 단계(prep 손질 → serving 영업), 남은 시간, 손질 개수, 보유 금액, 판매 개수, 가게 확장 단계
export class GameProgress {
  constructor() {
    this.stage = 'prep';
    this.remainingSeconds = PREP_TIME_SECONDS;
    this.preppedPieces = 0;
    this.money = 0;
    this.salesCount = 0;
    this.shop = new ShopExpansion();
  }

  get isPrepGoalReached() {
    return this.preppedPieces >= PREP_GOAL_PIECES;
  }

  get isGoalReached() {
    return this.salesCount >= GOAL_SALES;
  }

  get isTimeUp() {
    return this.remainingSeconds <= 0;
  }

  addPrepped(pieces) {
    this.preppedPieces += pieces;
  }

  startServing() {
    this.stage = 'serving';
    this.remainingSeconds = TIME_LIMIT_SECONDS;
  }

  priceOf(mochi) {
    return this.shop.priceOf(mochi);
  }

  // 판매하고 받은 금액을 돌려준다.
  sell(mochi) {
    const price = this.priceOf(mochi);

    this.money += price;
    this.salesCount += 1;

    return price;
  }

  tick() {
    this.remainingSeconds -= 1;
  }

  get canExpand() {
    return !this.shop.isMaxed && this.money >= this.shop.nextCost;
  }

  // 확장하고 쓴 비용을 돌려준다. canExpand일 때만 부른다.
  expand() {
    const cost = this.shop.nextCost;

    this.money -= cost;
    this.shop.expand();

    return cost;
  }
}
