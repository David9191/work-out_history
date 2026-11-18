---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: ["style.css","app.js"]
---

# 앱 전체 (운동 / 식단 / 기록 / 관리)

Mode: Operate. 헬스장에서 세트 사이 한 손으로 기록. 우선순위: 지금 할 세트 → 지난번 대비 → 오늘 진행률. 식단은 칼로리와 단백질을 같은 무게로.

## Direction contract

THESIS: 운동과 식단을 식품 포장의 '영양정보' 표처럼 읽는다. 굵은 숫자 한 줄, 두꺼운 괘선, 오른쪽 끝은 항상 목표·지난번 대비. 흰 카드 목록 + 파란 버튼이라는 운동앱 기본형을 거부한다.

OWN-WORLD: 초록빛 도는 연회색 바탕(#EEF1EF), 잉크 검정, 패널은 위 7px 두꺼운 괘선 + 1.5px 테두리, 행은 1px 괘선. 상단 셸 띠는 진한 초록. 색 하나에 의미 하나: 초록=완료, 노랑=PR, 빨강=미달·초과. Pretendard(Regular/Bold/Black), 숫자는 고정폭.

STORY: 열면 오늘 루틴이 초록 띠에 진행률과 함께 있고, 지금 할 종목 하나만 크게 펼쳐져 있다. 세트마다 지난번 값과 차이가 바로 옆에 보인다. 엄지로 하단 버튼을 눌러 세트를 끝낸다.

FIRST VIEWPORT: 상단 초록 띠(루틴명 Black 28px, 날짜, 종목·세트 진행 세그먼트 바, 종료). 그 아래 지금 종목 라벨 패널: 종목명, 괘선, 열 머리(세트·kg·회·완료), 세트 행마다 아래 줄에 '지난번 55×6 · +2.5kg'. 끝난/다음 종목은 한 줄로 접힘. 하단 고정 독: '3세트 완료 55kg × 7' 큰 버튼, 휴식 중엔 타이머로 바뀜. 그 아래 탭바.

FORM: 영양정보 표시 (자체 후보 3번, 추첨 배정). 끌어온 규율: 초점 하나만 펼치기(스트리밍 벽), 색 하나 의미 하나(암실 기록지), 괘선 모듈 밀도(일본 고밀도 웹). seed:c631e18814004e6c

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
