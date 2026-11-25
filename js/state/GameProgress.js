import { PREP_TIME_SECONDS, TIME_LIMIT_SECONDS, getRoundRules } from '../config/GameRules.js';
import { ShopExpansion } from '../shop/ShopExpansion.js';

// 한 판의 진행 상태: 라운드와 단계(prep 손질 → serving 영업), 남은 시간, 판매 개수, 보유 금액, 가게 확장 단계
export class GameProgress {
  constructor() {
    this.round = 1;
    this.rules = getRoundRules(1);
    this.stage = 'prep';
    this.remainingSeconds = PREP_TIME_SECONDS;
    this.roundSales = 0;
    this.totalSales = 0;
    this.money = 0;
    this.shop = new ShopExpansion();
  }

  get isGoalReached() {
    return this.roundSales >= this.rules.goalSales;
  }

  get isTimeUp() {
    return this.remainingSeconds <= 0;
  }

  startServing() {
    this.stage = 'serving';
    this.remainingSeconds = TIME_LIMIT_SECONDS;
  }

  // 다음 라운드의 손질 단계로 넘어간다. 보유 금액과 가게 확장은 이어진다.
  nextRound() {
    this.round += 1;
    this.rules = getRoundRules(this.round);
    this.stage = 'prep';
    this.remainingSeconds = PREP_TIME_SECONDS;
    this.roundSales = 0;
  }

  priceOf(mochi) {
    return this.shop.priceOf(mochi);
  }

  priceOfOrder(order) {
    return order.items.reduce((sum, mochi) => sum + this.priceOf(mochi), 0);
  }

  // 주문을 한꺼번에 판매하고 받은 금액을 돌려준다.
  sell(order) {
    const price = this.priceOfOrder(order);

    this.money += price;
    this.roundSales += order.items.length;
    this.totalSales += order.items.length;

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
