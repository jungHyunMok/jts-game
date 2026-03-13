# 🎮 등교 대작전 (School Day Adventure)

> 인천 부평구 초등학생을 위한 교육용 웹 게임
> 힐스테이트 부평 아파트 → 인천백운초등학교까지의 하루를 게임으로 경험해요!

---

## 📌 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **프레임워크** | Next.js 16 (App Router) |
| **언어** | TypeScript |
| **스타일링** | Tailwind CSS v4 |
| **렌더링** | HTML5 Canvas + React |
| **대상** | 초등학교 저학년 (6~9세) |
| **플랫폼** | 데스크탑 + 모바일 (반응형) |

---

## 🗂️ 게임 구성

### 🚸 게임 1 — 등교 대작전 (`/crossing`)

차를 피해 횡단보도를 건너 학교까지 안전하게 이동하는 게임

- **난이도 1~10단계** 슬라이더로 선택
- 단계 클리어 시 자동으로 다음 단계 진행 (3초 카운트다운)
- 10단계 완료 시 전체 클리어

| 난이도 | 차량 수 | 차량 속도 | 차량 크기 |
|--------|---------|---------|---------|
| 1단계 | 적음 | 매우 느림 | 작음 |
| 5단계 | 보통 | 보통 | 보통 |
| 10단계 | 많음 | 빠름 | 큼 |

**조작법**
- 데스크탑: `↑ ↓ ← →` 방향키
- 모바일: 화면 하단 D-패드 버튼

---

### 🏫 게임 2 — 학교 하루 대작전 (`/school-day`)

등교부터 귀가까지 하루 일과를 **12가지 미니게임**으로 체험

```
⏰ 기상 → 🍳 아침밥 → 🚸 등굣길 → 🏫 교문 → 👟 신발장
→ 🗺️ 교실찾기 → 🙏 인사 → 📚 수업 → 🔍 방과후 → 🥋 태권도픽업
→ 🚐 차량이동 → 🏠 귀가
```

#### 스테이지 상세

| # | 제목 | 게임 방식 | 교육 요소 |
|---|------|----------|----------|
| 1 | ⏰ 기상 | 알람 버튼 연타 | 규칙적인 기상 습관 |
| 2 | 🍳 아침밥 | 건강 식품 4가지 선택 | 영양 균형 교육 |
| 3 | 🚸 등굣길 | 차 피해 횡단 (Canvas) | 교통 안전 |
| 4 | 🏫 교문 통과 | 버튼 연타 달리기 | 등교 시간 준수 |
| 5 | 👟 신발장 찾기 | 번호 그리드 탭 | 정리정돈 |
| 6 | 🗺️ 교실 찾기 | 층수/반 탐색 | 공간 인식 |
| 7 | 🙏 선생님 인사 | 타이밍 게임 | 예의범절 |
| 8 | 📚 수업 시간 | 4지선다 퀴즈 (랜덤 과목) | 수학·국어·영어·체육 |
| 9 | 🔍 방과후 교실 | 카드 뒤집기 | 집중력 |
| 10 | 🥋 태권도 픽업 | 진짜 사범님 식별 | **낯선 사람 안전 교육** |
| 11 | 🚐 차량 이동 | 장애물 피하기 (Canvas) | 교통 안전 |
| 12 | 🏠 집으로 | 점프 게임 (Canvas) | 건강한 식습관 |

**점수 시스템**
- 각 스테이지 최대 100점 → 12단계 합산 최대 **1,200점**
- ⭐ 1개: 0~49점 / ⭐⭐ 2개: 50~79점 / ⭐⭐⭐ 3개: 80~100점

---

## 📁 프로젝트 구조

```
app/
├── page.tsx                          # 메인 메뉴 (게임 선택)
├── layout.tsx                        # 루트 레이아웃
├── globals.css
│
├── crossing/
│   └── page.tsx                      # 등교 대작전 페이지
│
├── school-day/
│   ├── page.tsx                      # 학교 하루 대작전 페이지
│   └── components/
│       ├── GameManager.tsx           # 12단계 게임 오케스트레이터
│       └── stages/
│           ├── stageTypes.ts         # 공통 타입 및 메타데이터
│           ├── Stage01WakeUp.tsx
│           ├── Stage02Breakfast.tsx
│           ├── Stage03WalkSchool.tsx
│           ├── Stage04SchoolGate.tsx
│           ├── Stage05Shoes.tsx
│           ├── Stage06Classroom.tsx
│           ├── Stage07Greet.tsx
│           ├── Stage08Class.tsx
│           ├── Stage09AfterSchool.tsx
│           ├── Stage10Pickup.tsx
│           ├── Stage11VanDrive.tsx
│           └── Stage12WalkHome.tsx
│
└── components/
    └── game/                         # 등교 대작전 공유 컴포넌트
        ├── GameCanvas.tsx            # 메인 캔버스 컴포넌트
        ├── useGameLogic.ts           # 게임 로직 훅
        ├── drawMap.ts                # 맵 렌더링
        ├── drawPlayer.ts             # 캐릭터 렌더링
        ├── drawCars.ts               # 차량 렌더링
        ├── MobileControls.tsx        # 모바일 D-패드
        ├── constants.ts              # 게임 상수
        └── types.ts                  # TypeScript 타입
```

---

## 🚀 로컬 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

---

## ☁️ Vercel 배포

```bash
# 프로덕션 빌드 확인
npm run build

# Vercel CLI로 배포
npx vercel --prod
```

또는 [Vercel 대시보드](https://vercel.com)에서 이 레포를 연결하면 자동 배포됩니다.
별도 환경변수 설정 없이 바로 배포 가능합니다.

---

## 🛠️ 기술 스택

```
Next.js 16.1.6      App Router, Static Export
React 19.2.3        Functional Components, Hooks
TypeScript 5        Strict 타입 체크
Tailwind CSS 4      유틸리티 퍼스트 스타일링
HTML5 Canvas        게임 렌더링 (requestAnimationFrame)
```

**Canvas 게임 패턴**
- `useRef`로 가변 게임 상태 관리 (리렌더링 없이 60fps 유지)
- `useState`는 UI 반영이 필요한 값만 (점수, 타이머, 상태)
- CSS 스케일링으로 480px 고정 캔버스를 반응형 처리

---

## 🗺️ 게임 배경

| 장소 | 실제 주소 |
|------|----------|
| 출발지 (집) | 힐스테이트 부평, 인천 부평구 경원대로 1192 |
| 도착지 (학교) | 인천백운초등학교, 인천 부평구 아트센터로 130 |

---

## 📄 라이선스

MIT License

---

*Made with ❤️ for children in Incheon Bupyeong*
