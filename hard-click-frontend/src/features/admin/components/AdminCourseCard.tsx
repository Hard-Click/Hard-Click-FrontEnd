'use client';

import { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import DoubleBtnModal from '@/components/ui/doubleButtonModal';
import type {
  AdminCourseManageRow,
  AdminCourseStatus,
} from '@/mocks/admin.mock';

const STATUS_LABEL: Record<Exclude<AdminCourseStatus, 'DELETED'>, string> = {
  PUBLISHED: '공개',
  HIDDEN: '비공개',
};

const STATUS_STYLE: Record<Exclude<AdminCourseStatus, 'DELETED'>, string> = {
  PUBLISHED: 'bg-[#DCFCE7] text-[#16A34A]',
  HIDDEN: 'bg-[#FFF7ED] text-[#F97316]',
};

interface Props {
  course: AdminCourseManageRow;
  onStatusChange: (id: number, next: AdminCourseStatus) => void;
  onDelete: (id: number) => void;
}

export default function AdminCourseCard({
  course,
  onStatusChange,
  onDelete,
}: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleToggle = () => {
    const next: AdminCourseStatus =
      course.status === 'PUBLISHED' ? 'HIDDEN' : 'PUBLISHED';
    onStatusChange(course.id, next);
    toast.success(
      next === 'PUBLISHED'
        ? '강의가 공개되었습니다.'
        : '강의가 비공개되었습니다.'
    );
  };

  const handleDelete = () => {
    onDelete(course.id);
    setConfirmDelete(false);
    toast.success('강의가 삭제되었습니다.');
  };

  return (
    <>
      <div className="flex items-center gap-5 rounded-2xl border border-[#E2E8F0] bg-white px-6 py-5">
        <div className="h-[72px] w-[120px] flex-shrink-0 rounded-xl bg-[#E2E8F0]" />

        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-xs font-semibold text-[#2F5DAA]">
              {course.subject}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                STATUS_STYLE[
                  course.status as Exclude<AdminCourseStatus, 'DELETED'>
                ]
              }`}
            >
              {
                STATUS_LABEL[
                  course.status as Exclude<AdminCourseStatus, 'DELETED'>
                ]
              }
            </span>
          </div>
          <p className="text-base font-semibold text-[#1E293B]">
            {course.title}
          </p>
          <p className="text-sm text-[#64748B]">
            <span>강사: {course.instructor}</span>
            <span className="mx-2 text-[#CBD5E1]">|</span>
            <span>수강생 {course.studentCount}명</span>
            <span className="mx-2 text-[#CBD5E1]">|</span>
            <span className="inline-flex items-center gap-1">
              <Image
                src="/icons/AdminStar.svg"
                alt="별점"
                width={14}
                height={14}
              />
              {course.rating} ({course.reviewCount})
            </span>
            <span className="mx-2 text-[#CBD5E1]">|</span>
            <span>등록일: {course.createdAt}</span>
          </p>
          <div className="mt-1 flex items-center gap-2">
            <button
              type="button"
              className="flex h-8 items-center gap-1 rounded-full border border-[#E2E8F0] px-4 text-xs font-semibold text-[#475569] hover:bg-[#F8FAFC]"
            >
              <Image
                src="/icons/editIcon.svg"
                alt="수정"
                width={14}
                height={14}
              />
              수정
            </button>
            <button
              type="button"
              onClick={handleToggle}
              className={`flex h-8 items-center gap-1 rounded-full border px-4 text-xs font-semibold transition ${
                course.status === 'PUBLISHED'
                  ? 'border-[#FCA5A5] text-[#EF4444] hover:bg-[#FEF2F2]'
                  : 'border-[#86EFAC] text-[#16A34A] hover:bg-[#F0FDF4]'
              }`}
            >
              <Image
                src={
                  course.status === 'PUBLISHED'
                    ? '/icons/closeEye.svg'
                    : '/icons/openEye.svg'
                }
                alt={course.status === 'PUBLISHED' ? '비공개' : '공개'}
                width={14}
                height={14}
              />
              {course.status === 'PUBLISHED' ? '비공개' : '공개'}
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="flex h-8 items-center gap-1 rounded-full border border-[#FCA5A5] px-4 text-xs font-semibold text-[#EF4444] hover:bg-[#FEF2F2]"
            >
              <Image
                src="/icons/trashIcon.svg"
                alt="삭제"
                width={14}
                height={14}
              />
              삭제
            </button>
          </div>
        </div>

        <div className="flex-shrink-0 text-right">
          <p
            className={`text-xl font-bold ${
              course.isFree ? 'text-[#16A34A]' : 'text-[#2F5DAA]'
            }`}
          >
            {course.isFree ? '무료' : `${course.price.toLocaleString()}원`}
          </p>
        </div>
      </div>

      {confirmDelete && (
        <DoubleBtnModal
          title="강의 삭제"
          description="강의를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
          leftText="취소"
          rightText="삭제"
          onLeftClick={() => setConfirmDelete(false)}
          onRightClick={handleDelete}
        />
      )}
    </>
  );
}
