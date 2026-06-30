import Link from 'next/link';
import Image from 'next/image';
import { SUBJECT_GRADIENTS } from '@/features/courses/components/CourseCard';
import { StarIcon } from '@/components/common/RatingStars';
import type { WishlistCourse } from '../types';

function CartIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M1.33 1.33h1.34l1.06 9.34a1.33 1.33 0 0 0 1.33 1.16h6.4a1.33 1.33 0 0 0 1.3-1.05l1.07-5.45H4M6 14.67a.67.67 0 1 1-1.33 0 .67.67 0 0 1 1.33 0Zm7.33 0a.67.67 0 1 1-1.33 0 .67.67 0 0 1 1.33 0Z"
        stroke={color}
        strokeWidth="1.33"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="#FFFFFF" aria-hidden="true">
      <path d="M4.5 2.5v11l9-5.5-9-5.5Z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M1.33 8s2.4-4.67 6.67-4.67S14.67 8 14.67 8s-2.4 4.67-6.67 4.67S1.33 8 1.33 8Z"
        stroke="#4B5563"
        strokeWidth="1.33"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="8" r="2" stroke="#4B5563" strokeWidth="1.33" />
    </svg>
  );
}

interface Props {
  course: WishlistCourse;
  /** 찜 해제 */
  onRemove: () => void;
  /** 장바구니 담기 (유료·미담김) */
  onAddToCart: () => void;
  /** 무료 수강하기 (무료·미수강) */
  onEnroll: () => void;
}

export default function WishlistCard({
  course,
  onRemove,
  onAddToCart,
  onEnroll,
}: Props) {
  const {
    courseId,
    title,
    instructorName,
    subjectName,
    price,
    isFree,
    averageRating,
    reviewCount,
    studentCount,
    thumbnailUrl,
    isEnrolled,
    isInCart,
  } = course;

  const [fromColor, toColor] = SUBJECT_GRADIENTS[subjectName] ?? [
    '#475569',
    '#94A3B8',
  ];

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_4px_10px_rgba(0,0,0,0.06)]">
      {/* 썸네일 + 찜 해제 버튼 */}
      <div className="relative aspect-[284/160] overflow-hidden">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${fromColor}, ${toColor})`,
            }}
          />
        )}
        <button
          type="button"
          onClick={onRemove}
          aria-label={`${title} 찜 해제`}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)] transition-transform hover:scale-105"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/heartFilledIcon.svg" width={20} height={20} alt="" />
        </button>
      </div>

      {/* 본문 */}
      <div className="flex flex-1 flex-col p-5">
        <span className="mb-3 self-start rounded bg-[rgba(47,93,170,0.1)] px-2 py-1 text-xs font-semibold text-[#2F5DAA]">
          {subjectName}
        </span>

        <h3 className="mb-1 line-clamp-2 text-lg font-bold leading-7 text-[#1F2937]">
          {title}
        </h3>
        <p className="mb-3 text-sm text-[#4B5563]">{instructorName}</p>

        {/* 별점 · 수강생 */}
        <div className="mb-3 flex items-center gap-1.5 text-sm">
          <StarIcon filled size={16} />
          <span className="font-bold text-[#1F2937]">
            {averageRating.toFixed(1)}
          </span>
          <span className="text-xs text-[#4B5563]">
            ({reviewCount.toLocaleString()})
          </span>
          <span className="text-xs text-[#4B5563]">
            • {studentCount.toLocaleString()}명 수강
          </span>
        </div>

        {/* 가격 */}
        <div className="mb-4">
          {isFree ? (
            <span className="inline-block rounded-2xl bg-[rgba(22,163,74,0.1)] px-3 py-1 text-sm font-bold text-[#16A34A]">
              무료
            </span>
          ) : (
            <p className="text-2xl font-bold text-[#2F5DAA]">
              {price.toLocaleString()}원
            </p>
          )}
        </div>

        {/* 액션 버튼 (상태별) + 상세보기 */}
        <div className="mt-auto flex flex-col gap-2">
          {isEnrolled ? (
            <Link
              href={`/learning/${courseId}`}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-[10px] bg-[#2F5DAA] text-base font-semibold text-white transition-colors hover:bg-[#1D3E75]"
            >
              <PlayIcon />
              학습하기
            </Link>
          ) : isFree ? (
            <button
              type="button"
              onClick={onEnroll}
              className="h-10 w-full rounded-[10px] bg-[#16A34A] text-base font-semibold text-white transition-colors hover:bg-[#15803D]"
            >
              무료로 수강하기
            </button>
          ) : isInCart ? (
            <Link
              href="/cart"
              className="flex h-10 w-full items-center justify-center gap-2 rounded-[10px] bg-[#2F5DAA] text-base font-semibold text-white transition-colors hover:bg-[#1D3E75]"
            >
              <CartIcon color="#FFFFFF" />
              장바구니로 가기
            </Link>
          ) : (
            <button
              type="button"
              onClick={onAddToCart}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-[10px] bg-[#2F5DAA] text-base font-semibold text-white transition-colors hover:bg-[#1D3E75]"
            >
              <CartIcon color="#FFFFFF" />
              장바구니 담기
            </button>
          )}

          <Link
            href={`/courses/${courseId}`}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-[10px] border border-[#E2E8F0] bg-white text-base font-semibold text-[#4B5563] transition-colors hover:border-[#CBD5E1]"
          >
            <EyeIcon />
            상세보기
          </Link>
        </div>
      </div>
    </div>
  );
}
