---
name: 운동 기록
description: 운동과 식단을 식품 포장의 영양정보 표처럼 읽는 개인용 기록 PWA
colors:
  paper: "#EEF1EF"
  white: "#FFFFFF"
  ink: "#121212"
  ink-2: "#4F5752"
  hair: "#C9CFCB"
  green: "#0B5D44"
  green-ink: "#0B6B4B"
  green-tint: "#E6F1EA"
  on-green-muted: "#D5E8DE"
  yellow: "#FFD23F"
  red: "#C3301E"
typography:
  display:
    fontFamily: "Pretendard, -apple-system, Apple SD Gothic Neo, sans-serif"
    fontSize: "30px"
    fontWeight: 900
    lineHeight: 1.1
    letterSpacing: "-0.02em"
    fontFeature: "tnum"
  headline:
    fontFamily: "Pretendard, -apple-system, Apple SD Gothic Neo, sans-serif"
    fontSize: "28px"
    fontWeight: 900
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Pretendard, -apple-system, Apple SD Gothic Neo, sans-serif"
    fontSize: "24px"
    fontWeight: 900
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title-sm:
    fontFamily: "Pretendard, -apple-system, Apple SD Gothic Neo, sans-serif"
    fontSize: "18px"
    fontWeight: 900
  body:
    fontFamily: "Pretendard, -apple-system, Apple SD Gothic Neo, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.45
    fontFeature: "tnum"
  body-sm:
    fontFamily: "Pretendard, -apple-system, Apple SD Gothic Neo, sans-serif"
    fontSize: "15px"
    fontWeight: 400
  label:
    fontFamily: "Pretendard, -apple-system, Apple SD Gothic Neo, sans-serif"
    fontSize: "14px"
    fontWeight: 700
  label-sm:
    fontFamily: "Pretendard, -apple-system, Apple SD Gothic Neo, sans-serif"
    fontSize: "12px"
    fontWeight: 700
rounded:
  none: "0px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  panel-x: "14px"
  lg: "16px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 18px"
    height: "52px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 12px"
    height: "44px"
  button-danger:
    backgroundColor: "transparent"
    textColor: "{colors.red}"
    rounded: "{rounded.none}"
    padding: "0 18px"
    height: "52px"
  panel:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "12px 14px 14px"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "10px 12px"
    height: "48px"
  stepper-current:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    rounded: "{rounded.none}"
    height: "52px"
  set-check:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.none}"
    size: "48px"
  set-check-done:
    backgroundColor: "{colors.green-ink}"
    textColor: "{colors.white}"
  set-row-current:
    backgroundColor: "{colors.green-tint}"
  set-row-pr:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.ink}"
  dock-next:
    backgroundColor: "{colors.green}"
    textColor: "{colors.white}"
    rounded: "{rounded.none}"
    padding: "0 18px"
    height: "72px"
  dock-timer:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    rounded: "{rounded.none}"
    height: "72px"
  shell-band:
    backgroundColor: "{colors.green}"
    textColor: "{colors.white}"
    typography: "{typography.display}"
    padding: "14px 16px 12px"
  nav-tab:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink-2}"
    typography: "{typography.label-sm}"
    height: "64px"
  nav-tab-active:
    textColor: "{colors.ink}"
  chip:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 14px"
    height: "44px"
  segment-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
---

# Design System: 운동 기록

## Overview

**Creative North Star: "영양정보 표시"**

화면 전체가 식품 포장 뒷면의 영양정보 표처럼 읽힌다. 초록빛 도는 연회색 바탕 위에 흰 표가 놓이고, 표는 위쪽 굵은 괘선으로 시작해 굵기가 다른 괘선으로 위계를 나눈다. 숫자는 Pretendard Black의 고정폭 숫자로 크게, 비교값(지난번·목표)은 같은 줄 오른쪽이나 바로 아래 줄에 작게 붙는다. 장식은 없고, 굵기와 괘선과 세 가지 의미색만으로 상태를 말한다.

밀도는 높지만 엄지 기준이다. 표 안의 행은 촘촘하게 괘선으로 쌓이고, 손이 닿는 컨트롤은 44px 이상, 핵심 동작은 하단 고정 독(72px)에 모인다. 모든 모서리는 직각이다. 그림자는 화면 위에 떠 있는 하단 독 하나에만 있다.

셸은 진한 초록 띠다. 각 탭의 맨 위에서 제목과 진행 상황을 싣고, 같은 초록이 하단의 '세트 완료' 독에서 다시 나타나 위아래로 화면을 묶는다.

