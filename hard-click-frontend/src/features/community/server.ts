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

  // 스터디는 게시판(/api/boards)과 별도 리소스 → /api/study로 조회.
  // ⚠️ 이 엔드포인트는 subject/page/size만 지원하고 keyword(검색)/sort(정렬)는 미지원
  // (Swagger `StudyListRequest` 스키마 라이브 확인 — page·size·subject 필드뿐, keyword 없음).
  // 검색어가 있으면 질문게시판 과목 필터(#698)와 동일하게 전체 페이지를 받아 제목/내용으로
  // 클라이언트에서 거른 뒤 재페이지네이션한다. sort(정렬)는 여전히 서버에 전달되지 않음(범위 밖).
  if (boardType === 'STUDY') {
    if (keyword) {
      return getFilteredStudyPosts(page, keyword, subjectCode);
    }
    const studyParams = new URLSearchParams();
    studyParams.set('page', String(page));
    if (subjectCode) studyParams.set('subject', subjectCode);
    return mapOk(
      await serverApi.get<StudyListApiResponse>(
        `/api/study?${studyParams.toString()}`
      ),
      toStudyListResponse
    );
  }

  // ⚠️ BE 목록 엔드포인트(/api/boards/**/posts)는 과목(subject) 필터를 지원하지 않는다.
  // (Swagger 파라미터: boardType·sort·keyword·page뿐. 스터디 /api/study?subject=만 서버 필터 지원.)
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

const STUDY_PAGE_SIZE = 10;

/**
 * 스터디모집 검색어 필터 (BE 미지원 워크어라운드, #698 질문게시판 패턴과 동일).
 * 과목 필터는 서버에 그대로 위임하고, 그 결과 전체 페이지를 받아 제목/내용에 검색어가
 * 포함된 것만 거른 뒤 프론트에서 재페이지네이션한다.
 */
async function getFilteredStudyPosts(
  page: number,
  keyword: string,
  subjectCode: string | undefined
): Promise<ApiResponse<PostListResponse>> {
  const urlFor = (p: number): string => {
    const sp = new URLSearchParams();
    sp.set('page', String(p));
    if (subjectCode) sp.set('subject', subjectCode);
    return `/api/study?${sp.toString()}`;
  };

  const first = await serverApi.get<StudyListApiResponse>(urlFor(0));
  if (!first.success || first.data == null) {
    return mapOk(first, toStudyListResponse);
  }

  const totalPages = first.data.totalPages ?? 1;
  const rest =
    totalPages > 1
      ? await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, i) =>
            serverApi.get<StudyListApiResponse>(urlFor(i + 1))
          )
        )
      : [];

  const all = [first, ...rest].flatMap((r) => r.data?.content ?? []);
  const lowerKeyword = keyword.toLowerCase();
  const matched = all.filter(
    (s) =>
      s.title.toLowerCase().includes(lowerKeyword) ||
      s.content?.toLowerCase().includes(lowerKeyword)
  );

  const newTotalPages = Math.max(1, Math.ceil(matched.length / STUDY_PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 0), newTotalPages - 1);
  const paged = matched.slice(
    safePage * STUDY_PAGE_SIZE,
    (safePage + 1) * STUDY_PAGE_SIZE
  );

  return {
    ...first,
    data: toStudyListResponse({ content: paged, totalPages: newTotalPages }),
  };
}
