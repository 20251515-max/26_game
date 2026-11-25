// MVP 규칙 상수
// 모찌 종류: 딸기·포도·복숭아·망고 (orders/Order.js의 FRUIT_MOCHI_TYPES)
// 주문 표현: 맨 앞 손님의 주문 카드에 주문한 모찌들을 그림으로 표시
// 제작 조작: 반죽 그림 클릭 → 작업대 반죽 3번 클릭(밀기) → 과일 그림 클릭 → 반죽 3번 클릭(감싸기)
// 과일 손질: 과일 그림 클릭 → 도마 과일 2번 클릭(씻기) → 2번 클릭(자르기) → 손질된 과일 2개
// 라운드: 1단계 손질 → 2단계 영업. 판매 목표를 채우면 다음 라운드로, 못 채우면 실패.

export const PREP_TIME_SECONDS = 60;
export const TIME_LIMIT_SECONDS = 90;

// 라운드 n의 규칙
// goalSales: 영업 단계 판매 목표(모찌 개수), prepGoal: 손질 단계가 끝날 때 가지고 있어야 할 재고 합계
// minItems~maxItems: 한 손님이 주문하는 모찌 개수, queueSize: 줄 선 손님 수(맨 앞 손님 포함)
export function getRoundRules(round) {
  const goalSales = 10 + (round - 1) * 5;
  const itemRanges = { 1: [1, 1], 2: [1, 2] };
  const [minItems, maxItems] = itemRanges[round] || [2, 3];

  return {
    goalSales,
    prepGoal: Math.ceil((goalSales + 2) / 2) * 2,
    minItems,
    maxItems,
    queueSize: Math.min(round, 3),
  };
}

// 맨 앞 손님의 참을성: 기본 시간 + 주문한 모찌 1개당 시간 (연습 모드에는 없음)
export const PATIENCE_BASE_SECONDS = 10;
export const PATIENCE_PER_MOCHI_SECONDS = 8;

export const MOCHI_PRICES = {
  '딸기 모찌': 1000,
  '포도 모찌': 1200,
  '복숭아 모찌': 1500,
  '망고 모찌': 2000,
};

// 단계별 확장 비용 (최대 3단계)
export const EXPANSION_COSTS = [3000, 5000, 8000];

// 확장 1단계마다 모든 모찌 판매가에 더해지는 금액
export const PRICE_BONUS_PER_LEVEL = 200;