**Key Characteristics:**
- 초록빛 연회색 바탕(paper) 위 흰 표, 잉크 검정 테두리
- 7px / 3px / 1px 괘선 위계, 1.5px 외곽 테두리
- 모든 모서리 0px
- Pretendard 400 / 700 / 900, 숫자는 전부 고정폭(tnum)
- 의미색 셋: 초록 계열 = 셸·완료, 노랑 = PR, 빨강 = 목표 초과·감소
- 그림자는 하단 독에만

## Colors

차가운 회녹색 무채색 위에 진한 초록 하나와 두 개의 신호색만 얹은 팔레트.

### Primary
- **전나무 초록 (green)**: 셸 띠 배경, 하단 '다음 세트 완료' 독 배경, 테마 색. 넓은 면적을 채우는 초록.
- **완료 도장 초록 (green-ink)**: 완료된 세트의 체크 칸, 완료된 종목의 번호 표시, 지난번 대비 증가값(+2.5kg), 포커스 링과 입력 캐럿. 흰 바탕 위에서 글자·작은 면으로 쓰이는 초록.
- **새싹 틴트 (green-tint)**: 지금 입력 중인 세트 행의 배경, 방금 완료한 행이 가라앉을 때의 시작색.
- **띠 위 보조 글자 (on-green-muted)**: 초록 띠·독 위의 부제, 동기화 상태, 독의 종목 라벨.

### Secondary
- **기록 노랑 (yellow)**: PR 세트 행 전체 배경, 잉크 바탕 'PR' 표식의 글자색.

### Tertiary
- **초과 빨강 (red)**: 영양 목표를 넘은 퍼센트와 막대의 초과분, 지난번 대비 감소값, 삭제 버튼의 테두리와 글자.

### Neutral
- **바탕 (paper)**: 문서 바탕, 영양 막대의 빈 홈.
- **표 흰색 (white)**: 패널·입력·대화상자·탭바 면.
- **잉크 (ink)**: 본문 글자, 모든 테두리와 굵은 괘선, 주 버튼 배경, 선택된 세그먼트·탭, 영양 막대 채움.
- **보조 잉크 (ink-2)**: 메타 정보, 지난번 비교 문장, 비활성 탭, 닫기 아이콘, 끝난 종목 이름.
- **가는 괘선 (hair)**: 데이터 행 사이 1px 선, 끝난 종목 한 줄의 테두리.

### Named Rules
**The 색 하나 의미 하나 Rule.** 초록 계열은 셸과 완료(및 그 진행: 지금 세트·증가), 노랑은 PR, 빨강은 목표 초과·감소에만 쓴다. 그 밖의 모든 강조는 잉크의 굵기와 반전(잉크 바탕 흰 글자)으로 한다.

**The 잉크 반전 Rule.** 선택 상태(세그먼트, 탭, 슈퍼세트 태그, 주 버튼)는 색이 아니라 잉크 바탕 + 흰 글자로 표시한다.

## Typography

**Display Font:** Pretendard Black 900 (with -apple-system, Apple SD Gothic Neo)
**Body Font:** Pretendard Regular 400 / Bold 700, 같은 패밀리
**Label/Mono Font:** 별도 없음. 고정폭 숫자(font-variant-numeric: tabular-nums)를 문서 전체에 건다.

**Character:** 한 패밀리의 세 굵기만으로 영양정보 표의 '굵은 항목명, 보통 수치' 위계를 만든다. 자체 호스팅 서브셋 woff2이며 Black은 preload된다.

