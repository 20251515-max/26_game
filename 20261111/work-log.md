2026-11-11 16:25 / 11주차 게임 기획안을 참고해 spec.md 작성 / spec.md, prompt.txt, work-log.md / 기획안에 명시된 게임명·루프·성공 및 실패 조건만으로 최소 명세를 구성함
2026-11-11 16:27 / MVP 구현 작업 목록 작성 / tasks.md, prompt.txt, work-log.md / 명세의 핵심 루프를 독립적으로 확인 가능한 구현 단위와 Live Server 검증 기준으로 분할함
2026-11-11 16:30 / 시작·플레이·결과 장면과 화면 전환 구현 / index.html, js/main.js, js/scenes/StartScene.js, js/scenes/PlayScene.js, js/scenes/ResultScene.js, tasks.md, prompt.txt, work-log.md / 화면별 책임을 분리하고 다시 하기는 PlayScene을 새로 시작해 판 상태를 초기화하도록 구성함
2026-11-11 16:58 / 과일 모찌 첫 주문 생성 및 표시 / js/orders/Order.js, js/scenes/PlayScene.js, tasks.md, prompt.txt, work-log.md / 과일 모찌 목록에서 무작위로 주문 한 건을 골라 플레이 화면에 표시하도록 구성함
2026-11-18 15:55 / 모찌 공장 디자인 가이드 작성 / design.md, prompt.txt, work-log.md / 명세의 가로형 주문·제작·확장 흐름을 빠르게 읽는 밝은 카툰 스타일로 시각 원칙을 정함
2026-11-18 15:58 / 디자인 가이드 명세 대조 / prompt.txt, work-log.md / 디자인 가이드가 요청한 색상·타이포그래피·버튼·배치·제외 항목을 이미 모두 충족해 코드와 디자인 문서를 유지함
2026-11-18 15:58 / 시작 화면 디자인 적용 / js/scenes/StartScene.js, prompt.txt, work-log.md / 디자인 가이드의 파스텔 팔레트·둥근 카툰 모찌·입체 버튼을 시작 장면에만 적용해 기존 화면 전환을 유지함
2026-11-18 16:17 / 플레이 화면 시각 스타일 적용 / js/scenes/PlayScene.js, tasks.md, prompt.txt, work-log.md / 첨부 목업의 구성은 사용하지 않고 색감·패널·입체 버튼 언어만 적용해 기존 주문 생성과 결과 이동을 유지함
2026-11-18 16:17 / 시작 버튼 클릭 영역 수정 / js/scenes/StartScene.js, prompt.txt, work-log.md / 글자 픽셀에만 한정된 클릭 판정을 보이는 버튼 전체 영역으로 확장해 장면 전환을 복구함
2026-11-18 16:22 / 주문 모찌 과일별 색상 적용 / js/orders/Order.js, js/scenes/PlayScene.js, prompt.txt, work-log.md / 주문 이름과 색상을 같은 주문 모듈에서 연결해 과일 종류마다 주문 카드 모찌 색이 달라지게 함
2026-11-18 16:24 / 주문 모찌 과일별 일러스트 적용 / js/scenes/PlayScene.js, prompt.txt, work-log.md / 이미지 파일 없이 과일 고유의 씨·알갱이·잎·과육 형태를 코드로 그려 주문 종류를 시각적으로 구분함
2026-11-18 16:27 / 조합형 모찌 제작 조작 추가 / js/production/MochiMaker.js, js/scenes/PlayScene.js, tasks.md, prompt.txt, work-log.md / 찹쌀 반죽을 먼저 선택하고 과일 재료를 선택해야 모찌가 완성되도록 제작 규칙과 화면 조작을 분리해 구현함
2026-11-18 16:34 / MVP 규칙 상수 확정 및 초기 시간·주문 정보 표시 / js/config/GameRules.js, js/scenes/PlayScene.js, tasks.md, prompt.txt, work-log.md / 사용자가 고른 시간·과일별 금액·단계별 확장 비용·판매 개수 목표를 한 규칙 모듈에 모아 이후 판매·타이머·확장 작업이 같은 값을 쓰게 함
2026-11-18 16:40 / 연속 주문 제작·판매와 귀여운 연출 추가 / js/scenes/PlayScene.js, js/orders/Order.js, js/ui/CuteShapes.js, tasks.md, prompt.txt, work-log.md / 주문 일치 시 판매·다음 주문으로 루프를 잇고, 사용자가 고른 손님 캐릭터·통통 애니메이션·배경 장식을 도형 모듈로 분리해 추가함
2026-11-18 16:42 / 제한 시간 감소와 시간 종료 실패 처리 / js/scenes/PlayScene.js, tasks.md, prompt.txt, work-log.md / 1초 반복 타이머로 남은 시간을 갱신하고, 0초가 되면 제작 입력을 막은 뒤 실패 결과 화면으로 이동하게 함
2026-11-18 16:43 / 목표 판매 달성 시 성공 처리 / js/scenes/PlayScene.js, tasks.md, prompt.txt, work-log.md / 시간 종료와 같은 종료 함수를 공유해 목표 개수 판매 즉시 입력·타이머를 멈추고 성공 결과로 이동하게 함
2026-11-18 16:48 / 그림 클릭과 밀기·감싸기 단계로 제작 방식 변경 / js/production/MochiMaker.js, js/scenes/PlayScene.js, js/ui/CuteShapes.js, js/config/GameRules.js, prompt.txt, work-log.md / 사용자가 고른 클릭 방식으로 반죽 올리기→3번 밀기→과일 올리기→3번 감싸기 단계를 제작 모듈에 두고, 단계가 늘어난 만큼 제한 시간을 90초로 늘림
2026-11-18 16:54 / 시작 화면 연습하기 버튼과 튜토리얼 연습 모드 추가 / js/tutorial/TutorialGuide.js, js/scenes/PlayScene.js, js/scenes/StartScene.js, js/scenes/ResultScene.js, spec.md, tasks.md, prompt.txt, work-log.md / 플레이 화면을 그대로 재사용하고 안내 단계별로 허용 조작을 제한해 실제 조작을 따라 하며 배우도록 하고, 안내 모듈은 별도 파일로 분리함
