2026-11-11 16:25 / 11주차 게임 기획안을 참고해 spec.md 작성 / spec.md, prompt.txt, work-log.md / 기획안에 명시된 게임명·루프·성공 및 실패 조건만으로 최소 명세를 구성함
2026-11-11 16:27 / MVP 구현 작업 목록 작성 / tasks.md, prompt.txt, work-log.md / 명세의 핵심 루프를 독립적으로 확인 가능한 구현 단위와 Live Server 검증 기준으로 분할함
2026-11-11 16:30 / 시작·플레이·결과 장면과 화면 전환 구현 / index.html, js/main.js, js/scenes/StartScene.js, js/scenes/PlayScene.js, js/scenes/ResultScene.js, tasks.md, prompt.txt, work-log.md / 화면별 책임을 분리하고 다시 하기는 PlayScene을 새로 시작해 판 상태를 초기화하도록 구성함
2026-11-11 16:58 / 과일 모찌 첫 주문 생성 및 표시 / js/orders/Order.js, js/scenes/PlayScene.js, tasks.md, prompt.txt, work-log.md / 과일 모찌 목록에서 무작위로 주문 한 건을 골라 플레이 화면에 표시하도록 구성함
2026-11-18 15:55 / 모찌 공장 디자인 가이드 작성 / design.md, prompt.txt, work-log.md / 명세의 가로형 주문·제작·확장 흐름을 빠르게 읽는 밝은 카툰 스타일로 시각 원칙을 정함
2026-11-18 15:58 / 디자인 가이드 명세 대조 / prompt.txt, work-log.md / 디자인 가이드가 요청한 색상·타이포그래피·버튼·배치·제외 항목을 이미 모두 충족해 코드와 디자인 문서를 유지함
2026-11-18 15:58 / 시작 화면 디자인 적용 / js/scenes/StartScene.js, prompt.txt, work-log.md / 디자인 가이드의 파스텔 팔레트·둥근 카툰 모찌·입체 버튼을 시작 장면에만 적용해 기존 화면 전환을 유지함
2026-11-18 16:17 / 플레이 화면 시각 스타일 적용 / js/scenes/PlayScene.js, tasks.md, prompt.txt, work-log.md / 첨부 목업의 구성은 사용하지 않고 색감·패널·입체 버튼 언어만 적용해 기존 주문 생성과 결과 이동을 유지함
2026-11-18 16:17 / 시작 버튼 클릭 영역 수정 / js/scenes/StartScene.js, prompt.txt, work-log.md / 글자 픽셀에만 한정된 클릭 판정을 보이는 버튼 전체 영역으로 확장해 장면 전환을 복구함
