# src/mocks — 목(Mock) 데이터 모음

목 데이터는 **여기 한 곳**에만 둡니다. page · component · service 안에 인라인하지 않습니다.

## 원칙

1. **백엔드 응답 명세(shape) 그대로** 만든다. (UI 가공 모양 ❌)
   - 그래야 `USE_MOCK`를 꺼서 실제 API로 바꿀 때, 매핑 코드(`toXxx`)가 **그대로** 동작합니다 → 연동이 매끄러움.
   - 예: 강의 목록 목은 `CourseListItem[]`(UI)이 아니라 `{ content: CourseListApiItem[] }`(백엔드) 형태로.
2. 도메인별 파일: `courses.mock.ts`, `notices.mock.ts`, `community.mock.ts` …
3. on/off는 `config.ts`의 `USE_MOCK` 하나로.

## 사용 패턴

```ts
import { USE_MOCK } from '@/mocks/config';
import { mockNoticesResponse } from '@/mocks/notices.mock';

export async function getNotices(params) {
  if (USE_MOCK) {
    // 실제 API와 "동일한 shape"을 반환 → 이후 매핑 코드 공통
    return { success: true, httpStatus: 200, message: '', data: mockNoticesResponse };
  }
  return api.get<NoticeApiResponse>(`/api/notices?...`); // 실제 API
}
```

## 새 도메인 추가 시

1. 백엔드 응답 타입을 `features/<도메인>/types.ts`에 `XxxApiResponse`로 정의(있으면 재사용).
2. `src/mocks/<도메인>.mock.ts`에 그 타입으로 목 데이터 작성.
3. service의 `USE_MOCK` 분기에서 import해 사용.

## 현재 목 파일 인덱스 (백엔드 GET 명세 기준)

| 파일 | 주요 엔드포인트 |
| --- | --- |
| `auth.mock.ts` | 로그인 · 회원가입 · 이메일 인증 · 토큰 재발급 |
| `courses.mock.ts` | `GET /api/courses`(목록) · `/{id}`(상세) · `/api/subjects` |
| `instructor.mock.ts` | `GET /api/instructor/courses` (강사 내 강의) |
| `community.mock.ts` | `GET /api/boards/{type}/posts` · `/posts/{id}` · `/comments` |
| `reviews.mock.ts` | `GET /api/courses/{id}/reviews` |
| `enrollments.mock.ts` | `GET /api/enrollments/me` |
| `learning.mock.ts` | `GET /api/learning/courses/{id}/progress` · `/videos/{id}/play` |
| `notices.mock.ts` | `GET /api/notices` · `/{id}` |
| `notifications.mock.ts` | `GET /api/notifications` · `/unread-count` |
| `payments.mock.ts` | `GET /api/payments/me` |
| `subscriptions.mock.ts` | `GET /api/subscription-plans` |
| `cart.mock.ts` | `GET /api/cart` |
| `study.mock.ts` | `GET /api/study` · `/{groupId}` |
| `rankings.mock.ts` | `GET /api/rankings/me` · `/study-time` |
| `grass.mock.ts` | `GET /api/grass/lessons` · `/streak` · `/monthly` · `/yearly` |
| `mypage.mock.ts` | `GET /api/users/me` · `/activities` · `/courses` |
| `studyTimers.mock.ts` | `GET /api/study-timers/stats/daily` |
| `stats.mock.ts` | `GET /api/stats/daily-study` |
| `chat.mock.ts` | `GET /api/users/me/chat-rooms` |
| `reports.mock.ts` | `GET /api/reports` (관리자) |

> 변경(POST/PATCH/DELETE) 엔드포인트는 보통 단순 성공/생성 응답이라 별도 목 데이터를 두지 않았다.
> **추론/주의가 있는 목**: `reports.mock.ts`(명세 표 vs 예시 JSON 불일치 → 예시 기준),
> `mypage.mock.ts`(`/courses/completed`는 별도 명세 없어 같은 shape 가정),
> `payments.mock.ts`(명세 2종 충돌 — 파일 상단 주석 참고).
