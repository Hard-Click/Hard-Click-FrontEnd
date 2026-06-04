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
