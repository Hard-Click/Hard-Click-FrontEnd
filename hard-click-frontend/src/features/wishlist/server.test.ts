/**
 * wishlist/server.ts 매퍼 테스트.
 *
 * private 매퍼 `toWishlistFromApi`(export 안 됨)를 public `getWishlistServer`를 통해 검증한다.
 * - `@/mocks/config`를 mock → `isMock()` 항상 false → 라이브 분기(serverApi.get) 강제.
 * - `@/lib/api`의 serverApi.get을 stub → 원하는 BE 응답 envelope를 주입.
 *
 * 검증 포인트: subject enum→한글 라벨, 가격/평점/수강생수 매핑, priceType→isFree,
 *             enrolled/inCart→isEnrolled/isInCart, thumbnailUrl 빈값→undefined,
 *             실패 응답(success:false / data 없음)→throw.
 */
import { getWishlistServer } from './server';
import { serverApi } from '@/lib/api';

// 라이브 분기 강제 (mock 분기로 빠지지 않게)
jest.mock('@/mocks/config', () => ({
  isMock: () => false,
  USE_MOCK: false,
}));

// serverApi.get을 stub 가능하게 mock
jest.mock('@/lib/api', () => ({
  serverApi: { get: jest.fn() },
}));

const mockGet = serverApi.get as jest.Mock;

/** 성공 envelope 헬퍼 — request()의 withSuccess 결과와 동일 shape */
function ok<T>(data: T) {
  return { success: true, httpStatus: 200, message: 'OK', data };
}

/** BE wishlist 항목 1개 (BeWishlistResponse['items'][number] 가정 shape) */
function beItem(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    courseId: 1,
    title: '수능 수학 마스터',
    subject: 'MATH_1',
    thumbnailUrl: 'https://cdn.example.com/thumb.jpg',
    priceType: 'PAID',
    instructorName: '김선생',
    price: 50000,
    averageRating: 4.5,
    reviewCount: 12,
    enrollmentCount: 340,
    enrolled: false,
    inCart: false,
    ...overrides,
  };
}

beforeEach(() => {
  mockGet.mockReset();
});

