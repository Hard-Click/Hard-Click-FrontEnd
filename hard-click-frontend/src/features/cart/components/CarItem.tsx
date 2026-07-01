import type { CartItem } from '../types';

const CheckIcon = (
  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
// 강의 썸네일 대신 쓰는 학사모(졸업모) 아이콘 — 흰색, 파란 박스 위에 표시
const GradCapIcon = (
  <svg aria-hidden="true" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.42 10.922a1 1 0 0 0 0-1.844L12.83 5.18a2 2 0 0 0-1.66 0L2.58 9.078a1 1 0 0 0 0 1.844l8.59 3.898a2 2 0 0 0 1.66 0z" />
    <path d="M22 10v6" />
    <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
  </svg>
);
const TrashIcon = (
  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

/**
 * 장바구니 항목 1행 — 주문/결제(OrderCourseList)와 동일한 선택 카드 디자인 + 삭제(휴지통).
 * 토글(체크박스~가격)은 한 버튼, 삭제는 별도 버튼(버튼 중첩 방지).
 */
export default function CarItem({
  item,
  selected,
  onToggle,
  onRemove,
}: {
  item: CartItem;
  selected: boolean;
  onToggle: () => void;
  onRemove: () => void;
}) {
  return (
    <li>
      <div
        className={`flex items-center gap-3 sm:gap-4 rounded-2xl border p-4 transition ${
          selected
            ? 'border-[#2F5DAA] bg-[#2F5DAA]/[0.04]'
            : 'border-[#E5E9F0] bg-white hover:border-[#CBD5E1] hover:bg-[#FAFBFC]'
        }`}
      >
        {/* 선택 토글 (체크박스 ~ 가격) */}
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={selected}
          aria-label={`${item.title} 선택`}
          className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4 text-left"
        >
          <span
            className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border-2 transition ${
              selected
                ? 'border-[#2F5DAA] bg-[#2F5DAA]'
                : 'border-[#CBD5E1] bg-white'
            }`}
          >
            {selected && CheckIcon}
          </span>

          {/* 강의 썸네일 대신 학사모 파란 박스 (이미지 미사용 — 구독 상품 박스와 동일 스타일) */}
          <span className="flex h-14 w-14 sm:h-16 sm:w-[88px] flex-shrink-0 items-center justify-center rounded-xl bg-[#2F5DAA]">
            {GradCapIcon}
          </span>

          {/* 정보 + 가격 — 모바일 세로(제목 위·가격 아래), sm+ 가로(가격 우측) */}
          <span className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
            <span className="block min-w-0 flex-1">
              <span className="line-clamp-2 break-words text-base font-semibold text-[#0F172A]">
                {item.title}
              </span>
              <span className="mt-1 block text-sm text-[#64748B]">
                {item.instructor}
              </span>
            </span>
            <span className="flex-shrink-0 text-base font-bold text-[#2F5DAA] sm:text-lg">
              {item.price.toLocaleString()}원
            </span>
          </span>
        </button>

        {/* 삭제 */}
        <button
          type="button"
          onClick={onRemove}
          aria-label={`${item.title} 삭제`}
          className="flex-shrink-0 rounded-lg p-2 transition hover:bg-[#FEF2F2]"
        >
          {TrashIcon}
        </button>
      </div>
    </li>
  );
}
