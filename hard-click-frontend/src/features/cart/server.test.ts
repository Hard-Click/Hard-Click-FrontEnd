import { serverApi } from '@/lib/api';
import { getCurrentUser } from '@/features/auth/session';
import { getCartServer } from './server';

// private 매퍼(toCartFromApi/toCart)는 export 안 됨 → public getCartServer를 통해 검증.
// 라이브 분기를 강제(isMock=false)해 실서버 매퍼 경로를 타게 한다.
jest.mock('@/lib/api', () => ({
  serverApi: {
    get: jest.fn(),
  },
}));
jest.mock('@/mocks/config', () => ({
  isMock: () => false,
  USE_MOCK: false,
}));
// getCartServer가 "이미 수강중인 강의 제외"를 위해 getCurrentUser(쿠키)를 호출 → mock 필요
jest.mock('@/features/auth/session', () => ({
  getCurrentUser: jest.fn(),
}));

const mockGet = serverApi.get as jest.Mock;
const mockGetUser = getCurrentUser as jest.Mock;

/** 성공 봉투 헬퍼: { success, httpStatus, data } */
function okEnvelope<T>(data: T) {
  return { success: true, httpStatus: 200, message: 'OK', data };
}

describe('getCartServer — BE 응답 → Cart UI 계약 매퍼 (라이브 분기)', () => {
  // 매퍼 검증은 비로그인 가정 → 수강중 제외 필터는 no-op, 순수 매핑만 본다.
  beforeEach(() => {
    mockGetUser.mockResolvedValue(null);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('BE 항목을 CartItem으로 매핑한다 (title/instructor/price)', async () => {
    mockGet.mockResolvedValue(
      okEnvelope({
        items: [
          {
            courseId: 1,
            title: '2026 수능 국어 완성반',
            instructorName: '김강사',
            price: 99000,
          },
          {
            courseId: 3,
            title: '2026 수능 수학 개념완성',
            instructorName: '박강사',
            price: 89000,
          },
        ],
        selectedCount: 2,
        totalAmount: 188000,
      }),
    );

    const cart = await getCartServer();

    expect(cart.items).toHaveLength(2);
    expect(cart.items[0]).toEqual({
      cartItemId: 1,
      courseId: 1,
      title: '2026 수능 국어 완성반',
      instructor: '김강사',
      price: 99000,
      thumbnailUrl: '',
    });
    expect(cart.items[1].title).toBe('2026 수능 수학 개념완성');
    expect(cart.items[1].instructor).toBe('박강사');
    expect(cart.items[1].price).toBe(89000);
  });

  it('GET /api/cart 를 호출한다 (비로그인이면 수강목록은 조회 안 함)', async () => {
    mockGet.mockResolvedValue(
      okEnvelope({ items: [], selectedCount: 0, totalAmount: 0 }),
    );

    await getCartServer();

    // 비로그인 → 수강목록 조회 생략 → cart 한 번만
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith('/api/cart');
  });

  it('BE가 썸네일을 안 주므로 thumbnailUrl은 빈 문자열 기본값', async () => {
    mockGet.mockResolvedValue(
      okEnvelope({
        items: [
          { courseId: 7, title: '강의', instructorName: '강사', price: 1000 },
        ],
        selectedCount: 1,
        totalAmount: 1000,
      }),
    );

    const cart = await getCartServer();

    expect(cart.items[0].thumbnailUrl).toBe('');
  });

  it('cartItemId가 없어 courseId를 식별자(cartItemId)로 사용한다', async () => {
    mockGet.mockResolvedValue(
      okEnvelope({
        items: [
          { courseId: 42, title: '강의', instructorName: '강사', price: 5000 },
        ],
        selectedCount: 1,
        totalAmount: 5000,
      }),
    );

    const cart = await getCartServer();

    // BE는 cartItemId가 없고 courseId로 삭제 → cartItemId === courseId
    expect(cart.items[0].cartItemId).toBe(42);
    expect(cart.items[0].courseId).toBe(42);
  });

  it('totalAmount → totalPrice 로 매핑한다', async () => {
    mockGet.mockResolvedValue(
      okEnvelope({
        items: [
          { courseId: 1, title: 'A', instructorName: '강사', price: 30000 },
          { courseId: 2, title: 'B', instructorName: '강사', price: 70000 },
        ],
        selectedCount: 2,
        totalAmount: 100000,
      }),
    );

    const cart = await getCartServer();

    expect(cart.totalPrice).toBe(100000);
  });

  it('totalCount는 selectedCount가 아니라 items.length 로 계산한다', async () => {
    // selectedCount(2)와 items.length(3)가 달라도 totalCount는 항목 수를 따른다
    mockGet.mockResolvedValue(
      okEnvelope({
        items: [
          { courseId: 1, title: 'A', instructorName: '강사', price: 1000 },
          { courseId: 2, title: 'B', instructorName: '강사', price: 1000 },
          { courseId: 3, title: 'C', instructorName: '강사', price: 1000 },
        ],
        selectedCount: 2,
        totalAmount: 2000,
      }),
    );

    const cart = await getCartServer();

    expect(cart.totalCount).toBe(3);
  });

  it('빈 장바구니(items=[]) → 빈 배열·0 합계·0 카운트', async () => {
    mockGet.mockResolvedValue(
      okEnvelope({ items: [], selectedCount: 0, totalAmount: 0 }),
    );

    const cart = await getCartServer();

    expect(cart.items).toEqual([]);
    expect(cart.totalPrice).toBe(0);
    expect(cart.totalCount).toBe(0);
  });

  it('가격 0원(무료 강의 경계값)도 그대로 매핑한다', async () => {
    mockGet.mockResolvedValue(
      okEnvelope({
        items: [
          { courseId: 9, title: '무료 강의', instructorName: '강사', price: 0 },
        ],
        selectedCount: 1,
        totalAmount: 0,
      }),
    );

    const cart = await getCartServer();

    expect(cart.items[0].price).toBe(0);
    expect(cart.totalPrice).toBe(0);
  });

  it('실패 응답(success=false) → 에러를 던진다 (빈 장바구니로 숨기지 않음)', async () => {
    mockGet.mockResolvedValue({
      success: false,
      httpStatus: 500,
      message: '서버 오류',
      data: undefined,
    });

    await expect(getCartServer()).rejects.toThrow('장바구니를 불러오지 못했습니다.');
  });

  it('성공이지만 data가 없으면(null) → 에러를 던진다', async () => {
    mockGet.mockResolvedValue({
      success: true,
      httpStatus: 200,
      message: 'OK',
      data: null,
    });

    await expect(getCartServer()).rejects.toThrow('장바구니를 불러오지 못했습니다.');
  });
});

describe('getCartServer — 이미 수강중(구매 완료)인 강의 제외 (로그인)', () => {
  beforeEach(() => {
    mockGetUser.mockResolvedValue({ memberId: 1 });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  // /api/cart 와 /api/enrollments/me 를 URL로 구분해 응답을 갈아끼운다.
  function wire(
    cartItems: {
      courseId: number;
      title: string;
      instructorName: string;
      price: number;
    }[],
    enrolledCourseIds: number[],
  ) {
    mockGet.mockImplementation((url: string) =>
      url.includes('/enrollments/me')
        ? Promise.resolve(
            okEnvelope(enrolledCourseIds.map((id) => ({ courseId: id }))),
          )
        : Promise.resolve(
            okEnvelope({
              items: cartItems,
              selectedCount: cartItems.length,
              totalAmount: cartItems.reduce((s, i) => s + i.price, 0),
            }),
          ),
    );
  }

  it('수강중인 강의는 목록에서 빠지고 합계·개수가 재계산된다', async () => {
    wire(
      [
        { courseId: 1, title: '국어', instructorName: '김강사', price: 99000 },
        { courseId: 3, title: '수학', instructorName: '박강사', price: 89000 },
      ],
      [1], // 1번 강의는 이미 수강중
    );

    const cart = await getCartServer();

    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].courseId).toBe(3);
    expect(cart.totalPrice).toBe(89000);
    expect(cart.totalCount).toBe(1);
  });

  it('수강중인 강의가 없으면 장바구니가 그대로 유지된다', async () => {
    wire(
      [{ courseId: 5, title: 'A', instructorName: '강사', price: 10000 }],
      [99], // 겹치는 수강 없음
    );

    const cart = await getCartServer();

    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].courseId).toBe(5);
    expect(cart.totalPrice).toBe(10000);
  });

  it('장바구니 항목이 전부 수강중이면 빈 장바구니가 된다', async () => {
    wire(
      [
        { courseId: 1, title: 'A', instructorName: '강사', price: 10000 },
        { courseId: 2, title: 'B', instructorName: '강사', price: 20000 },
      ],
      [1, 2],
    );

    const cart = await getCartServer();

    expect(cart.items).toEqual([]);
    expect(cart.totalPrice).toBe(0);
    expect(cart.totalCount).toBe(0);
  });

  it('수강목록 조회가 실패 봉투(success=false)면 필터 미적용 — 장바구니 그대로', async () => {
    // /api/cart는 성공, /api/enrollments/me만 실패 봉투
    mockGet.mockImplementation((url: string) =>
      url.includes('/enrollments/me')
        ? Promise.resolve({ success: false, httpStatus: 500, data: undefined })
        : Promise.resolve(
            okEnvelope({
              items: [
                { courseId: 1, title: 'A', instructorName: '강사', price: 10000 },
              ],
              selectedCount: 1,
              totalAmount: 10000,
            }),
          ),
    );

    const cart = await getCartServer();

    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].courseId).toBe(1);
    expect(cart.totalPrice).toBe(10000);
  });

  it('수강목록 조회가 예외(reject)여도 장바구니는 그대로 노출된다', async () => {
    // serverApi.get 계약이 바뀌어 예외를 던져도 getCartServer가 깨지지 않아야 한다
    mockGet.mockImplementation((url: string) =>
      url.includes('/enrollments/me')
        ? Promise.reject(new Error('network down'))
        : Promise.resolve(
            okEnvelope({
              items: [
                { courseId: 1, title: 'A', instructorName: '강사', price: 10000 },
              ],
              selectedCount: 1,
              totalAmount: 10000,
            }),
          ),
    );

    const cart = await getCartServer();

    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].courseId).toBe(1);
    expect(cart.totalPrice).toBe(10000);
  });
});
