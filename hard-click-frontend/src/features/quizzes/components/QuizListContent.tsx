'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ui/confirmModal';
import SelectDropdown from '@/components/ui/SelectDropdown';
import QuizListItem from './QuizListItem';
import QuizEmptyState from './QuizEmptyState';
import QuizFormModal from './QuizFormModal';
import { deleteQuizAction } from '../actions';
import type { Quiz, QuizFormPayload } from '../types';
import type { QuizActionState } from '../actions';

/**
 * 강의별 퀴즈 목록 — 상호작용(주차 필터·삭제) 담당 client 컴포넌트.
 * 데이터는 page(Server)에서 props로 받음. 강의명도 하드코딩 X → courseName prop.
 */
export default function QuizListContent({
  quizzes: initialQuizzes,
  courseId,
  courseName,
  courses,
  takenWeeksByCourse,
  basePath = '/instructor/quizzes',
  withInstructorSelect = false,
  deleteAction = deleteQuizAction,
  createAction,
  updateAction,
}: {
  quizzes: Quiz[];
  courseId: number;
  courseName: string;
  courses: { courseId: number; title: string; instructor?: string }[];
  takenWeeksByCourse: Record<number, number[]>;
  basePath?: string;
  withInstructorSelect?: boolean;
  deleteAction?: (quizId: number, courseId: number) => Promise<QuizActionState>;
  createAction?: (payload: QuizFormPayload) => Promise<QuizActionState>;
  updateAction?: (quizId: number, payload: QuizFormPayload) => Promise<QuizActionState>;
}) {
  const [quizzes, setQuizzes] = useState<Quiz[]>(initialQuizzes);
  const [selectedWeek, setSelectedWeek] = useState<'all' | number>('all');

  useEffect(() => {
    setQuizzes(initialQuizzes);
  }, [initialQuizzes]);
  const [deleting, setDeleting] = useState<Quiz | null>(null);
  const [editing, setEditing] = useState<Quiz | null>(null);
  const router = useRouter();

  // 주차는 동적 — 실제 퀴즈에 존재하는 주차만 옵션으로
  const weeks = [...new Set(quizzes.map((q) => q.week))].sort((a, b) => a - b);
  const weekOptions = [
    { label: '전체 주차', value: 'all' },
    ...weeks.map((w) => ({ label: `${w}주`, value: String(w) })),
  ];
  const filtered =
    selectedWeek === 'all'
      ? quizzes
      : quizzes.filter((q) => q.week === selectedWeek);

  const handleDelete = async () => {
    if (!deleting) return;
    const res = await deleteAction(deleting.quizId, courseId);
    if (res.success) {
      setQuizzes((prev) => prev.filter((q) => q.quizId !== deleting.quizId));
      toast.success(res.message ?? '삭제되었습니다.');
    } else {
      toast.error(res.message ?? '삭제에 실패했습니다.');
    }
    setDeleting(null);
  };

  return (
    <>
      {/* 주차 선택 */}
      <div className="mt-6">
        <p className="mb-2 block text-sm font-semibold text-[#1F2937]">
          주차 선택
        </p>
        <SelectDropdown
          placeholder="전체 주차"
          value={selectedWeek === 'all' ? 'all' : String(selectedWeek)}
          options={weekOptions}
          onChange={(val) =>
            setSelectedWeek(val === 'all' ? 'all' : Number(val))
          }
          fullWidth
          className="w-[499px] max-w-full"
        />
      </div>

      {/* 강의명 + 퀴즈 목록 */}
      <section className="mt-6 rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-[0_4px_10px_rgba(0,0,0,0.06)]">
        <h2 className="mb-6 text-xl font-bold text-[#1F2937]">{courseName}</h2>

        {filtered.length === 0 ? (
          <QuizEmptyState
            message={
              quizzes.length === 0
                ? '등록된 퀴즈가 없습니다'
                : '해당 주차에 등록된 퀴즈가 없습니다'
            }
          />
        ) : (
          <div className="space-y-4">
            {filtered.map((quiz) => (
              <QuizListItem
                key={quiz.quizId}
                quiz={quiz}
                onView={() =>
                  router.push(`${basePath}/${courseId}/${quiz.quizId}`)
                }
                onEdit={() => setEditing(quiz)}
                onDelete={() => setDeleting(quiz)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 삭제 확인 — 공용 모달 재사용 */}
      {deleting && (
        <ConfirmModal
          title="퀴즈를 삭제하시겠습니까?"
          description={
            '삭제된 퀴즈는 복구할 수 없습니다.\n학생들의 응시 기록도 함께 삭제됩니다.'
          }
          cancelText="취소"
          confirmText="삭제"
          confirmVariant="danger"
          onCancel={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      )}

      {/* 수정 — 등록 모달 재사용 (기존 값 채움) */}
      {editing && (
        <QuizFormModal
          mode="edit"
          courses={courses}
          takenWeeksByCourse={takenWeeksByCourse}
          initialData={editing}
          withInstructorSelect={withInstructorSelect}
          onClose={() => setEditing(null)}
          {...(createAction ? { createAction } : {})}
          {...(updateAction ? { updateAction } : {})}
        />
      )}
    </>
  );
}
