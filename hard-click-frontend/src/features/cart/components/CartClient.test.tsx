import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CartClient from './CartClient';
import type { Cart } from '../types';
import { removeCartItemsAction } from '../actions';

// next/navigation — router push 추적용
const push = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push, refresh: jest.fn(), back: jest.fn() }),
  usePathname: () => '/cart',
}));

// toast — 성공/실패 토스트 추적용 (컴포넌트는 @/lib/toast 래퍼를 import)
jest.mock('@/lib/toast', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

// 삭제 server action — 결과를 테스트가 제어
jest.mock('../actions', () => ({
  removeCartItemsAction: jest.fn(),
}));

import { toast } from '@/lib/toast';

const mockedRemove = removeCartItemsAction as jest.MockedFunction<
  typeof removeCartItemsAction
>;
const mockedToastSuccess = toast.success as jest.Mock;
const mockedToastError = toast.error as jest.Mock;

/** 테스트용 장바구니 — 항목 3개 */
function makeCart(): Cart {
  const items = [
    {
      cartItemId: 1,
      courseId: 101,
      title: '수능 국어',
      instructor: '김국어',
      price: 10000,
      thumbnailUrl: '',
    },
    {
      cartItemId: 2,
      courseId: 102,
      title: '수능 수학',
      instructor: '이수학',
      price: 20000,
      thumbnailUrl: '',
    },
    {
      cartItemId: 3,
      courseId: 103,
      title: '수능 영어',
      instructor: '박영어',
      price: 30000,
      thumbnailUrl: '',
    },
  ];
  return {
    items,
    totalCount: items.length,
    totalPrice: items.reduce((s, it) => s + it.price, 0),
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockedRemove.mockResolvedValue({
    success: true,
    message: '장바구니가 삭제되었습니다.',
  });
});

describe('CartClient — 장바구니 통합', () => {
  describe('초기 렌더', () => {
    it('모든 항목이 기본 선택되어 선택 합계가 전체 합계와 같다', () => {
      render(<CartClient cart={makeCart()} />);

      expect(screen.getByText('수능 국어')).toBeInTheDocument();
      expect(screen.getByText('수능 수학')).toBeInTheDocument();
      expect(screen.getByText('수능 영어')).toBeInTheDocument();

      // 선택한 강의 3개 + 합계 60,000원(2회: 총 상품금액·최종 결제금액)
      expect(screen.getByText('3개')).toBeInTheDocument();
      expect(screen.getAllByText('60,000원')).toHaveLength(2);
    });

    it('전체 선택 버튼이 모두 선택된 상태(aria-pressed=true)다', () => {
      render(<CartClient cart={makeCart()} />);
      expect(
        screen.getByRole('button', { name: '전체 선택' }),
      ).toHaveAttribute('aria-pressed', 'true');
    });

    it('결제하기 버튼이 활성화되어 있다', () => {
      render(<CartClient cart={makeCart()} />);
      expect(
        screen.getByRole('button', { name: '결제하기' }),
      ).toBeEnabled();
    });
  });

  describe('선택 토글 → 합계 갱신', () => {
    it('한 항목을 해제하면 선택 개수·합계가 줄어든다', async () => {
      const user = userEvent.setup();
      render(<CartClient cart={makeCart()} />);

      // 수능 국어(10,000원) 해제 → 2개·50,000원
      await user.click(
        screen.getByRole('button', { name: '수능 국어 선택' }),
      );

      expect(screen.getByText('2개')).toBeInTheDocument();
      expect(screen.getAllByText('50,000원')).toHaveLength(2);
    });

    it('해제했던 항목을 다시 선택하면 합계가 복원된다', async () => {
      const user = userEvent.setup();
      render(<CartClient cart={makeCart()} />);
      const toggle = screen.getByRole('button', { name: '수능 수학 선택' });

      await user.click(toggle); // 해제 → 40,000원
      expect(screen.getAllByText('40,000원')).toHaveLength(2);

      await user.click(toggle); // 재선택 → 60,000원
      expect(screen.getAllByText('60,000원')).toHaveLength(2);
    });

    it('모두 해제하면 0개·0원이며 결제하기가 비활성화된다', async () => {
      const user = userEvent.setup();
      render(<CartClient cart={makeCart()} />);

      await user.click(screen.getByRole('button', { name: '수능 국어 선택' }));
      await user.click(screen.getByRole('button', { name: '수능 수학 선택' }));
      await user.click(screen.getByRole('button', { name: '수능 영어 선택' }));

      expect(screen.getByText('0개')).toBeInTheDocument();
      expect(screen.getAllByText('0원')).toHaveLength(2);
      expect(
        screen.getByRole('button', { name: '결제하기' }),
      ).toBeDisabled();
    });
  });

  describe('전체 선택', () => {
    it('전체 선택 버튼으로 전체 해제 후 다시 전체 선택할 수 있다', async () => {
      const user = userEvent.setup();
      render(<CartClient cart={makeCart()} />);
      const selectAll = screen.getByRole('button', { name: '전체 선택' });

      await user.click(selectAll); // 전체 해제
      expect(selectAll).toHaveAttribute('aria-pressed', 'false');
      expect(screen.getByText('0개')).toBeInTheDocument();

      await user.click(selectAll); // 전체 선택
      expect(selectAll).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByText('3개')).toBeInTheDocument();
    });

    it('일부만 선택된 상태에서 전체 선택을 누르면 모두 선택된다', async () => {
      const user = userEvent.setup();
      render(<CartClient cart={makeCart()} />);

      await user.click(screen.getByRole('button', { name: '수능 국어 선택' }));
      expect(screen.getByText('2개')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: '전체 선택' }));
      expect(screen.getByText('3개')).toBeInTheDocument();
    });
  });

  describe('결제하기', () => {
    it('선택된 강의의 courseIds로 체크아웃으로 이동한다', async () => {
      const user = userEvent.setup();
      render(<CartClient cart={makeCart()} />);

      await user.click(screen.getByRole('button', { name: '결제하기' }));

      expect(push).toHaveBeenCalledWith(
        '/checkout?type=course&courseIds=101,102,103',
      );
    });

    it('일부만 선택하면 선택분 courseIds만 넘긴다', async () => {
      const user = userEvent.setup();
      render(<CartClient cart={makeCart()} />);

      await user.click(screen.getByRole('button', { name: '수능 수학 선택' }));
      await user.click(screen.getByRole('button', { name: '결제하기' }));

      expect(push).toHaveBeenCalledWith(
        '/checkout?type=course&courseIds=101,103',
      );
    });

    it('선택 항목이 없으면 이동하지 않는다(버튼 비활성)', async () => {
      const user = userEvent.setup();
      render(<CartClient cart={makeCart()} />);

      await user.click(screen.getByRole('button', { name: '전체 선택' })); // 전체 해제
      await user.click(screen.getByRole('button', { name: '결제하기' }));

      expect(push).not.toHaveBeenCalled();
    });

    it('강의 둘러보기는 강의 목록으로 이동한다', async () => {
      const user = userEvent.setup();
      render(<CartClient cart={makeCart()} />);

      await user.click(screen.getByRole('button', { name: '강의 둘러보기' }));
      expect(push).toHaveBeenCalledWith('/courses');
    });
  });

  describe('개별 삭제 → 확인 모달 → 액션 호출 → optimistic 제거', () => {
    it('휴지통 클릭 시 단건 확인 모달이 뜬다', async () => {
      const user = userEvent.setup();
      render(<CartClient cart={makeCart()} />);

      await user.click(screen.getByRole('button', { name: '수능 국어 삭제' }));

      expect(
        screen.getByText('선택한 강의를 삭제하시겠습니까?'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('1개의 강의가 장바구니에서 삭제됩니다.'),
      ).toBeInTheDocument();
    });

    it('확인 시 해당 cartItemId로 액션을 호출하고 항목이 사라진다', async () => {
      const user = userEvent.setup();
      render(<CartClient cart={makeCart()} />);

      await user.click(screen.getByRole('button', { name: '수능 국어 삭제' }));
      await user.click(screen.getByRole('button', { name: '삭제' }));

      expect(mockedRemove).toHaveBeenCalledWith([1]);
      expect(mockedToastSuccess).toHaveBeenCalledWith(
        '장바구니가 삭제되었습니다.',
      );
      // optimistic 제거 — 수능 국어는 목록에서 빠지고 나머지는 남는다
      expect(screen.queryByText('수능 국어')).not.toBeInTheDocument();
      expect(screen.getByText('수능 수학')).toBeInTheDocument();
    });

    it('삭제된 항목이 선택 합계에서 빠진다', async () => {
      const user = userEvent.setup();
      render(<CartClient cart={makeCart()} />);

      await user.click(screen.getByRole('button', { name: '수능 국어 삭제' }));
      await user.click(screen.getByRole('button', { name: '삭제' }));

      // 60,000 - 10,000 = 50,000원, 2개
      expect(screen.getByText('2개')).toBeInTheDocument();
      expect(screen.getAllByText('50,000원')).toHaveLength(2);
    });

    it('취소하면 모달이 닫히고 액션이 호출되지 않는다', async () => {
      const user = userEvent.setup();
      render(<CartClient cart={makeCart()} />);

      await user.click(screen.getByRole('button', { name: '수능 국어 삭제' }));
      await user.click(screen.getByRole('button', { name: '취소' }));

      expect(
        screen.queryByText('선택한 강의를 삭제하시겠습니까?'),
      ).not.toBeInTheDocument();
      expect(mockedRemove).not.toHaveBeenCalled();
      expect(screen.getByText('수능 국어')).toBeInTheDocument();
    });
  });

  describe('전체 삭제', () => {
    it('전체 삭제 시 전체 확인 모달이 뜨고 모든 cartItemId로 액션을 호출한다', async () => {
      const user = userEvent.setup();
      render(<CartClient cart={makeCart()} />);

      await user.click(screen.getByRole('button', { name: '전체 삭제' }));

      expect(
        screen.getByText('장바구니를 전체 삭제하시겠습니까?'),
      ).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: '삭제' }));

      expect(mockedRemove).toHaveBeenCalledWith([1, 2, 3]);
    });

    it('전체 삭제 후 빈 상태 화면으로 전환된다', async () => {
      const user = userEvent.setup();
      render(<CartClient cart={makeCart()} />);

      await user.click(screen.getByRole('button', { name: '전체 삭제' }));
      await user.click(screen.getByRole('button', { name: '삭제' }));

      expect(
        await screen.findByText('장바구니에 담긴 강의가 없습니다'),
      ).toBeInTheDocument();
    });
  });

  describe('삭제 실패 처리', () => {
    it('액션이 실패를 반환하면 에러 토스트가 뜨고 항목은 유지된다', async () => {
      mockedRemove.mockResolvedValue({
        success: false,
        message: '장바구니 항목을 찾을 수 없습니다.',
      });
      const user = userEvent.setup();
      render(<CartClient cart={makeCart()} />);

      await user.click(screen.getByRole('button', { name: '수능 국어 삭제' }));
      await user.click(screen.getByRole('button', { name: '삭제' }));

      expect(mockedToastError).toHaveBeenCalledWith(
        '장바구니 항목을 찾을 수 없습니다.',
      );
      expect(screen.getByText('수능 국어')).toBeInTheDocument();
    });

    it('액션이 예외를 던지면 일반 에러 토스트가 뜨고 항목은 유지된다', async () => {
      mockedRemove.mockRejectedValue(new Error('network'));
      const user = userEvent.setup();
      render(<CartClient cart={makeCart()} />);

      await user.click(screen.getByRole('button', { name: '수능 국어 삭제' }));
      await user.click(screen.getByRole('button', { name: '삭제' }));

      expect(mockedToastError).toHaveBeenCalledWith(
        '삭제에 실패했어요. 잠시 후 다시 시도해주세요.',
      );
      expect(screen.getByText('수능 국어')).toBeInTheDocument();
    });
  });

  describe('빈 상태', () => {
    it('처음부터 항목이 없으면 빈 상태를 보여준다', () => {
      render(
        <CartClient cart={{ items: [], totalCount: 0, totalPrice: 0 }} />,
      );
      expect(
        screen.getByText('장바구니에 담긴 강의가 없습니다'),
      ).toBeInTheDocument();
      // 결제 예정 금액 카드는 렌더되지 않는다
      expect(
        screen.queryByRole('button', { name: '결제하기' }),
      ).not.toBeInTheDocument();
    });

    it('빈 상태에서 강의 둘러보기 링크가 강의 목록을 가리킨다', () => {
      render(
        <CartClient cart={{ items: [], totalCount: 0, totalPrice: 0 }} />,
      );
      expect(
        screen.getByRole('link', { name: '강의 둘러보기' }),
      ).toHaveAttribute('href', '/courses');
    });
  });

  describe('항목 카드 표시', () => {
    it('각 항목의 강사명과 가격이 표시된다', () => {
      render(<CartClient cart={makeCart()} />);
      const item = screen
        .getByRole('button', { name: '수능 수학 선택' })
        .closest('li') as HTMLElement;

      expect(within(item).getByText('이수학')).toBeInTheDocument();
      expect(within(item).getByText('20,000원')).toBeInTheDocument();
    });
  });
});
