# CLAUDE.md — `features/learning` (영상학습 도메인)

> **범위:** 이 폴더가 표준 패턴(§0~§9)에서 **벗어나는 위험**만 적는다. services/server의 mock 분기, `isMock('learning')`, `interface`/`type` 규칙, Server Action + BFF 같은 **코드로 뻔한 건 생략**. AI가 코드만 봐선 틀리기 쉬운 **의도·제약·정직성 규칙**에 집중한다.
>
> ⭐ 이 도메인의 시청 진도/완료는 **§0.1 연동 정직성 4대 금기**가 코드 곳곳에 직접 박혀 있다. 리팩터링할 때 "간단하게 고친다"고 이 방어 로직을 걷어내면 곧바로 §0.1 위반이 된다.

---

## ⚠️ AI 사각지대 (1) — HLS 재생 분기

`VideoPlayer.tsx`의 재생 소스 결정은 **3-way 분기**이고, 순서가 의미를 가진다. 하나로 합치면 특정 브라우저에서 깨진다.

```
playUrl 이 .m3u8 아님        → video.src = playUrl (native mp4)
.m3u8 && Safari native HLS   → video.src = playUrl (canPlayType('application/vnd.apple.mpegurl'))
.m3u8 && 그 외 브라우저      → hls.js 동적 import → new Hls({ startPosition })
```

- **`hls.js`는 반드시 동적 `import('hls.js')`.** 정적 import 금지 — HLS가 아닌 mp4 재생에도 번들이 끌려오고 초기 로드가 무거워진다. (코드 스플리팅 취지와 동일)
- **Safari 분기를 지우지 말 것.** Safari는 native HLS를 지원하므로 hls.js를 태우면 오히려 이중 처리로 깨진다. `canPlayType('application/vnd.apple.mpegurl')` 체크가 그 가드다.
- **이어보기 seek은 두 경로가 다르다.** hls.js는 `new Hls({ startPosition: resume })`로 **manifest 로드 단계에서** seek, native 경로는 `canplay` 이벤트에서 `video.currentTime = resume`로 보정. 그래서 `onCanPlay` 폴백이 **양쪽 모두**에 필요하다(hls.js도 canplay로 한 번 더 맞춤).
- 언마운트/영상 교체 시 `hlsInstanceRef.current?.destroy()` **필수** — 안 하면 이전 fragment 로더가 살아남아 메모리·네트워크 누수.
- `PreviewVideoModal.tsx`는 "단순 버전(lastPosition/heartbeat 없음)"의 별도 플레이어다. 미리보기라 진도 추적이 없다 — 여기 로직을 `VideoPlayer`와 통합하지 말 것.

---

## ⚠️ AI 사각지대 (2) — watch-time 누적 (재생/정지 heartbeat + 하드/소프트 내비 분기)

`useWatchTimeSaver.ts`의 시청 시간 저장은 **경과시간(delta) 기반**이고, 이탈 종류에 따라 저장 경로가 갈린다. 여기가 이 훅에서 제일 틀리기 쉬운 곳이다.

- **재생 시점에 `playStartTime` 기록, 정지/이탈 시 `(now - playStartTime)` delta를 flush.** `timeupdate`로 매초 보내지 않는다(그건 과부하). 재생 중에는 **5초 heartbeat**(`setInterval 5000`)로만 서버 동기화하고, heartbeat마다 `playStartTime`을 `now`로 리셋해 delta 중복 계산을 막는다.
- **하드 내비(탭 닫기·새로고침 — `pagehide`/`beforeunload`) → `localStorage`에만 누적.**
  이유: 비동기 `fetch`를 끝낼 시간이 없고, `sendBeacon`은 **httpOnly 쿠키 인증(Authorization)을 못 붙여** BE에서 인증 실패한다(§6). 그래서 하드 내비 순간엔 서버 전송을 **포기하고** 로컬에만 남겨 데이터를 보존한다.
  ⚠️ **정정(2026-07-11):** `fetch(..., {keepalive:true})`는 unload 후에도 전송을 유지하고 **동일출처 `/api/*`면 쿠키가 자동 첨부**된다(BFF 프록시 경유). 순공 세션 end는 이 방식으로 하드 내비 종료를 구현했다(위 §순공 참조). watch-time도 원하면 이 패턴으로 서버 전송이 가능하다(현재는 localStorage 폴백 유지).
