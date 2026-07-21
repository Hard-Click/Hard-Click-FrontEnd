# WORKFLOW — 협업 · Git · PR 규칙

> 출처: 팀 노션 **`개발 규칙`** 문서 + 실제 레포 설정(`.github/`, GitHub 라벨). 코드로는 알 수 없는 **사람끼리의 약속**만 적는다.
> 코드 스타일·아키텍처 규칙은 별도 문서(`CODE_CONVENTION` / `ARCHITECTURE`) 참고.

---

## 1. 개발 플로우

```
이슈 생성 → 브랜치(develop 기준) → 개발·커밋·push → PR(base develop) → 리뷰 1+ Approve → Merge
```

- **이슈 번호가 브랜치·커밋·PR을 잇는 고리**다. 이슈 없이 브랜치를 따는 것은 지양한다.
- **default 브랜치 = `develop`** ⚠️확인(실제 레포 default = `develop` 확인함). `main`은 릴리즈 전용.
- 웹/컨테이너 세션에서 작업할 경우 **커밋·푸시하지 않은 작업은 세션 종료 시 사라진다.** 작업 단위마다 푸시할 것.

---

## 2. 브랜치 네이밍

```
{type}/{도메인}-{기능}#{이슈번호}
```

예: `feature/auth-login#16` · `fix/course-imageUpload#200` · `fix/notice-banner#425`
(실제 레포 브랜치들이 이 규칙을 따름 — `feature/account-autoLock#448` 등)

- **type**: `feature`(기본) / `feat` / `fix` / `refactor` / `docs` / `chore` / `style` / `design`
- **도메인 접두사** (코드 밖 약속 — 폴더명과 1:1 아님):

  | 접두사 | 의미 | 접두사 | 의미 |
  |---|---|---|---|
  | `auth` | 인증 | `payment` | 결제 |
  | `account` | 계정·프로필 | `noti` | 알림 |
  | `common` | 공통 | `learning` | 학습 |
  | `course` | 강의 | `notice` | 공지 |
  | `instructor` | 강사 | `mypage` | 마이페이지 |
  | `commu` | 커뮤니티 | `enroll` | 수강 |

- 생성:
  ```bash
  git checkout develop && git pull
  git checkout -b feature/{도메인}-{기능}#{이슈번호}
  ```

---

## 3. 커밋 컨벤션

- 형식: `[TYPE] 요약 #이슈번호`
- **한 커밋 = 한 작업.** 본문은 **WHY 위주** bullet.
- `[TYPE]`은 **대문자**로, PR 타입과 일치시킨다. 예: `[FEAT] 강의 목록 페이지 #123` · `[FIX] 수강평 평점 반올림 #257`
- **커밋 제목 끝에 반드시 이슈번호 `#N`을 붙인다.**

---

## 4. PR 규칙

- **base는 항상 `develop`** — `main` 직접 PR ❌.
- 올리기 전 로컬에서 `npm run build` + `npm run lint` **통과**시킨다. (⚠️ 빈 `page.tsx`가 있으면 빌드 실패)
- **PR 제목** = `[TYPE] 요약 #이슈`. 작업 중이면 **Draft**로 올린다.
- PR 본문에 `Closes #N`으로 이슈를 연결한다.
- **PR 크기**: ~200줄(이상적) / ~500(OK) / 500+ (분리 권장).
- **Merge 방식**:
  - 일반 PR = **Squash and Merge**
  - 큰 기능 / `develop` → `main` = **Merge commit**
- **리뷰**: **최소 1명 Approve** 후 머지. **본인 PR을 본인이 머지하지 않는다.**
- **브랜치 보호**: `main`·`develop`은 PR + Approve 필수, force push ❌, **직접 push 절대 금지**.

### 이슈 제목 vs PR/커밋 제목 — 이슈번호 붙이는 위치 ⚠️

