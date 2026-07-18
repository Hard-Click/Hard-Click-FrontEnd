'use client';

import { useState, useMemo, useEffect, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from '@/lib/toast';
import SelectDropdown from '@/components/ui/SelectDropdown';
import ConfirmModal from '@/components/ui/confirmModal';
import LoadingModal from '@/components/ui/loadingModal';
import QuizQuestionFields, { type QuestionErrors } from './QuizQuestionFields';
import FieldError from './FieldError';
import {
  createQuizAction,
  updateQuizAction,
  getQuizFormMetaAction,
  getAdminQuizFormMetaAction,
} from '../actions';
import type { Quiz, QuizQuestionInput, QuizFormPayload } from '../types';

interface FormErrors {
  title: string;
  course: string;
  week: string;
  questions: QuestionErrors[];
}

const blankQuestion = (): QuizQuestionInput => ({
  content: '',
  options: ['', '', '', ''],
  answerIndex: -1,
  explanation: '',
  difficulty: 0, // 미선택 — 필수라 저장 전 선택 필요
});

/**
 * 퀴즈 등록/수정 모달 (등록·수정 겸용 — mode + initialData).
 * 데이터는 props로 받고, 검증은 회원가입/강의등록과 동일 형식(FieldError),
 * 제출은 Server Action(create/update)으로. 상호작용 leaf라 'use client'.
 */
export default function QuizFormModal({
  mode,
  courses,
  takenWeeksByCourse,
  initialData,
  presetCourseId,
  withInstructorSelect = false,
  adminMeta = withInstructorSelect,
  onClose,
  onSuccess,
  createAction = createQuizAction,
  updateAction = updateQuizAction,
}: {
  courses: { courseId: number; title: string; instructor?: string }[];
  takenWeeksByCourse: Record<number, number[]>;
  withInstructorSelect?: boolean;
  // 관리자 컨텍스트: takenWeeks를 소유자무관 관리자 목록에서 로드할지 여부.
  // 강사선택 UI(withInstructorSelect)와 분리 — 개별 강의 페이지는 강의가 고정(presetCourseId)이라
  // 강사선택은 필요 없지만 관리자 메타 라우팅은 필요하다. 미지정 시 withInstructorSelect를 따른다.
  adminMeta?: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  createAction?: (payload: QuizFormPayload) => Promise<{ success: boolean; message?: string }>;
  updateAction?: (quizId: number, payload: QuizFormPayload) => Promise<{ success: boolean; message?: string }>;
} & (
  | { mode: 'create'; initialData?: undefined; presetCourseId?: number }
  | { mode: 'edit'; initialData: Quiz; presetCourseId?: undefined }
)) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [courseId, setCourseId] = useState<number>(
    initialData?.courseId ?? presetCourseId ?? 0
  );
  const [instructor, setInstructor] = useState<string>(
    () =>
      courses.find(
        (c) => c.courseId === (initialData?.courseId ?? presetCourseId)
      )?.instructor ?? ''
  );
  const [week, setWeek] = useState<number>(initialData?.week ?? 0);
  // ②③ 등록: 강의의 실제 섹션(주차) + 이미 퀴즈 있는 주차 — 강의 선택 시 서버에서 로드.
  // meta.courseId로 "현재 선택 강의 기준 로드 완료"를 파생 판별(별도 loading state 없이 → effect 내 동기 setState 회피).
  const [meta, setMeta] = useState<{
    courseId: number;
    weeks: number[];
    takenWeeks: number[];
  }>(() => ({
    courseId: 0,
    weeks: [],
    takenWeeks: takenWeeksByCourse[courseId] ?? [],
  }));
  const [questions, setQuestions] = useState<QuizQuestionInput[]>(
    initialData
      ? initialData.questions.map((q) => ({
          content: q.content,
          options: q.options,
          answerIndex: q.answerIndex,
          explanation: q.explanation ?? '',
          difficulty: q.difficulty ?? 0, // BE 상세가 difficulty 제공 → 수정 시 프리필
        }))
      : [blankQuestion()]
  );
  const [submitted, setSubmitted] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingQuestionIdx, setDeletingQuestionIdx] = useState<number | null>(
    null
  );

  const instructorOptions = useMemo(
    () =>
      Array.from(
        new Set(
          courses
            .map((c) => c.instructor)
            .filter((name): name is string => Boolean(name))
        )
      ).map((name) => ({ label: name, value: name })),
    [courses]
  );

  const visibleCourses = useMemo(
    () =>
      withInstructorSelect && instructor
        ? courses.filter((c) => c.instructor === instructor)
        : courses,
    [courses, withInstructorSelect, instructor]
  );
  const courseOptions = useMemo(
    () =>
      visibleCourses.map((c) => ({
        label: c.title,
        value: String(c.courseId),
      })),
    [visibleCourses]
  );
  const metaReqRef = useRef(0);
  const [isMetaPending, startMetaTransition] = useTransition();
  // 강의 선택 시 실제 섹션(주차)·이미 쓴 주차를 서버에서 로드. useEffect 반응형 페칭(렌더 워터폴) 대신
  // 이벤트 핸들러('연결 강의' onChange)에서 useTransition으로 호출(§4). transition엔 cleanup 취소가
  // 없어, 취소 안전성은 metaReqRef로 stale 응답 무시로 대체(빠른 강의 전환 시 옛 응답이 새 선택을 덮지 않게).
  const loadMeta = (cid: number) => {
    if (mode !== 'create' || cid <= 0) return;
    const reqId = ++metaReqRef.current;
    // 관리자(adminMeta)는 소유자무관 관리자 목록으로 takenWeeks 집계 —
    //   강사 엔드포인트(/api/instructor/quizzes)는 로그인 관리자 소유 퀴즈만 반환(0개)이라 1주1퀴즈 중복차단이 안 됨.
    const metaAction = adminMeta
      ? getAdminQuizFormMetaAction
      : getQuizFormMetaAction;
    startMetaTransition(async () => {
      try {
        const m = await metaAction(cid);
        if (metaReqRef.current === reqId) setMeta({ courseId: cid, ...m });
      } catch {
        // 실패를 빈 주차로 폴백하면 '등록 가능한 주차가 없습니다'로 오표시돼(§0.1),
        // 조용히 삼키지 않고 사용자에게 알린다. 주차 드롭다운은 로딩 상태로 남아 오등록을 막는다.
        if (metaReqRef.current === reqId)
          toast.error('주차 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
      }
    });
  };
  // presetCourseId(개별 강의 페이지, 강의 고정)만 마운트 시 1회 로드 — 반응형 useEffect 페칭 제거.
  //   사용자가 강의를 고르는 경우는 '연결 강의' onChange에서 loadMeta가 처리한다.
  useEffect(() => {
    if (presetCourseId) loadMeta(presetCourseId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // 로딩 = 선택 강의 기준 meta 페칭 중이거나 아직 안 옴 (isPending 통합).
  const metaLoading =
    mode === 'create' &&
    courseId > 0 &&
    (isMetaPending || meta.courseId !== courseId);

  // 등록: 강의 실제 섹션 주차 중 아직 퀴즈 없는 것 / 수정: 자기 주차 고정(변경 불가)
  const weekOptions =
    mode === 'edit' && initialData
      ? [{ label: `${initialData.week}주`, value: String(initialData.week) }]
      : meta.weeks
          .filter((w) => !meta.takenWeeks.includes(w))
          .map((w) => ({ label: `${w}주`, value: String(w) }));
  // 강의 선택했는데 등록 가능한 주차(섹션)가 없으면 안내
  const noWeeksAvailable =
    mode === 'create' &&
    courseId > 0 &&
    !metaLoading &&
    weekOptions.length === 0;

  const isFormValid =
    title.trim() !== '' &&
    courseId > 0 &&
    week > 0 &&
    questions.every(
      (q) =>
        q.content.trim() !== '' &&
        q.options.every((o) => o.trim() !== '') &&
        q.answerIndex >= 0 &&
        q.difficulty >= 1 &&
        q.difficulty <= 3 &&
        q.explanation.trim() !== ''
    );

  const updateQuestion = (idx: number, q: QuizQuestionInput) =>
    setQuestions((prev) => prev.map((item, i) => (i === idx ? q : item)));
  const addQuestion = () => setQuestions((prev) => [...prev, blankQuestion()]);
  const removeQuestion = (idx: number) =>
    setQuestions((prev) => prev.filter((_, i) => i !== idx));

  const validate = (): FormErrors => ({
    title: title.trim() ? '' : '퀴즈 제목을 입력해주세요',
    course: courseId > 0 ? '' : '연결 강의를 선택해주세요',
    week: week > 0 ? '' : '연결 주차를 선택해주세요',
    questions: questions.map((q) => ({
      content: q.content.trim() ? '' : '문제를 입력해주세요',
      options: q.options.map((o) => (o.trim() ? '' : '보기를 입력해주세요')),
      answer: q.answerIndex >= 0 ? '' : '정답을 선택해주세요',
      explanation: q.explanation.trim() ? '' : '해설을 입력해주세요',
      difficulty:
        q.difficulty >= 1 && q.difficulty <= 3 ? '' : '난이도를 선택해주세요',
    })),
  });

  // 제출 후엔 렌더마다 파생 — 입력을 채우면 그 칸 에러가 자동으로 사라짐 (state/effect 불필요)
  const errors = submitted ? validate() : null;

  // 첫 에러 필드 id (DOM 순서) — 가장 위 에러로 스크롤하기 위함
  const findFirstErrorId = (): string | null => {
    if (!title.trim()) return 'quiz-field-title';
    if (courseId <= 0) return 'quiz-field-course';
    if (week <= 0) return 'quiz-field-week';
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (
        !q.content.trim() ||
        q.options.some((o) => !o.trim()) ||
        q.answerIndex < 0 ||
        q.difficulty < 1 ||
        q.difficulty > 3 ||
        !q.explanation.trim()
      ) {
        return `quiz-field-q${i}`;
      }
    }
    return null;
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const firstErrorId = findFirstErrorId();
    if (firstErrorId) {
      document
        .getElementById(firstErrorId)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setIsConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setIsConfirmOpen(false);
    // edit인데 initialData 없으면 create로 새지 않게 차단
    if (mode === 'edit' && !initialData) {
      toast.error('수정할 퀴즈 정보가 없습니다.');
      return;
    }
    setIsLoading(true);
    try {
      const payload: QuizFormPayload = { title, courseId, week, questions };
      const res =
        mode === 'edit' && initialData
          ? await updateAction(initialData.quizId, payload)
          : await createAction(payload);
      if (res.success) {
        toast.success(res.message ?? '저장되었습니다.');
        onSuccess?.();
        onClose();
        router.refresh();
      } else {
        toast.error(res.message ?? '저장에 실패했습니다.');
      }
    } catch {
      // 액션이 인프라 레벨에서 reject되어도 사용자 피드백 보장
      toast.error('저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 모달 겹침 방지 — 로딩/확인 모달이 뜨면 폼 대신 그것만 렌더(뒤 폼 숨김).
  // 확인에서 취소하면 상태가 false로 돌아가 폼이 다시 렌더됨 (state는 유지).
  if (isLoading) {
    return (
      <LoadingModal
        title={
          mode === 'edit'
            ? '퀴즈를 수정하고 있습니다'
            : '퀴즈를 등록하고 있습니다'
        }
        description="잠시만 기다려주세요."
      />
    );
  }
  if (isConfirmOpen) {
    return (
      <ConfirmModal
        icon="/icons/checkCircleIcon.svg"
        iconBgColor="rgba(22, 163, 74, 0.1)"
        title={mode === 'edit' ? '퀴즈 수정' : '퀴즈 등록'}
        description={
          mode === 'edit'
            ? '해당 퀴즈를 수정하시겠습니까?'
            : '해당 퀴즈를 등록하시겠습니까?'
        }
        cancelText="취소"
        confirmText="확인"
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirm}
      />
    );
  }
  if (cancelConfirmOpen) {
    return (
      <ConfirmModal
        title={mode === 'edit' ? '퀴즈 수정 취소' : '퀴즈 등록 취소'}
        description={
          mode === 'edit'
            ? '정말 퀴즈 수정을 취소하시겠습니까?'
            : '정말 퀴즈 등록을 취소하시겠습니까?'
        }
        cancelText="취소"
        confirmText="확인"
        onCancel={() => setCancelConfirmOpen(false)}
        onConfirm={onClose}
      />
    );
  }
  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quiz-modal-title"
        className="flex max-h-[90vh] w-full max-w-[896px] flex-col rounded-2xl bg-white shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1)]"
      >
        {/* 헤더 */}
        <h2
          id="quiz-modal-title"
          className="shrink-0 px-8 pb-6 pt-8 text-center text-2xl font-bold text-[#1F2937]"
        >
          {mode === 'edit' ? '퀴즈 수정' : '퀴즈 등록'}
        </h2>

        {/* 본문 (스크롤) */}
        <div id="quiz-form-body" className="flex-1 overflow-y-auto px-8">
          {/* 퀴즈 제목 */}
          <div id="quiz-field-title">
            <label
              htmlFor="quiz-title-input"
              className="mb-2 block text-sm font-semibold text-[#1F2937]"
            >
              퀴즈 제목
            </label>
            <input
              id="quiz-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="퀴즈 제목을 입력하세요"
              className={`h-12 w-full rounded-[10px] border px-4 text-base outline-none transition ${
                errors?.title
                  ? 'border-[#B91C1C]'
                  : 'border-[#E2E8F0] focus:border-[#2F5DAA]'
              }`}
            />
            <FieldError message={errors?.title} />
          </div>

          {/* (관리자) 강사 선택 + 연결 강의 + 연결 주차 */}
          <div
            className={`mt-2 grid gap-6 ${
              withInstructorSelect ? 'grid-cols-3' : 'grid-cols-2'
            }`}
          >
            {withInstructorSelect && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#1F2937]">
                  강사 선택
                </label>
                <SelectDropdown
                  placeholder="강사 선택"
                  value={instructor}
                  options={instructorOptions}
                  onChange={(v) => {
                    setInstructor(v);
                    setCourseId(0);
                    setWeek(0);
                    metaReqRef.current++; // 강의 리셋 — 진행 중 메타 로드 무효화
                  }}
                  disabled={mode === 'edit'}
                  fullWidth
                />
              </div>
            )}
            <div id="quiz-field-course">
              <label className="mb-2 block text-sm font-semibold text-[#1F2937]">
                연결 강의
              </label>
              <SelectDropdown
                placeholder="강의 선택"
                value={courseId > 0 ? String(courseId) : ''}
                options={courseOptions}
                onChange={(v) => {
                  const cid = Number(v);
                  setCourseId(cid);
                  setWeek(0); // 강의 바뀌면 주차 다시 선택
                  loadMeta(cid); // 반응형 effect 대신 선택 시점에 메타 로드
                }}
                disabled={mode === 'edit' || presetCourseId !== undefined}
                fullWidth
              />
              <FieldError message={errors?.course} />
            </div>
            <div id="quiz-field-week">
              <label className="mb-2 block text-sm font-semibold text-[#1F2937]">
                연결 주차
              </label>
              <SelectDropdown
                placeholder="주차 선택"
                value={week > 0 ? String(week) : ''}
                options={weekOptions}
                onChange={(v) => setWeek(Number(v))}
                disabled={
                  mode === 'edit' ||
                  courseId === 0 ||
                  noWeeksAvailable ||
                  metaLoading
                }
                fullWidth
              />
              {noWeeksAvailable ? (
                <FieldError message="등록 가능한 주차가 없습니다" />
              ) : (
                <FieldError message={errors?.week} />
              )}
            </div>
          </div>

          {/* 문제 헤더 + 추가 */}
          <div className="mb-4 mt-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#1F2937]">문제</h3>
            <button
              type="button"
              onClick={addQuestion}
              className="flex h-10 items-center gap-1.5 rounded-[10px] bg-[#2F5DAA] px-4 text-base font-semibold text-white transition hover:bg-[#274C8B]"
            >
              <Image src="/icons/plus.svg" alt="" width={16} height={16} />
              문제 추가
            </button>
          </div>

          {/* 문제 리스트 */}
          <div className="space-y-4 pb-2">
            {questions.map((q, i) => (
              <div key={i} id={`quiz-field-q${i}`}>
                <QuizQuestionFields
                  index={i}
                  question={q}
                  errors={errors?.questions[i]}
                  canRemove={questions.length > 1}
                  onChange={(updated) => updateQuestion(i, updated)}
                  onRemove={() => setDeletingQuestionIdx(i)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 푸터 */}
        <div className="flex shrink-0 gap-3 px-8 pb-8 pt-6">
          <button
            type="button"
            onClick={() => setCancelConfirmOpen(true)}
            className="h-12 flex-1 rounded-[10px] border border-[#E2E8F0] text-base font-semibold text-[#4B5563] transition hover:bg-[#F8FAFC]"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-[10px] bg-[#2F5DAA] text-base font-semibold text-white transition ${
              isFormValid ? 'hover:bg-[#274C8B]' : 'opacity-50'
            }`}
          >
            <Image src="/icons/saveIcon.svg" alt="" width={20} height={20} />
            {mode === 'edit' ? '수정 완료' : '등록 완료'}
          </button>
        </div>
      </div>
    </div>
    {/* 문제 삭제 확인 — 폼을 대체하지 않고 그 위에 겹쳐 렌더(ConfirmModal이 뒤 z-50 폼 위에 쌓임) */}
    {deletingQuestionIdx !== null && (
      <ConfirmModal
        icon="/icons/trashIcon.svg"
        iconBgColor="rgba(185, 28, 28, 0.1)"
        title="문제 삭제"
        description="해당 문제를 삭제하시겠습니까?"
        cancelText="취소"
        confirmText="삭제"
        onCancel={() => setDeletingQuestionIdx(null)}
        onConfirm={() => {
          removeQuestion(deletingQuestionIdx);
          setDeletingQuestionIdx(null);
        }}
      />
    )}
    </>
  );
}
