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

## 목 파일 인덱스

> ⚠️ **기준 = 실제 백엔드 코드(Hard-Click-BackEnd)**. 노션 명세와 코드가 다른 곳은 **코드를 따랐다.**
> (노션과 달랐던 대표: `/api/users`→`/api/members`, `/api/payments`→`/api/payment`(단수),
> 강의 상세 `curriculum`→`sections[].lessons[]`, 결제 `paidAmount`→`amount/orderNo/displayName` 등)

### ✅ A. 백엔드에 구현됨 — 실제 DTO에 정렬 완료(연동 가능)

| 파일 | 엔드포인트 | 백엔드 도메인 |
| --- | --- | --- |
| `auth.mock.ts` | `/api/auth/login·signup·email·refresh` | identity |
| `courses.mock.ts` | `GET /api/courses` · `/{id}` · `/api/subjects` | cource·subject |
| `instructor.mock.ts` | `GET /api/instructor/courses` (CourseListResponse 재사용) | cource |
| `community.mock.ts` | `GET /api/boards/{type}/posts` · `/posts/{id}` · `/posts/{id}/comments` | community |
| `reviews.mock.ts` | `GET /api/courses/{id}/reviews` | community |
| `enrollments.mock.ts` | `GET /api/enrollments/me` (List 직접) | enrollment |
| `learning.mock.ts` | `GET /api/learning/courses/{id}/progress` · `/videos/{id}/play` | learning_activity |
| `notices.mock.ts` | `GET /api/notices` · `/{id}` | notice |
| `payments.mock.ts` | `GET /api/payment/me` (※ 단수) | payment |
| `mypage.mock.ts` | `GET /api/members/me` · `/activities` · `/courses` · `/courses/completed` | identity·community·enrollment |

### ⚠️ B. 백엔드 미구현 — 노션 명세 기준(빈 스텁/컨트롤러 없음, 연동 불가)

> `report_moderation`·`evolution_report`는 빈 `class Controller {}` 스텁이고, 나머지는 컨트롤러 자체가 없음.
> 백엔드가 구현되면 그때 실제 DTO로 재정렬 필요.

| 파일 | 엔드포인트(노션) |
| --- | --- |
| `reports.mock.ts` | `/api/reports` (report_moderation = 빈 스텁) |
| `rankings.mock.ts` | `/api/rankings/*` |
| `grass.mock.ts` | `/api/grass/*` |
| `studyTimers.mock.ts` | `/api/study-timers/stats/daily` |
| `stats.mock.ts` | `/api/stats/daily-study` |
| `study.mock.ts` | `/api/study` · `/{groupId}` |
| `cart.mock.ts` | `/api/cart` |
| `subscriptions.mock.ts` | `/api/subscription-plans` |
| `notifications.mock.ts` | `/api/notifications` · `/unread-count` |
| `chat.mock.ts` | `/api/users/me/chat-rooms` |

> 변경(POST/PATCH/DELETE)은 단순 성공/생성 응답이라 별도 목을 두지 않았다.
> A그룹도 아직 service의 `USE_MOCK` 분기에 연결 안 된 파일이 있다(참조용 목). 화면 구현 시 연결.