| 위치 | `#N` | 이유 |
|---|---|---|
| **이슈 제목** | ❌ 안 붙임 | 자기 자신을 가리키는 셈이라 |
| **브랜치명** | `...#N` | 이슈 연결 |
| **커밋 제목** | 끝에 `#N` | 이슈 연결 |
| **PR 제목** | 끝에 `#N` | 이슈 연결 |
| **PR 본문** | `Closes #N` | 자동 close |

---

## 5. 라벨 — ⚠️ 실제 레포에 있는 것만 쓴다 ⭐

> 이슈/PR 템플릿의 front-matter(`labels: feature` 등)와 **실제 GitHub 라벨 목록이 어긋난다.** 없는 라벨을 `gh --label`로 붙이면 **명령 자체가 실패**하므로 주의.

**실제 레포에 존재하는 라벨** (팀 커스텀):

| 라벨 | 상태 |
|---|---|
| `feature` | ✅ 있음 |
| `bug` | ✅ 있음 (GitHub 기본, 버그용) |
| `documentation` | ✅ 있음 (GitHub 기본, 문서용) |
| `enhancement` | ✅ 있음 (GitHub 기본) |
| `merge` | ✅ 있음 |
| `refector` | ✅ 있음 — **철자 오타(정상은 `refactor`)이지만 이대로 존재.** 그대로 쓴다. |

**템플릿엔 있지만 라벨은 없는 것** → 붙이면 실패:

- `fix` ❌ → 버그는 **`bug`** 사용
- `docs` ❌ → 문서는 **`documentation`** 사용
- `style` · `test` · `design` · `chore` ❌ → 라벨 생략하거나 위 존재 라벨로 대체

> 🙋요청: `refector` 오타 라벨을 `refactor`로 고칠지 팀에서 결정 필요. 고치면 이 문서·템플릿·기존 이슈 라벨을 함께 갱신할 것.

### 역할 태그 (이슈·PR 공통, 본문 체크박스)

`stu`(학생) · `pro`(강사) · `man`(관리자) · `공통`

---

## 6. 이슈 / PR 템플릿

> 실제 템플릿 파일은 레포 루트 **`.github/`** 에 있고(⚠️확인: 앱 폴더 `hard-click-frontend/`가 아니라 **저장소 루트**), GitHub 웹에서 이슈/PR 생성 시 **자동 적용**된다.
> `gh` CLI로 만들 때는 자동 적용이 **안 되므로** 아래 형식에 맞춰 `--body`를 직접 작성한다.

### 유형별 매핑 (이슈 템플릿 · 제목 prefix · 브랜치 · 라벨)

| 작업 유형 | 이슈 템플릿 | 제목 prefix | 브랜치 prefix | 붙일 라벨(실제) |
|---|---|---|---|---|
| 기능 추가 | `ISSUE_TEMPLATE/feature.md` | `[FEAT] ` | `feature/` | `feature` |
| 버그 수정 | `ISSUE_TEMPLATE/fix.md` | `[FIX] ` | `fix/` | `bug` (템플릿의 `fix` 라벨은 없음) |
| 문서 | `ISSUE_TEMPLATE/docs.md` | `[DOCS] ` | `docs/` | `documentation` (템플릿의 `docs` 라벨은 없음) |
| 리팩터 | (전용 없음 → **`feature.md` 양식** 사용) | `[REFACTOR] ` | `refactor/` | `refector` |

> 새 이슈 유형이 필요하면 `.github/ISSUE_TEMPLATE/`에 같은 형식(front-matter `name`/`title`/`labels` 포함)으로 추가한다.

### PR 템플릿 (`.github/PULL_REQUEST_TEMPLATE.md`)

체크박스는 **전부 유지**하고 해당 항목만 `[x]` 체크한다(일부만 발췌 ❌). 선택 섹션(스크린샷 등)도 빈 칸으로라도 **모든 섹션 포함**한다.

