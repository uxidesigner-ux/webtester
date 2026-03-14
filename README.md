# webtester report platform (GitHub-only MVP)

정적 HTML/CSS/JS + GitHub Pages 기반으로 여러 리포트를 운영하는 플랫폼입니다.

## 루트/경로 역할
- `/` : 플랫폼 홈 (역할 안내 + 운영 방식 + 빠른 진입)
- `/admin/` : 관리자 작성 도구 (draft 작성/preview/import/export)
- `/reports/` : 발행된 리포트 목록 (build 결과)
- `/reports/{slug}/` : 개별 발행 리포트 상세

## 프로젝트 구조
- `admin/index.html`: 관리자 페이지 (기본 정보 편집 + 블록 추가/삭제/순서 변경 + localStorage + JSON import/export + preview)
- `content/reports/*.json`: 리포트 원본 데이터 (샘플: `middle-east-2025`, `middle-east-war-2026`, `tesla-weekly`)
- `src/rendering/*`: 공통 report/block/chart renderer
- `scripts/build-static.mjs`: `content/reports`를 읽어 `dist/reports/*` 생성
- `dist/reports/*`: **generated output** (repo source가 아니라 build 산출물)

## reports 디렉토리 정책
- source repo에는 `reports/*.html`를 직접 두지 않습니다.
- 리포트 목록/상세 페이지는 `npm run build` 시 `dist/reports/index.html`, `dist/reports/{slug}/index.html`로 생성됩니다.
- 따라서 PR에는 generated HTML이 아니라 `content/reports/*.json + renderer + build script + admin` 변경만 포함하는 것이 원칙입니다.

## 운영 흐름 요약
1. `/admin/`에서 draft 작성/수정
2. localStorage로 draft 저장(브라우저 내부)
3. JSON 내보내기(발행 후보)
4. `content/reports/{slug}.json` 반영 후 commit
5. build/deploy 이후 `/reports/`에 published 반영

## 관리자 페이지 사용법
1. `npm run dev` 후 `http://localhost:5173/admin/` 접속
2. 기본 정보 입력 (slug, title, subtitle, description, date, theme, sources)
3. 블록 타입 선택 후 `블록 추가`, 블록 목록에서 `삭제/순서 변경`
4. rich-text 블록은 전용 편집 UI에서 title/description/body/references[] 수정
5. `초안 저장/불러오기`로 localStorage 관리
6. `JSON 내보내기`로 파일 저장 후 `content/reports/{slug}.json` 반영

## JSON import/export
- Import: 관리자 페이지의 `JSON 가져오기`
- Export: 관리자 페이지의 `JSON 내보내기`
- 주의: 런타임 GitHub write/DB 저장은 지원하지 않음

## 새 리포트 추가
1. admin에서 JSON 작성/내보내기
2. `content/reports/{slug}.json` 추가
3. `npm run check && npm run build`
4. `dist/reports/{slug}/index.html` 생성 확인

## 샘플 `middle-east-2025` 추가 이유
- 플랫폼 전환 초기에 작성된 기존 샘플 데이터를 보존하기 위한 레퍼런스입니다.
- `middle-east-war-2026`, `tesla-weekly`와 함께 서로 다른 주제/구조의 JSON 예시를 제공해 admin + renderer + build 검증 범위를 넓힙니다.

## build / preview
- Check: `npm run check`
- Build: `npm run build`
- Preview: `npm run preview`
- 확인 경로
  - `/`
  - `/admin/`
  - `/reports/`
  - `/reports/middle-east-war-2026/`
  - `/reports/tesla-weekly/`

## GitHub Pages 배포 방식
- 정적 산출물은 `dist/`
- `dist/content/reports/*.json` + `dist/src/js/report-page.js`를 통해 렌더링
- chart block은 JSON 데이터 기반 렌더링(하드코딩 금지)

## Base path / 경로 주의사항
- GitHub Pages repo 서브패스(`/webtester/`) 환경을 고려해 상대 경로 사용
- report 페이지는 `data-report-json` 상대경로로 JSON fetch
- `/` 절대경로 자산 참조 금지

## GitHub-only MVP 한계
- 관리자 페이지에서 repo에 직접 저장/발행 불가
- 실제 발행은 repo 파일 반영 + commit/push + Pages 배포 필요

## 남은 수동 작업
- GitHub Actions 배포 워크플로에서 `dist/` 업로드 단계 점검