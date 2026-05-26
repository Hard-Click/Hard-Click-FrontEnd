interface MyCourseCardProps {
  category: string;
  title: string;
  isPublic: boolean;
  students: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  price: string;
  thumbnailUrl?: string;
}

import Image from 'next/image';

export default function MyCourseCard({
  category,
  title,
  isPublic,
  students,
  rating,
  reviewCount,
  createdAt,
  price,
  thumbnailUrl,
}: MyCourseCardProps) {
  return (
    <div className="flex items-start justify-between rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
      {/* left */}
      <div className="flex gap-5">
        {/* thumbnail */}
        <Image
          src={thumbnailUrl || '/images/defaultThumbnail.svg'}
          alt={title}
          width={160}
          height={120}
          className="rounded-2xl object-cover"
        />

        {/* content */}
        <div>
          {/* badges */}
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-full bg-[#EEF2FF] px-3 py-1 text-xs font-semibold text-[#2F5DAA]">
              {category}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                isPublic
                  ? 'bg-[#EAF7EE] text-[#16A34A]'
                  : 'bg-[#FFF4E5] text-[#F97316]'
              }`}
            >
              {isPublic ? '공개' : '비공개'}
            </span>
          </div>

          {/* title */}
          <h3 className="mb-3 text-2xl font-bold text-[#1E293B]">{title}</h3>

          {/* info */}
          <div className="mb-5 flex items-center gap-3 text-sm text-[#64748B]">
            <div className="flex items-center gap-1">
              <Image src="/icons/users.svg" alt="user" width={14} height={14} />

              <p>수강생 {students}명</p>
            </div>

            <div className="flex items-center gap-1">
              <Image src="/icons/star.svg" alt="star" width={14} height={14} />

              <p>
                {rating} ({reviewCount})
              </p>
            </div>

            <p>등록일: {createdAt}</p>
          </div>

          {/* buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-xl border border-[#CBD5E1] px-4 py-2 text-sm font-medium text-[#334155] transition hover:bg-[#F8FAFC]"
            >
              수정
            </button>

            <button
              type="button"
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                isPublic
                  ? 'border border-[#F97316] bg-[#FFF7ED] text-[#F97316]'
                  : 'border border-[#16A34A] bg-[#F0FDF4] text-[#16A34A]'
              }`}
            >
              {isPublic ? '비공개' : '공개'}
            </button>

            <button
              type="button"
              className="rounded-xl border border-[#DC2626] bg-white px-4 py-2 text-sm font-medium text-[#DC2626] transition hover:bg-[#FEF2F2]"
            >
              삭제
            </button>
          </div>
        </div>
      </div>

      {/* price */}
      <div className="text-right">
        <p className="text-3xl font-bold text-[#2F5DAA]">{price}</p>
      </div>
    </div>
  );
}
