# UI 스타일 / CSS / 태그 규칙 정리 (재사용 가이드)

이 문서는 제공된 대시보드 HTML을 기준으로, 다음 제작에도 일관되게 재사용할 수 있도록 **디자인 토큰, 컴포넌트 규칙, 태그/구조 규칙, 상호작용 규칙**을 정리한 문서입니다.

---

## 1) 전체 디자인 방향

- **레이아웃 성격**: 고정 사이드바 + 긴 스크롤형 단일 페이지 리포트.
- **톤앤매너**: 분석 리포트형(신뢰/경고 중심), 하이라이트 컬러로 위험도 강조.
- **스타일 전략**:
  - Tailwind 유틸리티 클래스로 빠른 레이아웃/타이포 구성.
  - 반복 컴포넌트는 커스텀 클래스(`.kpi-card`, `.strategy-card` 등)로 패턴화.
  - 차트는 Chart.js, 폰트는 Paperlogy를 사용해 통일감 유지.

---

## 2) 디자인 토큰 (재사용 권장값)

### 2.1 타이포그래피

- 기본 폰트 스택:
  - `"Paperlogy", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, ... sans-serif`
- 텍스트 계층:
  - 페이지 핵심 타이틀: `text-4xl ~ text-5xl`, `font-black`, `tracking-tight`
  - 섹션 타이틀: `text-3xl ~ text-4xl`, `font-black`
  - 본문: `text-sm ~ text-lg`, `leading-relaxed`
  - 보조 정보/메타: `text-xs`, `text-gray-4xx~5xx`

### 2.2 컬러 시스템

- **Primary (위기/강조)**: Red 계열
  - 핵심: `#ff4d4f`
  - Tailwind 대응: `red-500/600/700`, `red-50/100/200`
- **Neutral (기본 텍스트/배경)**:
  - 본문 텍스트: `#1f2937` (`gray-800`)
  - 보조 텍스트: `#4b5563` (`gray-600`)
  - 배경: `#ffffff`, `#f9fafb`
  - 경계선: `#e5e7eb`, `#f3f4f6`
- **보조 강조**:
  - 위험/경고: `amber`, `orange`
  - 안정/대비: `blue`, `gray-800`

### 2.3 라운드/그림자/전환

- 공통 라운드: `rounded-lg`(0.5rem), `rounded-xl`(0.75rem)
- 카드 그림자:
  - 기본: 약한 shadow (`shadow-sm` 또는 custom light shadow)
  - hover: 그림자 증가 + `translateY(-2~5px)`
- 전환:
  - 기본 `transition: all/transform/box-shadow 0.3s ease`

---

## 3) 레이아웃 규칙

### 3.1 페이지 구조

- 루트: `min-h-screen flex`
- 모바일 상단 바: `md:hidden fixed top-0 ... z-50`
- 사이드바:
  - 폭 `w-64`, 고정 `fixed inset-y-0 left-0`
  - 모바일: 기본 숨김 `-translate-x-full`
  - 데스크톱: `md:translate-x-0`
- 메인 콘텐츠:
  - 데스크톱 왼쪽 여백: `md:ml-64`
  - 상단 패딩: 모바일 `pt-20`, 데스크톱 `md:pt-8`

### 3.2 섹션 단위

- 각 챕터는 `<section id="..." class="content-section mb-20">`
- `scroll-margin-top: 80px`으로 앵커 이동 시 헤더 가림 방지.
- 권장 순서:
  1. 섹션 배지 (`SECTION N — ...`)
  2. 섹션 제목
  3. 요약 문단
  4. 브리지 박스(`.section-bridge`, 선택)
  5. 본문 컴포넌트(카드/표/차트)

---

## 4) 핵심 컴포넌트 규칙

### 4.1 네비게이션

- 클래스: `.nav-link`
- 상태:
  - 기본: 회색 텍스트
  - hover/active: 빨강 배경 + 흰 텍스트
- 번호 배지: `.section-number` (원형, 작은 숫자)

### 4.2 카드 계열

- KPI 카드: `.kpi-card`
  - 연한 빨강 보더 + 붉은 그림자로 긴장감 표현
  - 상단 보더 색으로 데이터 성격 구분 (`border-t-red-500`, `border-t-gray-800`)
- 전략 카드: `.strategy-card`
  - 중립 카드 기반 + hover 시 빨강 계열 강조
- 시나리오 카드: `.scenario-card`
  - 카드 상단 헤더로 상태/확률 라벨 표현
  - 가장 중요한 카드만 `border-2 border-red-300`로 차별화

### 4.3 인사이트/브리지/인용

- 인사이트 박스: `.insight-box`
  - 그라데이션 배경 + 연한 경계선
- 섹션 브리지: `.section-bridge`
  - 좌측 포인트 보더 + 연회색 배경
- 전문가 인용문: `.expert-quote`
  - 좌측 빨강 보더 + 좌→우 fade 배경

### 4.4 타임라인

- 컨테이너 축: `.timeline-container::before`
- 각 이벤트: `.timeline-item`
- 포인트: `.timeline-dot`
- 실제 구현은 phase 블록(P1~P3) 형태로 변형되어 사용되며,
  - 단계별 색상(`amber`, `orange`, `red`)을 일관 유지.

### 4.5 표(Table)

- 클래스: `.geopolitics-table`
- 규칙:
  - `th`: 진한 배경 + 대문자 + 작은 글자 + tracking
  - `td`: 작은 글씨 + 행 구분선
  - `tr:hover td`: 연한 빨강 hover 배경
- 표 컨테이너: `overflow-x-auto`로 모바일 대응 필수.