```markdown
## 📋 PR 타입            ← feature / fix / style / refactor / docs / test / design / chore / merge 중 체크(복수 가능)
## 🙋 관련 역할          ← stu / pro / man / 공통
## 📝 작업 내용          ← 변경 내용 bullet
## ✅ 작업 체크리스트
- [ ] 브랜치 명명 규칙 준수
- [ ] 커밋 컨벤션 준수
- [ ] 불필요한 console 제거
- [ ] 테스트 완료
- [ ] 민감 정보 포함 여부 확인
## 🔗 연관 이슈          ← Closes #<이슈번호>
## 📸 스크린샷 (선택)     ← Before / After 표
## 💬 리뷰 포인트
## 📝 추가 메모
```

### 이슈 템플릿 (`.github/ISSUE_TEMPLATE/*.md`)

| 템플릿 | front-matter title | 주요 섹션 |
|---|---|---|
| **feature.md** | `[FEAT] ` | ✨ 기능 설명 · 🙋 역할 · 🔍 작업 상세(체크리스트) · 📎 브랜치 `feature/` · 🔗 참고/관련이슈 · 📝 메모 |
| **fix.md** | `[FIX] ` | 🐛 버그 설명 · 🔄 재현 방법 · 💥 기대 vs 실제(표) · 🙋 역할 · 📸 스샷/에러로그 · 📎 브랜치 `fix/` · 🔗 관련이슈 |
| **docs.md** | `[DOCS] ` | 📄 문서 설명 · 📂 대상(README/코드컨벤션/API명세/컴포넌트명세/기타) · 🔍 상세 · 📎 브랜치 `docs/` · 🔗 참고 |

---

## 7. 환경 변수 규칙

- `.env.local`(gitignore) · `.env.example`(커밋 O) · `.env.production`(gitignore)
- **서버 전용** = prefix 없음 / **클라 노출** = `NEXT_PUBLIC_` prefix.
  예: `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080`
- ⛔ **토큰·시크릿은 `NEXT_PUBLIC_` 금지** (브라우저에 그대로 노출됨).

---

## 8. ⛔ 절대 금지

> 코드로는 강제되지 않는, **사람이 지켜야 하는** 금지 목록. 어기면 리뷰에서 반려.

**Git / 협업**
- `develop` · `main` **직접 push** — 반드시 PR 경유.
- **force push** (`--force`).
- **`git add .`** — 스테이징은 파일을 **명시적으로** 지정(의도치 않은 파일 유입 방지).
- **본인 PR 본인 머지** — 최소 1명 Approve 후 타인이 머지.
- `.claude/` 커밋 — 개인 세션 설정이라 저장소에 들어가면 안 된다.
  - ⚠️ **`CLAUDE.md`는 반대로 커밋한다** (2026-07-21 변경). 팀 규칙을 AI가 자동으로 읽게 하는 게 목적이므로
    저장소에 있어야 모두에게 동일하게 적용된다. 백엔드도 같은 방식으로 운영한다.
    커밋 대상 = 루트 `CLAUDE.md` · `src/features/{도메인}/CLAUDE.md` · `docs/` 팀 규칙 5종.
    제외 = 발표 자료(`docs/발표_*`)·BE 티켓(`docs/BE_*`) 등 1회성 문서.

**AI 흔적 0 ⭐**
- 커밋·PR·이슈 어디에도 **AI/Claude 작성 흔적을 남기지 않는다.**
  - `Co-Authored-By: ...` 푸터 ❌
  - `🤖 Generated with Claude Code` 등 서명·문구 ❌
- **사람이 직접 작성한 것처럼** 올린다.

**빌드/품질 게이트**
- `USE_MOCK=true` 상태로 PR 올리기 ❌ (PR 전 `false` 원복 필수).
- `NEXT_PUBLIC_` 로 시크릿 노출 ❌.
- 없는 라벨(`fix`/`docs`/`style` 등)로 `gh --label` 시도 ❌ (§5).

---

## 9. 참고

- 코드 아키텍처(Server-First · Server Action/BFF · httpOnly 쿠키 등) → `ARCHITECTURE` / `CODE_CONVENTION` 문서
- API 연동 정직성 4대 금기 → `INTEGRATION` 문서 (코드 밖 팀 규칙)