### Hierarchy
- **Display** (900, 30px, 1.1, -0.02em): 셸 띠의 화면 제목, 열량·단백질 큰 수치, 휴식 타이머 숫자.
- **Headline** (900, 28px, 1.1): 라벨 제목('영양정보', 종목 정보 대화상자 제목).
- **Title** (900, 24px, 1.2): 펼친 종목 이름, 지금 세트 스테퍼 숫자, 영양 퍼센트. 독의 '55kg × 7회 완료'는 22px.
- **Title-sm** (900, 17–20px): 패널 제목(18px), 루틴 고르기 이름(20px), 기록 행의 최고값(17px), 영양 항목명(17px).
- **Body** (400, 16px, 1.45): 기본 글자와 입력. 표 행은 15px.
- **Label** (700, 13–14px): 폼 라벨(13px), 고스트·칩·탭 버튼(14px).
- **Label-sm** (700, 12px): 표의 열 머리(#, kg, 회, 완료 / 음식, 양, kcal, 단백질), 탭바 라벨, 태그.

### Named Rules
**The 숫자는 Black Rule.** 기록되는 값(무게, 횟수, kcal, g, 퍼센트, 세트 번호)은 900으로, 단위와 비교 문장은 400–700으로 작게 붙인다.

**The 끊지 않는 한글 Rule.** 제목·종목명·행 이름은 word-break: keep-all로 어절 단위 줄바꿈한다.

## Layout

단일 열, 최대 폭 560px 가운데 정렬. 데스크톱에서도 같은 폭의 열이 회녹색 바탕 가운데 놓일 뿐 다단으로 바뀌지 않는다. 패널·한 줄 종목·칩 줄은 좌우 12px 바깥 여백, 패널 안쪽은 좌우 14px. 행 간격은 4 / 8 / 12 / 16px 단위로 움직인다.

화면 순서는 위에서 아래로 셸 띠 → 패널들 → (고정) 하단 독 → (고정) 탭바. 본문 아래 여백은 탭바(64px) + 독(72px) + 24px + safe-area만큼 확보해 마지막 행이 독에 가리지 않는다. 세트 행은 scroll-margin으로 독 위에 멈춘다.

세트 행은 4열 그리드(번호 20px / kg / 회 / 체크 48px)이고, 지금 세트는 3열로 바뀌어 kg·회 스테퍼가 위아래로 쌓이고 오른쪽에 112px 높이의 체크 칸이 선다. 비교 문장은 항상 입력 아래 줄 전체 폭을 쓴다.

## Elevation & Depth

평면 시스템이다. 깊이는 괘선 굵기와 면의 색(바탕 paper → 흰 표)으로 만든다. 그림자는 화면 위에 고정되어 떠 있는 하단 독(다음 세트 버튼, 휴식 타이머)에만 있다. 대화상자는 그림자 없이 잉크 55% 배경막으로 분리된다.

### Shadow Vocabulary
- **독 부유** (`box-shadow: 0 6px 18px rgb(18 18 18 / .22)`): 하단 독이 스크롤되는 표 위에 떠 있음을 알린다. 다른 곳에 쓰지 않는다.

### Named Rules
**The 괘선 위계 Rule.** 7px 잉크 괘선은 패널·대화상자의 윗변과 라벨 머리 아래(새 표의 시작), 3px 잉크 괘선은 열 머리 아래·큰 영양 항목 아래·탭바 윗변·대화상자 안 소제목 위, 1px 잉크 괘선은 표 안 첫 행과 영양 세부 행, 1px hair 괘선은 데이터 행 사이. 외곽 테두리는 1.5px 잉크.

## Shapes

모든 모서리는 0px다. 입력, 버튼, 패널, 대화상자, 체크 칸, 칩, 진행 막대까지 예외가 없다. 형태 언어는 직사각형과 괘선뿐이고, 활성 탭은 탭 위쪽 4px 잉크 막대(inset)로, 셸의 진행 세그먼트는 종목마다 6px 높이 칸을 3px 간격으로 늘어놓아 표시한다. 아이콘은 22px 선 아이콘(stroke 2, round cap), 버튼 안에서는 16px.

## Components

### Buttons
- **Shape:** 직각 (0px)
- **Primary:** 잉크 바탕, 흰 글자 700, 높이 52px, 좌우 18px. 화면 폭 버튼은 좌우 12px 들여 배치.
- **Ghost:** 1.5px 잉크 테두리, 투명 바탕, 700 14px, 높이 44px. 띠 위에서는 테두리가 흰색 70%.
- **Danger:** 1.5px 빨강 테두리와 빨강 글자, 높이 52px.
- **Hover / Focus:** 누르면 1px 아래로 눌림. 포커스는 3px green-ink 외곽선, 2px 띄움. hover 전용 처리는 없다.

### Chips
- **Style:** 흰 바탕, 1.5px 잉크 테두리, 700 14px, 높이 44px, 앞에 16px 아이콘.
- **State:** 동작용(평소 식단 불러오기 등)만 있고 선택 상태 칩은 없다. 단일 선택은 세그먼트로 한다.

### Cards / Containers
- **Corner Style:** 직각 (0px)
- **Background:** white
- **Shadow Strategy:** 없음 (Elevation 참조)
- **Border:** 1.5px 잉크, 윗변만 7px 잉크
- **Internal Padding:** 12px 14px 14px

### Inputs / Fields
- **Style:** 흰 바탕, 1.5px 잉크 테두리, 직각, 최소 높이 48px, 16px(줌 방지).
- **Focus:** 3px green-ink 외곽선. 캐럿도 green-ink.
- **Stepper:** 테두리 한 칸 안에 − / 값 / + . 지금 세트에서는 높이 52px, 값 24px 900 오른쪽 정렬 + 단위(kg·회) 14px 700. 다른 세트에서는 ±가 사라지고 값만 남는다(44px). 완료된 세트의 스테퍼 테두리는 green-ink.
- **Segment:** 1.5px 잉크 틀을 1px 잉크 세로선으로 4등분, 선택 칸은 잉크 반전.

### Navigation
- **탭바:** 하단 고정, 흰 면, 위 3px 잉크 괘선, 4등분, 높이 64px. 아이콘 22px 위 + 12px 700 라벨. 비활성 ink-2, 활성은 ink + 위쪽 4px 잉크 막대 + 아이콘 선 2.5.
- **보조 탭(관리):** 1.5px 잉크 틀 안에 1px 세로선으로 나뉜 버튼, 선택은 잉크 반전, 가로 스크롤.

### 셸 띠
green 바탕 흰 글자. 왼쪽에 Display 제목과 on-green-muted 부제(14px), 오른쪽 아래 정렬로 흰 테두리 고스트 버튼(종료, 날짜 이동). 운동 중에는 아래에 종목별 진행 세그먼트(흰색 채움 / 흰색 25% 빈 칸).

### 세트 행
번호 900 15px, kg·회 스테퍼, 48px 체크 칸(2px 잉크 테두리). 아래 줄 13px ink-2로 '지난번 55×6' + 차이값 900(증가 green-ink, 감소 red). 지금 세트는 green-tint 배경을 패널 좌우 끝까지 펼친다. 완료 시 체크 칸이 green-ink로 채워지며 0.45s 도장 애니메이션(scale .6 → 1.12 → 1), 행은 0.6s 동안 green-tint에서 가라앉는다. reduced-motion이면 둘 다 없다. PR 세트는 행 전체가 yellow, 비교 문장은 ink, 'PR' 표식은 잉크 바탕 노랑 글자.

### 접힌 종목 한 줄
흰 바탕 1.5px 잉크 테두리, 최소 60px. 왼쪽 28px 번호 칸, 이름 16px 700 말줄임. 끝난 종목은 투명 바탕 + hair 테두리, 번호 칸이 green-ink 체크로, 이름은 ink-2.

### 하단 독
탭바 바로 위에 고정, 72px. 평소엔 green 바탕의 '다음 세트 완료' 버튼(13px on-green-muted 종목 라벨 위, 22px 900 값 아래). 휴식 중엔 잉크 바탕 타이머(30px 900 남은 시간, 흰 50% 테두리 버튼 둘, 바닥 5px 진행 막대).

### 영양정보 라벨
라벨 제목(Headline) + 13px 부제 + 7px 괘선. 열량·단백질은 같은 무게의 큰 행: 항목명 17px 900 / 값 30px 900 + 단위·목표 / 오른쪽 끝 퍼센트 24px 900, 아래 8px 막대(잉크 채움, 초과분은 red), 3px 괘선. 지방·탄수화물은 1px 잉크 괘선의 15px 세부 행.

## Do's and Don'ts

### Do:
- **Do** 새 표면을 흰 패널로 시작하고 윗변을 7px 잉크 괘선으로 연다.
- **Do** 열 머리 아래는 3px 잉크, 데이터 행 사이는 1px hair로 나눈다.
- **Do** 기록 값은 Pretendard 900 고정폭 숫자로, 비교값은 같은 줄 오른쪽이나 바로 아래 줄에 ink-2로 붙인다.
- **Do** 터치 대상은 44px 이상, 주 동작은 52px 이상, 세트 완료는 하단 독(72px)에 둔다.
- **Do** 선택 상태는 잉크 바탕 + 흰 글자로 표시한다.
- **Do** 모션은 상태 변화(세트 완료 도장)에만 쓰고 prefers-reduced-motion에서 끈다.

### Don't:
- **Don't** 모서리를 둥글게 하지 않는다. 모든 radius는 0px.
- **Don't** 초록·노랑·빨강을 장식이나 일반 강조에 쓰지 않는다. 각 색은 정해진 한 가지 상태에만 쓴다.
- **Don't** 하단 독 외의 요소에 그림자를 주지 않는다.
- **Don't** 흰 카드 목록 + 파란 버튼의 운동앱 기본형으로 돌아가지 않는다.
- **Don't** 지난번 기록을 다른 화면이나 접힌 영역으로 숨기지 않는다.
