import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WishlistCard from './WishlistCard';
import type { WishlistCourse } from '../types';

// next/link 는 jsdom 에서 <a> 로 렌더되므로 추가 mock 불필요.
// 이 컴포넌트는 router/toast/action 을 직접 import 하지 않고 콜백 props 로만 동작한다.

const baseCourse: WishlistCourse = {
  courseId: 42,
  title: '수능 수학 마스터',
  instructorName: '김강사',
  subjectName: '수학',
  price: 50000,
  isFree: false,
  averageRating: 4.5,
  reviewCount: 123,
  studentCount: 4567,
  thumbnailUrl: undefined,
  isEnrolled: false,
  isInCart: false,
};

function makeCourse(overrides: Partial<WishlistCourse> = {}): WishlistCourse {
  return { ...baseCourse, ...overrides };
}

function renderCard(course: WishlistCourse) {
  const onRemove = jest.fn();
  const onAddToCart = jest.fn();
  const onEnroll = jest.fn();
  render(
    <WishlistCard
      course={course}
      onRemove={onRemove}
      onAddToCart={onAddToCart}
      onEnroll={onEnroll}
    />,
  );
  return { onRemove, onAddToCart, onEnroll };
}

describe('WishlistCard', () => {
  describe('강의 기본 정보 렌더링', () => {
    it('제목·강사·과목·별점·수강생 수를 표시한다', () => {
      renderCard(makeCourse());

      expect(
        screen.getByRole('heading', { name: '수능 수학 마스터' }),
      ).toBeInTheDocument();
      expect(screen.getByText('김강사')).toBeInTheDocument();
      // 과목 배지(상단)
      expect(screen.getByText('수학')).toBeInTheDocument();
      // 별점 (소수 1자리)
      expect(screen.getByText('4.5')).toBeInTheDocument();
      // 리뷰 수 (천단위 콤마)
      expect(screen.getByText('(123)')).toBeInTheDocument();
      // 수강생 수
      expect(screen.getByText('• 4,567명 수강')).toBeInTheDocument();
    });

    it('유료 강의는 가격을 원 단위 콤마로 표시한다', () => {
      renderCard(makeCourse({ isFree: false, price: 50000 }));
      expect(screen.getByText('50,000원')).toBeInTheDocument();
      expect(screen.queryByText('무료')).not.toBeInTheDocument();
    });

    it('무료 강의는 가격 대신 "무료" 배지를 표시한다', () => {
      renderCard(makeCourse({ isFree: true, price: 0 }));
      expect(screen.getByText('무료')).toBeInTheDocument();
      expect(screen.queryByText('0원')).not.toBeInTheDocument();
    });
  });

  describe('상태별 CTA 버튼 분기', () => {
    it('수강중(isEnrolled)이면 "학습하기" 링크를 학습 페이지로 노출한다', () => {
      // isEnrolled 가 최우선 — 유료/담김 여부와 무관하게 학습하기
      renderCard(
        makeCourse({ isEnrolled: true, isFree: false, isInCart: true }),
      );

      const learnLink = screen.getByRole('link', { name: /학습하기/ });
      expect(learnLink).toHaveAttribute('href', '/learning/42');

      // 다른 CTA 는 나오지 않는다
      expect(
        screen.queryByRole('button', { name: /무료로 수강하기/ }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /장바구니 담기/ }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('link', { name: /장바구니로 가기/ }),
      ).not.toBeInTheDocument();
    });

    it('무료·미수강이면 "무료로 수강하기" 버튼을 노출한다', () => {
      renderCard(
        makeCourse({ isEnrolled: false, isFree: true, isInCart: false }),
      );

      expect(
        screen.getByRole('button', { name: '무료로 수강하기' }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('link', { name: /학습하기/ }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /장바구니 담기/ }),
      ).not.toBeInTheDocument();
    });

    it('유료·미담김이면 "장바구니 담기" 버튼을 노출한다', () => {
      renderCard(
        makeCourse({ isEnrolled: false, isFree: false, isInCart: false }),
      );

      expect(
        screen.getByRole('button', { name: /장바구니 담기/ }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('link', { name: /장바구니로 가기/ }),
      ).not.toBeInTheDocument();
    });

    it('유료·담김이면 "장바구니로 가기" 링크를 /cart 로 노출한다', () => {
      renderCard(
        makeCourse({ isEnrolled: false, isFree: false, isInCart: true }),
      );

      const cartLink = screen.getByRole('link', { name: /장바구니로 가기/ });
      expect(cartLink).toHaveAttribute('href', '/cart');
      expect(
        screen.queryByRole('button', { name: /장바구니 담기/ }),
      ).not.toBeInTheDocument();
    });

    it('무료가 미수강보다 우선 — 무료·담김이어도 "무료로 수강하기"를 노출한다(회귀)', () => {
      // 분기 순서: isEnrolled > isFree > isInCart. 무료면 isInCart 무시.
      renderCard(
        makeCourse({ isEnrolled: false, isFree: true, isInCart: true }),
      );

      expect(
        screen.getByRole('button', { name: '무료로 수강하기' }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('link', { name: /장바구니로 가기/ }),
      ).not.toBeInTheDocument();
    });
  });

  describe('CTA 버튼 상호작용', () => {
    it('"무료로 수강하기" 클릭 시 onEnroll 만 호출한다', async () => {
      const user = userEvent.setup();
      const { onEnroll, onAddToCart, onRemove } = renderCard(
        makeCourse({ isFree: true, isEnrolled: false, isInCart: false }),
      );

      await user.click(
        screen.getByRole('button', { name: '무료로 수강하기' }),
      );

      expect(onEnroll).toHaveBeenCalledTimes(1);
      expect(onAddToCart).not.toHaveBeenCalled();
      expect(onRemove).not.toHaveBeenCalled();
    });

    it('"장바구니 담기" 클릭 시 onAddToCart 만 호출한다', async () => {
      const user = userEvent.setup();
      const { onAddToCart, onEnroll, onRemove } = renderCard(
        makeCourse({ isFree: false, isEnrolled: false, isInCart: false }),
      );

      await user.click(
        screen.getByRole('button', { name: /장바구니 담기/ }),
      );

      expect(onAddToCart).toHaveBeenCalledTimes(1);
      expect(onEnroll).not.toHaveBeenCalled();
      expect(onRemove).not.toHaveBeenCalled();
    });
  });

  describe('찜 해제 버튼', () => {
    it('aria-label "<제목> 찜 해제" 버튼을 노출한다', () => {
      renderCard(makeCourse());
      expect(
        screen.getByRole('button', { name: '수능 수학 마스터 찜 해제' }),
      ).toBeInTheDocument();
    });

    it('찜 해제 버튼 클릭 시 onRemove 만 호출한다', async () => {
      const user = userEvent.setup();
      const { onRemove, onEnroll, onAddToCart } = renderCard(makeCourse());

      await user.click(
        screen.getByRole('button', { name: '수능 수학 마스터 찜 해제' }),
      );

      expect(onRemove).toHaveBeenCalledTimes(1);
      expect(onEnroll).not.toHaveBeenCalled();
      expect(onAddToCart).not.toHaveBeenCalled();
    });
  });

  describe('상세보기 링크', () => {
    it('"상세보기" 링크를 /courses/<id> 로 노출한다', () => {
      renderCard(makeCourse({ courseId: 42 }));

      const detailLink = screen.getByRole('link', { name: /상세보기/ });
      expect(detailLink).toHaveAttribute('href', '/courses/42');
    });

    it('상세보기 링크는 어떤 강의 상태에서도 항상 존재한다', () => {
      renderCard(makeCourse({ isEnrolled: true }));
      expect(
        screen.getByRole('link', { name: /상세보기/ }),
      ).toHaveAttribute('href', '/courses/42');
    });
  });

  describe('썸네일', () => {
    it('thumbnailUrl 이 있으면 강의 이미지를 alt=제목으로 렌더한다', () => {
      renderCard(
        makeCourse({ thumbnailUrl: 'https://cdn.example.com/thumb.jpg' }),
      );
      const img = screen.getByRole('img', { name: '수능 수학 마스터' });
      expect(img).toHaveAttribute('src', 'https://cdn.example.com/thumb.jpg');
    });

    it('thumbnailUrl 이 없으면 강의 이미지(alt=제목)를 렌더하지 않는다', () => {
      renderCard(makeCourse({ thumbnailUrl: undefined }));
      expect(
        screen.queryByRole('img', { name: '수능 수학 마스터' }),
      ).not.toBeInTheDocument();
    });
  });
});
