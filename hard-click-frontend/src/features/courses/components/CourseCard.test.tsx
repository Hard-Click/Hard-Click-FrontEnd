import { render, screen } from '@testing-library/react';
import CourseCard from './CourseCard';
import type { CourseListItem } from '../types';

// 기본 fixture — 각 테스트에서 필요한 필드만 override
function makeCourse(overrides: Partial<CourseListItem> = {}): CourseListItem {
  return {
    courseId: 1,
    title: '수능 수학 마스터',
    instructorName: '한도선',
    subjectName: '수학',
    price: 89000,
    thumbnailUrl: undefined,
    averageRating: 4.5,
    reviewCount: 128,
    studentCount: 1024,
    status: 'PUBLISHED',
    createdAt: '2026-01-01T00:00:00Z',
    isFree: false,
    ...overrides,
  };
}

describe('CourseCard — 강의 카드 렌더', () => {
  it('과목·강사·강의명을 렌더한다', () => {
    render(<CourseCard course={makeCourse()} />);

    expect(screen.getByText('수능 수학 마스터')).toBeInTheDocument();
    expect(screen.getByText('한도선')).toBeInTheDocument();
    expect(screen.getByText('수학')).toBeInTheDocument();
  });

  it('수강생 수를 천 단위 콤마로 렌더한다', () => {
    render(<CourseCard course={makeCourse({ studentCount: 1024 })} />);

    expect(screen.getByText('1,024명 수강')).toBeInTheDocument();
  });

  it('상세 페이지로 가는 링크를 렌더한다 (기본 prefix /courses)', () => {
    render(<CourseCard course={makeCourse({ courseId: 42 })} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/courses/42');
  });

  it('hrefPrefix prop으로 링크 prefix를 바꿀 수 있다', () => {
    render(<CourseCard course={makeCourse({ courseId: 7 })} hrefPrefix="/instructor/courses" />);

    expect(screen.getByRole('link')).toHaveAttribute('href', '/instructor/courses/7');
  });
});

describe('CourseCard — 평점 표시 (회귀: 리뷰 0개면 "평점 없음")', () => {
  it('reviewCount > 0 이면 평점과 리뷰수를 표시한다', () => {
    render(<CourseCard course={makeCourse({ averageRating: 4.5, reviewCount: 128 })} />);

    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('(128)')).toBeInTheDocument();
    expect(screen.queryByText('평점 없음')).not.toBeInTheDocument();
  });

  it('평점은 소수점 1자리로 표시한다 (정수 평점도 4.0 형태)', () => {
    render(<CourseCard course={makeCourse({ averageRating: 4, reviewCount: 3 })} />);

    expect(screen.getByText('4.0')).toBeInTheDocument();
  });

  it('리뷰수가 많으면 천 단위 콤마로 표시한다', () => {
    render(<CourseCard course={makeCourse({ averageRating: 4.9, reviewCount: 12345 })} />);

    expect(screen.getByText('(12,345)')).toBeInTheDocument();
  });

  it('reviewCount === 0 이면 "평점 없음"을 표시하고 평점/리뷰수는 숨긴다 (엣지·회귀)', () => {
    render(<CourseCard course={makeCourse({ averageRating: 0, reviewCount: 0 })} />);

    expect(screen.getByText('평점 없음')).toBeInTheDocument();
    // 0.0점처럼 보이지 않아야 한다
    expect(screen.queryByText('0.0')).not.toBeInTheDocument();
    expect(screen.queryByText('(0)')).not.toBeInTheDocument();
  });
});

describe('CourseCard — 가격/무료 배지', () => {
  it('무료면 "무료" 배지를 표시한다 (배지 + 가격 두 곳)', () => {
    render(<CourseCard course={makeCourse({ isFree: true, price: 0 })} />);

    // 무료 배지(썸네일)와 가격 영역 두 곳에 "무료"
    expect(screen.getAllByText('무료')).toHaveLength(2);
  });

  it('유료면 "무료" 배지가 없고 가격을 원 단위로 표시한다', () => {
    render(<CourseCard course={makeCourse({ isFree: false, price: 89000 })} />);

    expect(screen.queryByText('무료')).not.toBeInTheDocument();
    expect(screen.getByText('89,000원')).toBeInTheDocument();
  });
});

describe('CourseCard — 썸네일', () => {
  it('thumbnailUrl이 있으면 img(alt=강의명)를 렌더한다', () => {
    render(
      <CourseCard
        course={makeCourse({ title: '국어 기초', thumbnailUrl: 'https://example.com/t.jpg' })}
      />,
    );

    const img = screen.getByRole('img', { name: '국어 기초' });
    expect(img).toHaveAttribute('src', 'https://example.com/t.jpg');
  });

  it('thumbnailUrl이 없으면 img를 렌더하지 않는다 (그라데이션 폴백)', () => {
    render(<CourseCard course={makeCourse({ thumbnailUrl: undefined })} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