### 4.6 리스크 미터

- 트랙: `.risk-meter`
- 채움: `.risk-meter-fill`
- 값 표현 방식:
  - 시각 bar + 우측 숫자 텍스트 병행.
  - 색상은 위험도에 따라 `red > amber > blue/gray`.

### 4.7 CTA 링크

- 클래스: `.cta-slide-link`
- 스타일:
  - 진한 그라데이션 배경 + hover lift
  - 외부 링크는 `target="_blank"` 사용

---

## 5) 태그(HTML) 규칙

### 5.1 시맨틱 우선

- 상위 구조: `<main>`, `<aside>`, `<nav>`, `<section>` 적극 사용.
- 섹션 식별: `id` 부여 + 사이드바 앵커와 1:1 매핑.
- 제목 계층:
  - 페이지 메인: `h1`
  - 섹션: `h2`
  - 하위 블록: `h3`, `h4`

### 5.2 텍스트/강조

- 핵심 수치/키워드: `<strong>` 사용.
- 전문가 발언: `<blockquote>` 사용.
- 순차 프로세스: `<ol>` + 단계 문장.

### 5.3 인터랙션 접근성

- 아코디언 트리거는 `<button>` 사용 (링크 대신).
- 아이콘은 장식 목적이면 `svg` inline 사용 가능.
- 모바일 메뉴 버튼은 명확한 클릭 영역(`p-2`) 유지.

### 5.4 링크 정책

- 외부 링크: 새 탭(`target="_blank"`) + 링크 목적이 드러나는 라벨.
- 내부 이동: `href="#section-id"` 형태 고정.

---

## 6) JavaScript 동작 규칙

### 6.1 공통 원칙

- `DOMContentLoaded` 이후 이벤트 바인딩.
- 요소가 없는 경우를 고려한 null-safe 처리 (`if (el)`).

### 6.2 인터랙션 패턴

1. **Accordion**
   - 버튼 `data-target`로 콘텐츠 id 연결.
   - `hidden` 클래스 토글 + 아이콘 회전(`rotate-180`) 토글.
2. **모바일 메뉴**
   - 사이드바에 `-translate-x-full` 토글.
3. **ScrollSpy**
   - 스크롤 위치 기준 현재 섹션 계산.
   - 네비게이션 active 스타일 동적 반영.
4. **앵커 스크롤 보정**
   - `window.scrollTo({ top: sectionTop - 80, behavior: 'smooth' })`

### 6.3 차트 규칙 (Chart.js)

- 전역 기본값 통일:
  - `Chart.defaults.font.family = 'Paperlogy'`
  - `Chart.defaults.color = '#4b5563'`
- 차트 타입 혼합:
  - 비중: doughnut
  - 비교/랭킹: bar (`indexAxis: 'y'` 적극 활용)
- 캔버스 래핑:
  - `.chart-container`로 높이 고정(대부분 220~350px)

---

## 7) 반응형 규칙

- 브레이크포인트 기준:
  - `md` 이전: 상단바 + 오프캔버스 사이드바
  - `md` 이후: 고정 사이드바 상시 노출
- 그리드 원칙:
  - 기본 `grid-cols-1`
  - 정보량 증가 시 `md:grid-cols-2`, `lg:grid-cols-3/4`
- 모바일 안정성:
  - 표는 가로 스크롤 허용
  - 긴 제목은 줄바꿈 허용

---

## 8) 재사용용 클래스 네이밍 규약 (권장)

- 컴포넌트형: `*-card`, `*-box`, `*-table`, `*-link`
  - 예: `kpi-card`, `strategy-card`, `insight-box`
- 상태형: `active`, `hidden`, `hover` 파생
- 테마형: `theme-text-primary`, `phase-1/2/3`

> 권장: 새 컴포넌트 추가 시 **유틸리티만으로 반복되는 구조**는 커스텀 클래스로 승격해 중복을 줄입니다.

---

## 9) 다음 작업 시 바로 쓰는 체크리스트

- [ ] 섹션은 `id + .content-section`으로 선언했는가?
- [ ] 사이드바 앵커와 섹션 순서가 정확히 일치하는가?
- [ ] Red 중심 강조/Neutral 배경의 톤 균형이 유지되는가?
- [ ] 카드 hover/전환(0.3s) 규칙이 일관적인가?
- [ ] 표는 모바일에서 `overflow-x-auto` 처리했는가?
- [ ] 차트 폰트/색 기본값을 전역에서 통일했는가?
- [ ] 아코디언/모바일메뉴/스크롤스파이 동작이 충돌하지 않는가?

---

## 10) 빠른 템플릿 스켈레톤

```html
<section id="sample" class="content-section mb-20">
  <div class="inline-block px-3 py-1 bg-red-100 text-red-700 font-bold text-sm rounded-full mb-4">SECTION X — TITLE</div>
  <h2 class="text-3xl md:text-4xl font-black mb-3 text-gray-900 tracking-tight">섹션 제목</h2>
  <p class="text-gray-600 mb-8 max-w-3xl">섹션 요약</p>

  <div class="section-bridge">
    <p class="text-sm text-gray-700"><strong>맥락:</strong> 앞/뒤 섹션을 연결하는 문장</p>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div class="strategy-card">...</div>
    <div class="strategy-card">...</div>
  </div>
</section>
```

필요 시 이 문서를 기준으로 **컴포넌트 카탈로그 버전(예: Storybook 스타일)**로 확장하면, 다음 프로젝트에서도 동일한 품질로 빠르게 재생산할 수 있습니다.
