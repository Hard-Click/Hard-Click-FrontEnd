'use client';

interface MyCourseCardProps {
  highlighted?: boolean;
  id: number;
  category: string;
  title: string;
  isPublic: boolean;
  students: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  price: string;
  thumbnailUrl?: string;
  onDeleted?: (id: number) => void;
  /** 목록 첫 카드(above-fold)면 true — LCP 썸네일 우선 로딩 */
  priority?: boolean;
}

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import DoubleBtnModal from '@/components/ui/doubleButtonModal';
import LoadingModal from '@/components/ui/loadingModal';
import { deleteCourse, publishCourse } from '../services';

export default function MyCourseCard({
  id,
  category,
  title,
  isPublic,
  students,
  rating,
  reviewCount,
  createdAt,
  price,
  thumbnailUrl,
  highlighted = false,
  onDeleted,
  priority = false,
}: MyCourseCardProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [publicState, setPublicState] = useState(isPublic);
  const [isDeleted, setIsDeleted] = useState(false);

  const handleDelete = async () => {
    setIsDeleteOpen(false);
    setIsLoading(true);

    try {
      // DELETE /api/courses/{courseId}
      const result = await deleteCourse(id);

      if (!result.success) {
        setIsLoading(false);
        toast.error('강의 삭제에 실패했습니다.');
        return;
      }

      setIsLoading(false);
      setIsDeleted(true);
      onDeleted?.(id);
      toast.success('강의 삭제가 완료되었습니다.', { duration: 2000 });
    } catch (error) {
      setIsLoading(false);
      console.error(error);
    }
  };

  const handleTogglePublic = async () => {
    const newPublicState = !publicState;
    const result = await publishCourse(id, newPublicState);
  
    if (!result.success) {
      toast.error('상태 변경에 실패했습니다.');
      return;
    }
  
    setPublicState(newPublicState);
    toast.success(
      newPublicState ? '강의가 공개되었습니다.' : '강의가 비공개되었습니다.',
      { duration: 2000 },
    );
    router.refresh(); // 추가
  };

  if (isDeleted) return null;

  return (
    <div
      className={`flex items-start justify-between rounded-2xl border bg-white p-6 shadow-sm transition-all ${
        highlighted
          ? 'border-[#2F5DAA] ring-2 ring-[#2F5DAA]/30'
          : 'border-[#E2E8F0]'
      }`}
    >
      {/* left */}
      <div className="flex gap-5">
        {/* thumbnail — 고정 160×120 박스. h/w 명시 + self-start로 flex stretch(세로 늘어남) 방지 */}
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={title}
            width={160}
            height={120}
            priority={priority}
            className="h-[120px] w-[160px] shrink-0 self-start rounded-2xl object-cover"
          />
        ) : (
          <div className="flex h-[120px] w-[160px] shrink-0 self-start items-center justify-center rounded-2xl bg-gradient-to-br from-[#EEF2FF] to-[#E2E8F0] text-xs text-[#94A3B8]">
            이미지 없음
          </div>
        )}

        {/* content */}
        <div>
          {/* badges */}
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-full bg-[#EEF2FF] px-3 py-1 text-xs font-semibold text-[#2F5DAA]">
              {category}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                publicState
                  ? 'bg-[#EAF7EE] text-[#16A34A]'
                  : 'bg-[#FFF4E5] text-[#F97316]'
              }`}
            >
              {publicState ? '공개' : '비공개'}
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
              {reviewCount > 0 ? (
                <>
                  <Image src="/icons/star.svg" alt="star" width={14} height={14} />

                  <p>
                    {rating} ({reviewCount})
                  </p>
                </>
              ) : (
                <p className="text-[#64748B]">평점 없음</p>
              )}
            </div>

            <p>등록일: {createdAt}</p>
          </div>

          {/* buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/instructor/courses/${id}/edit`)}
              type="button"
              className="rounded-xl border border-[#CBD5E1] px-4 py-2 text-sm font-medium text-[#334155] transition hover:bg-[#F8FAFC]"
            >
              수정
            </button>

            <button
              type="button"
              onClick={handleTogglePublic}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                publicState
                  ? 'border border-[#F97316] bg-[#FFF7ED] text-[#F97316]'
                  : 'border border-[#16A34A] bg-[#F0FDF4] text-[#16A34A]'
              }`}
            >
              {publicState ? '비공개' : '공개'}
            </button>

            <button
              onClick={() => setIsDeleteOpen(true)}
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

      {isDeleteOpen && (
        <DoubleBtnModal
          title="강의 삭제"
          description="정말 강의를 삭제하시겠습니까?"
          leftText="취소"
          rightText="삭제"
          onLeftClick={() => setIsDeleteOpen(false)}
          onRightClick={handleDelete}
        />
      )}

      {isLoading && (
        <LoadingModal
          title="강의를 삭제하고 있습니다"
          description="잠시만 기다려주세요."
        />
      )}
    </div>
  );
}
