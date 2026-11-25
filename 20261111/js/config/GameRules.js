// MVP 규칙 상수
// 모찌 종류: 딸기·포도·복숭아·망고 (orders/Order.js의 FRUIT_MOCHI_TYPES)
// 주문 표현: 손님 주문 카드에 모찌 한 개를 그림과 이름으로 표시
// 제작 조작: 반죽 그림 클릭 → 작업대 반죽 3번 클릭(밀기) → 과일 그림 클릭 → 반죽 3번 클릭(감싸기)
// 과일 손질: 과일 그림 클릭 → 도마 과일 2번 클릭(씻기) → 2번 클릭(자르기) → 손질된 과일 2개
// 1단계 손질: 제한 시간 안에 과일을 목표 개수 이상 손질한다. 못 채우면 실패.
// 2단계 영업: 손님이 계속 오고, 제한 시간 안에 모찌를 목표 개수만큼 판다. 손질은 할 수 없다.

export const PREP_TIME_SECONDS = 60;
export const PREP_GOAL_PIECES = 12;

export const TIME_LIMIT_SECONDS = 90;

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

// 성공 조건: 제한 시간 안에 모찌를 목표 개수만큼 판매
export const GOAL_SALES = 10;