- **소프트 내비(영상 변경·페이지 이동 unmount) → `flush`로 localStorage + BE 동시 갱신.**
  ⚠️ **과거 버그(주석에 박혀 있음):** 소프트 내비에서도 localStorage만 갱신했더니 BE 누적값이 실제보다 적어, **끝까지 봐도 BE watchTime이 90%에 못 미쳐 완료가 안 되던** 버그가 있었다. 그래서 소프트 unmount cleanup은 `void flush(delta)`로 **반드시 BE에도 전송**한다. 이걸 다시 "localStorage만"으로 되돌리면 완료가 영구히 막힌다.
- **`localStorage` 키 규약** (BE 응답이 `void`라 진행률을 클라에서 계산하기 위한 폴백. 함부로 바꾸면 이어보기·진도가 어긋남):
  - `learning:watchedSeconds:{videoId}` — 누적 시청 초
  - `learning:lastPosition:{videoId}` — 마지막 재생 위치 초
- `progressRate`는 **BE가 안 준다**(응답 `void`) → `누적 watchTime / durationSeconds`로 **클라에서 계산**. 이건 사이드바 표시용 근사치이고, **완료 판정 근거로 쓰지 않는다**(아래 (3) 참고).

---

## ⚠️ AI 사각지대 (3) — "완료"는 **서버 성공 시에만** (§0.1 정직성)

⛔ **클라이언트 추정으로 완료를 위조하지 않는다.** 이 규칙이 3개 파일에 걸쳐 방어되어 있다. 하나라도 우회하면 "끝까지 안 봐도 완료" 위조가 된다.

- **완료 트리거는 오직 `completeVideo(videoId)`(PATCH `/progress/complete`)가 `success`일 때 → `onCompleted()` 콜백 1회.** `video.ended` 이벤트, 5초 카운터, 클라 `progressRate ≥ 90` 그 자체로는 **완료로 만들지 않는다.**
  - `VideoPlayer`의 `onEnded`는 **마지막 위치만 저장**하고 끝. 완료 처리 안 함(주석 §0.1 명시).
  - `useWatchTimeSaver`는 클라 `rate ≥ 90`에서 `completeVideo`를 **호출**하지만, 완료 확정은 **BE 응답이 success일 때만** `onCompleted`.
  - `LearningVideoContent.handleLessonCompleted`도 `onCompleted` 콜백 경로로만 호출된다(사이드바 completed·진도율 갱신).
- **최종 완료 검증 주체는 BE.** BE는 `watchTimeSeconds >= ceil(durationSeconds * 0.9)`를 검사하고, 미달이면 **409 CONFLICT / `errorCode L004`**(VIDEO_COMPLETION_CONDITION_NOT_MET)를 준다. 라이브 전환 시 호출부에서 **409/L004를 "90% 시청 후 완료" 안내**로 처리한다(에러 토스트로 뭉개지 말 것).
- **클라 90% 도달 토스트("90% 이상 수강되었습니다")는 진행 안내일 뿐, 완료 확정이 아니다.** 토스트가 떴다고 사이드바를 완료로 칠하면 §0.1-2 위반.
- **`server.ts` — streamingUrl 빈 값은 404로 강등.** `getVideoPlayInfoServer`는 200이어도 `streamingUrl`이 비면(영상 미업로드/lessonId↔video 매핑 누락) `{ video: null, status: 404 }`로 내려 **검은 화면 무음 실패 대신 에러 모달**을 띄운다. 이 강등을 지우면 재생 불가가 "정상인 척" 숨는다(§0.1-4).

