'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { toast } from '@/lib/toast';
import ConfirmModal from '@/components/ui/confirmModal';
import SelectDropdown from '@/components/ui/SelectDropdown';
import QuizListItem from './QuizListItem';
import QuizEmptyState from './QuizEmptyState';
import LoadingModal from '@/components/ui/loadingModal';
import { deleteQuizAction, getInstructorQuizDetailAction } from '../actions';
import type { Quiz, QuizFormPayload } from '../types';
import type { QuizActionState } from '../actions';

// 등록/수정 폼 모달(505줄+문항 필드)은 버튼 클릭 전엔 필요 없음 → 코드 스플리팅으로
// 강사 퀴즈 목록 라우트 초기 청크에서 분리. 조건부 렌더라 지연 로드 안전.
// loading:()=>null — Suspense 경계를 로컬에 가둬 청크 로드 중 라우트 로딩 스켈레톤 번쩍임 방지.
const QuizFormModal = dynamic(() => import('./QuizFormModal'), {
  loading: () => null,
});

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
  detailAction = getInstructorQuizDetailAction,
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
  detailAction?: (quizId: number) => Promise<Quiz | null>;
  createAction?: (payload: QuizFormPayload) => Promise<QuizActionState>;
  updateAction?: (quizId: number, payload: QuizFormPayload) => Promise<QuizActionState>;
}) {
  const [quizzes, setQuizzes] = useState<Quiz[]>(initialQuizzes);
  const [selectedWeek, setSelectedWeek] = useState<'all' | number>('all');
  // initialQuizzes(서버 재조회분)가 바뀌면 로컬 목록 동기화 — 렌더 중 조정(effect 내 setState 회피).
  const [syncedFrom, setSyncedFrom] = useState(initialQuizzes);
  if (syncedFrom !== initialQuizzes) {
    setSyncedFrom(initialQuizzes);
    setQuizzes(initialQuizzes);
  }
  const [deleting, setDeleting] = useState<Quiz | null>(null);
  const [editing, setEditing] = useState<Quiz | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const router = useRouter();

  // 수정 클릭 → 상세(문항 포함) 조회 후 모달 오픈. 목록 응답엔 문항이 없어 이 단계가 필수.
  const handleEdit = async (quiz: Quiz) => {
    setEditLoading(true);
    const full = await detailAction(quiz.quizId);
    setEditLoading(false);
    setEditing(full ?? quiz); // 조회 실패 시 목록 데이터로라도 연다(문항은 비어있음)
  };

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
          className="w-[200px] max-w-full"
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
                onEdit={() => handleEdit(quiz)}
                onDelete={() => setDeleting(quiz)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 수정 진입 — 상세(문항) 로딩 */}
      {editLoading && (
        <LoadingModal
          title="퀴즈 정보를 불러오는 중"
          description="잠시만 기다려주세요."
        />
      )}

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