describe('getWishlistServer — BE 응답 → UI 매핑 (라이브 분기)', () => {
  it('GET /api/wishlist를 호출한다', async () => {
    mockGet.mockResolvedValue(ok({ items: [], totalCount: 0 }));
    await getWishlistServer();
    expect(mockGet).toHaveBeenCalledWith('/api/wishlist');
  });

  it('항목의 핵심 필드를 UI 계약으로 매핑한다', async () => {
    mockGet.mockResolvedValue(ok({ items: [beItem()], totalCount: 1 }));

    const result = await getWishlistServer();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      courseId: 1,
      title: '수능 수학 마스터',
      instructorName: '김선생',
      subjectName: '수학Ⅰ', // MATH_1 → 한글 라벨
      price: 50000,
      isFree: false, // priceType PAID
      averageRating: 4.5,
      reviewCount: 12,
      studentCount: 340, // enrollmentCount → studentCount
      thumbnailUrl: 'https://cdn.example.com/thumb.jpg',
      isEnrolled: false,
      isInCart: false,
    });
  });

  it('subject enum을 한글 라벨로 변환한다 (subjectLabel)', async () => {
    mockGet.mockResolvedValue(
      ok({
        items: [
          beItem({ courseId: 1, subject: 'KO_READING' }),
          beItem({ courseId: 2, subject: 'SC_BIOLOGY_1' }),
          beItem({ courseId: 3, subject: 'ENG_1' }),
        ],
        totalCount: 3,
      }),
    );

    const result = await getWishlistServer();

    expect(result.map((c) => c.subjectName)).toEqual([
      '독서',
      '생명과학Ⅰ',
      '영어Ⅰ',
    ]);
  });

  it('모르는 subject enum은 원본 값을 그대로 둔다', async () => {
    mockGet.mockResolvedValue(
      ok({ items: [beItem({ subject: 'UNKNOWN_SUBJECT' })], totalCount: 1 }),
    );

    const result = await getWishlistServer();

    expect(result[0].subjectName).toBe('UNKNOWN_SUBJECT');
  });

  it('priceType FREE면 isFree=true', async () => {
    mockGet.mockResolvedValue(
      ok({
        items: [beItem({ priceType: 'FREE', price: 0 })],
        totalCount: 1,
      }),
    );

    const result = await getWishlistServer();

    expect(result[0].isFree).toBe(true);
    expect(result[0].price).toBe(0);
  });

  it('priceType이 FREE가 아닌 임의 값이면 isFree=false', async () => {
    mockGet.mockResolvedValue(
      ok({ items: [beItem({ priceType: 'SUBSCRIPTION' })], totalCount: 1 }),
    );

    const result = await getWishlistServer();

    expect(result[0].isFree).toBe(false);
  });

  it('enrolled/inCart를 isEnrolled/isInCart로 매핑한다', async () => {
    mockGet.mockResolvedValue(
      ok({
        items: [beItem({ enrolled: true, inCart: true })],
        totalCount: 1,
      }),
    );

    const result = await getWishlistServer();

    expect(result[0].isEnrolled).toBe(true);
    expect(result[0].isInCart).toBe(true);
  });

  it('thumbnailUrl이 빈 문자열이면 undefined로 매핑한다 (placeholder 대비)', async () => {
    mockGet.mockResolvedValue(
      ok({ items: [beItem({ thumbnailUrl: '' })], totalCount: 1 }),
    );

    const result = await getWishlistServer();

    expect(result[0].thumbnailUrl).toBeUndefined();
  });

  it('thumbnailUrl이 있으면 그대로 둔다', async () => {
    mockGet.mockResolvedValue(
      ok({
        items: [beItem({ thumbnailUrl: 'https://x/y.png' })],
        totalCount: 1,
      }),
    );

    const result = await getWishlistServer();

    expect(result[0].thumbnailUrl).toBe('https://x/y.png');
  });

  it('평점/리뷰수/수강생수가 0인 경계값도 그대로 매핑한다', async () => {
    mockGet.mockResolvedValue(
      ok({
        items: [
          beItem({ averageRating: 0, reviewCount: 0, enrollmentCount: 0 }),
        ],
        totalCount: 1,
      }),
    );

    const result = await getWishlistServer();

    expect(result[0].averageRating).toBe(0);
    expect(result[0].reviewCount).toBe(0);
    expect(result[0].studentCount).toBe(0);
  });

  it('빈 목록이면 빈 배열을 반환한다', async () => {
    mockGet.mockResolvedValue(ok({ items: [], totalCount: 0 }));

    const result = await getWishlistServer();

    expect(result).toEqual([]);
  });

  it('여러 항목을 순서대로 전부 매핑한다', async () => {
    mockGet.mockResolvedValue(
      ok({
        items: [
          beItem({ courseId: 10 }),
          beItem({ courseId: 20 }),
          beItem({ courseId: 30 }),
        ],
        totalCount: 3,
      }),
    );

    const result = await getWishlistServer();

    expect(result.map((c) => c.courseId)).toEqual([10, 20, 30]);
  });
});

describe('getWishlistServer — 실패 응답 처리 (폴백 대신 throw)', () => {
  it('success:false면 에러를 던진다', async () => {
    mockGet.mockResolvedValue({
      success: false,
      httpStatus: 500,
      message: '서버 오류',
      data: undefined,
    });

    await expect(getWishlistServer()).rejects.toThrow(
      '찜한 강의를 불러오지 못했습니다.',
    );
  });

  it('success는 true지만 data가 없으면 에러를 던진다', async () => {
    mockGet.mockResolvedValue({
      success: true,
      httpStatus: 200,
      message: 'OK',
      data: undefined,
    });

    await expect(getWishlistServer()).rejects.toThrow(
      '찜한 강의를 불러오지 못했습니다.',
    );
  });
});