---

## ⚠️ AI 사각지대 (4) — 순공 타이머 세션 연동 (learning 라우트 ↔ `features/studyTimers`)

영상 시청 페이지(`app/(user)/learning/videos/[videoId]/LearningVideoContent.tsx`)는 시청 진도와 **별개로** 순공 타이머 세션(`features/studyTimers`)을 물고 있다. **watch-time heartbeat(5초)와 타이머 heartbeat(60초)는 서로 다른 시스템**이니 혼동 금지.

- 액션: `startTimerAction` / `endTimerAction` / `heartbeatAction` / `fetchCurrentSessionAction`.
- **타이머 heartbeat = 60초**(`HEARTBEAT_INTERVAL_MS = 60_000`). 1초 로컬 tick은 화면 표시용이고, 60초마다 `heartbeatAction`이 **BE 확정 누적초로 보정**한다(백그라운드 탭 throttle로 밀린 드리프트 해소). 화면 초를 진실로 믿지 말 것 — BE 누적이 진실.
- **세션 복원 가드:** 진입 시 `fetchCurrentSessionAction`으로 복원하되 **`status === 'RUNNING'`인 세션만** tick 재개. PAUSED/ENDED 위에 tick을 다시 돌리면 BE 누적과 화면이 어긋난다.
- **레슨 전환 grace(=300ms)의 존재 이유** ⚠️ (지우면 세션이 매 레슨마다 끊긴다): 페이지가 `key={videoId}`라 **레슨을 바꿀 때마다 remount**된다. cleanup에서 곧바로 `endTimerAction`을 부르면 레슨 넘길 때마다 순공이 종료돼 버린다. 그래서 unmount 시 end를 **`LESSON_SWITCH_GRACE_MS`(300ms) 예약**만 하고(module-level `pendingSessionEnd`), 그 안에 새 인스턴스가 마운트되면(=레슨 전환) 다음 effect가 **예약을 취소**한다. 재마운트가 없는 **진짜 학습 이탈일 때만** end가 실행돼 경과분이 `daily_study_stats`에 저장되고 마이페이지 오늘순공·랭킹에 반영된다.
- **`pause`는 여기(영상 페이지)선 안 쓴다.** 영상 타이머는 시작/종료만 노출 — pause/resume은 전역 순공 오버레이(StudyTimerPanel)의 기능이다. (BE pause 500(C002) 버그는 2026-07-11 해소·pause/resume 라이브 배선 완료. 영상 페이지가 pause를 안 쓰는 건 UX 설계이지 BE 제약이 아님.)
- **탭 닫기·새로고침(하드 내비) 시 세션 end = 구현됨(2026-07-11).** `pagehide`에서 **`fetch(PATCH .../end, {keepalive:true})`** 로 종료 — 동일출처 `/api/*`라 BFF 프록시(route.ts)가 httpOnly 쿠키를 자동 첨부해 인증된다(sendBeacon은 POST만이라 PATCH 불가지만, **동일출처 keepalive fetch는 쿠키가 붙어** 그 한계를 우회. keepalive는 unload 후에도 전송 유지). bfcache(`e.persisted`)는 종료하지 않는다(복귀 시 좀비 인터벌 방지). LearningVideoContent 참조.

---

### 관련 파일
- `src/features/learning/services.ts` · `server.ts` · `utils.ts`
- `src/features/learning/hooks/useWatchTimeSaver.ts`
- `src/features/learning/components/VideoPlayer.tsx` · `PreviewVideoModal.tsx` · `TimerInfoModal.tsx`
- `src/app/(user)/learning/videos/[videoId]/LearningVideoContent.tsx` (타이머 세션 오케스트레이션)
- 순공 세션 액션: `src/features/studyTimers/actions.ts`
