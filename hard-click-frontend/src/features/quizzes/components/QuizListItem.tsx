import Image from 'next/image';
import WeekBadge from './WeekBadge';
import type { Quiz } from '../types';

/**
 * 강의별 퀴즈 목록의 카드 1개 (주차·제목·문제수·등록일 + 조회하기/수정/삭제).
 * 표시용 — 핸들러는 props로 받음. 'use client' 부모(QuizListContent) 아래라 directive 불필요.
 */
export default function QuizListItem({
  quiz,
  onView,
  onEdit,
  onDelete,
}: {
  quiz: Quiz;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-[20px] border border-[#E2E8F0] px-6 py-5">
      {/* 좌: 주차 badge + 정보 */}
      <div className="flex items-center gap-6">
        <WeekBadge week={quiz.week} size="lg" />
        <div>
          <h3 className="text-lg font-bold text-[#1F2937]">{quiz.title}</h3>
          <div className="mt-2 flex items-center gap-4 text-sm text-[#4B5563]">
            <span>총 {quiz.questionCount}문제</span>
            <span>등록일: {quiz.createdDate.replaceAll('-', '.')}</span>
          </div>
        </div>
      </div>

      {/* 우: 조회하기 / 수정 / 삭제 */}
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onView}
          className="flex h-9 items-center gap-1.5 rounded-xl border border-[#E2E8F0] px-6.5 text-sm font-medium text-[#4B5563] transition hover:bg-[#F8FAFC]"
        >
          조회
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="flex h-9 items-center gap-1.5 rounded-xl border border-[#E2E8F0] px-4 text-sm font-medium text-[#4B5563] transition hover:bg-[#F8FAFC]"
        >
          <Image src="/icons/editIcon.svg" alt="" width={16} height={16} />
          수정
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="flex h-9 items-center gap-1.5 rounded-xl border border-[#E2E8F0] px-4 text-sm font-medium text-[#B91C1C] transition hover:bg-[#FEF2F2]"
        >
          <Image src="/icons/trashIcon.svg" alt="" width={16} height={16} />
          삭제
        </button>
      </div>
    </div>
  );
}
