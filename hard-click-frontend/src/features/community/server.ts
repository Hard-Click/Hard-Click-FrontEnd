import { serverApi } from '@/lib/api';
import type { ApiResponse } from '@/services/api';
import type {
  BoardType,
  PostListResponse,
  PostListApiResponse,
  StudyListApiResponse,
} from './types';
// 커뮤니티 도메인만 실서버 연동 (다른 도메인은 전역 USE_MOCK 유지)
import { USE_MOCK_COMMUNITY as USE_MOCK } from '@/mocks/config';
import { mockPostListResponse } from '@/mocks/community.mock';
import { toPostListResponse, toStudyListResponse, mapOk } from './services';
import { mockSubjects } from '@/mocks/community.mock';
import type { SubjectItem } from './types';
import { SUBJECT_NAME, SUBJECTS as CONST_SUBJECTS } from '@/constants/subjects';

// 페이지 데이터 조회는 server.ts로 통일한다. 글 상세 조회(serverApi 기반)는
// services.ts에 정의돼 있으므로 여기서 재노출해 페이지가 한 곳(server.ts)에서만 import하도록 한다.
export { getPostDetail } from './services';

export async function getSubjects(): Promise<ApiResponse<SubjectItem[]>> {
  if (USE_MOCK) {
    return { success: true, httpStatus: 200, message: '', data: mockSubjects };
  }
  // /api/subjects 엔드포인트 없음 → FE 상수에서 생성
  return {
    success: true,
    httpStatus: 200,
    message: '',
    data: CONST_SUBJECTS.map((s) => ({ code: s.code, name: s.name })),
  };
}

export async function getCommunityPosts(
  boardType: BoardType = 'ALL',
  page = 0,
  keyword?: string,
  sort?: string,
  subjectCode?: string
): Promise<ApiResponse<PostListResponse>> {
  if (USE_MOCK) {
    // mock도 posts/items 둘 다 수용 (live와 동일 토글 유지)
    const mockPosts =
      mockPostListResponse.posts ?? mockPostListResponse.items ?? [];
    let filtered =
      boardType === 'ALL'
        ? mockPosts
        : mockPosts.filter((p) => p.boardType === boardType);
    if (subjectCode) {
      const subjectName = SUBJECT_NAME[subjectCode];
      filtered = filtered.filter((p) => p.subjectName === subjectName);
    }
    const PAGE_SIZE = 10;
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(Math.max(page, 0), totalPages - 1);
    const paged = filtered.slice(
      safePage * PAGE_SIZE,
      (safePage + 1) * PAGE_SIZE
    );
    return {
      success: true,
      httpStatus: 200,
      message: '',
      data: toPostListResponse({
        ...mockPostListResponse,
        posts: paged,
        totalPages,
      }),
    };
  }

  // 스터디는 게시판(/api/boards)과 별도 리소스 → /api/studies로 조회.
  // ⚠️ 이 엔드포인트는 subject/page/size만 지원하고 keyword(검색)/sort(정렬)는 미지원.
  // 따라서 스터디 탭에서는 검색어/정렬이 서버에 전달되지 않는다.
  // (BE가 keyword/sort를 지원하면 여기서 전달하고, 계속 미지원이면 스터디 탭 UI에서
  //  검색/정렬 컨트롤을 비활성화하는 후속 작업이 필요함)
  if (boardType === 'STUDY') {
    const studyParams = new URLSearchParams();
    studyParams.set('page', String(page));
    if (subjectCode) studyParams.set('subject', subjectCode);
    return mapOk(
      await serverApi.get<StudyListApiResponse>(
        `/api/studies?${studyParams.toString()}`
      ),
      toStudyListResponse
    );
  }

  // ⚠️ BE 목록 엔드포인트(/api/boards/**/posts)는 과목(subject) 필터를 지원하지 않는다.
  // (Swagger 파라미터: boardType·sort·keyword·page뿐. 스터디 /api/studies?subject=만 서버 필터 지원.)
  // 따라서 질문게시판 과목 필터는 여기서 전체 페이지를 받아 subject enum 코드로 거른 뒤
  // 재페이지네이션한다. (BE가 필터를 지원하면 subjectCode를 쿼리로 넘기고 이 분기를 제거하면 됨)
  if (boardType === 'QUESTION' && subjectCode) {
    return getFilteredQuestionPosts(page, keyword, sort, subjectCode);
  }

  const params = new URLSearchParams();
  params.set('page', String(page));
  if (keyword) params.set('keyword', keyword);
  if (sort) params.set('sort', sort);

  const url =
    boardType === 'ALL'
      ? `/api/boards/posts?${params.toString()}`
      : `/api/boards/${boardType}/posts?${params.toString()}`;

  return mapOk(
    await serverApi.get<PostListApiResponse>(url),
    toPostListResponse
  );
}

const QUESTION_PAGE_SIZE = 10;

/**
 * 질문게시판 과목 필터 (BE 미지원 워크어라운드).
 * 검색어/정렬은 서버에 그대로 위임하고, 그 결과 전체 페이지를 받아 과목 코드로 거른 뒤
 * 프론트에서 재페이지네이션한다.
 */
async function getFilteredQuestionPosts(
  page: number,
  keyword: string | undefined,
  sort: string | undefined,
  subjectCode: string
): Promise<ApiResponse<PostListResponse>> {
  const urlFor = (p: number): string => {
    const sp = new URLSearchParams();
    sp.set('page', String(p));
    if (keyword) sp.set('keyword', keyword);
    if (sort) sp.set('sort', sort);
    return `/api/boards/QUESTION/posts?${sp.toString()}`;
  };

  const first = await serverApi.get<PostListApiResponse>(urlFor(0));
  if (!first.success || first.data == null) {
    return mapOk(first, toPostListResponse);
  }

  const totalPages = first.data.totalPages ?? 1;
  const rest =
    totalPages > 1
      ? await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, i) =>
            serverApi.get<PostListApiResponse>(urlFor(i + 1))
          )
        )
      : [];

  const all = [first, ...rest].flatMap(
    (r) => r.data?.posts ?? r.data?.items ?? []
  );
  // BE는 QUESTION 글의 과목을 enum 코드(예: MATH_1)로 subject에 담아 내려준다.
  const matched = all.filter((p) => (p.subject ?? p.subjectName) === subjectCode);

  const newTotalPages = Math.max(
    1,
    Math.ceil(matched.length / QUESTION_PAGE_SIZE)
  );
  const safePage = Math.min(Math.max(page, 0), newTotalPages - 1);
  const paged = matched.slice(
    safePage * QUESTION_PAGE_SIZE,
    (safePage + 1) * QUESTION_PAGE_SIZE
  );

  return {
    ...first,
    data: toPostListResponse({
      posts: paged,
      totalPages: newTotalPages,
      currentPage: safePage,
      totalCount: matched.length,
    }),
  };
}
