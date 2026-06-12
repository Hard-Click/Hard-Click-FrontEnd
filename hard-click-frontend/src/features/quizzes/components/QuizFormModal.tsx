'use client';

import { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import SelectDropdown from '@/components/ui/SelectDropdown';
import DoubleBtnModal from '@/components/ui/doubleButtonModal';
import LoadingModal from '@/components/ui/loadingModal';
import QuizQuestionFields, { type QuestionErrors } from './QuizQuestionFields';
import FieldError from './FieldError';
import { createQuizAction, updateQuizAction } from '../actions';
import type { Quiz, QuizQuestionInput, QuizFormPayload } from '../types';

const WEEK_COUNT = 12; // mock: 1~12주 (API 연동 시 강의 섹션 기반으로 교체)

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
});

/**
 * 퀴즈 등록/수정 모달 (등록·수정 겸용 — mode + initialData).
 * 데이터는 props로 받고, 검증은 회원가입/강의등록과 동일 형식(FieldError),
 * 제출은 Server Action(create/update)으로. 상호작용 leaf라 'use client'.
 */
export default function QuizFormModal({
  mode,
  courses,
  initialData,
  onClose,
  onSuccess,
}: {
  mode: 'create' | 'edit';
  courses: { courseId: number; title: string }[];
  initialData?: Quiz;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [courseId, setCourseId] = useState<number>(
    initialData?.courseId ?? 0,
  );
  const [week, setWeek] = useState<number>(initialData?.week ?? 0);
  const [questions, setQuestions] = useState<QuizQuestionInput[]>(
    initialData
      ? initialData.questions.map((q) => ({
          content: q.content,
          options: q.options,
          answerIndex: q.answerIndex,
          explanation: q.explanation ?? '',
        }))
      : [blankQuestion()],
  );
  const [submitted, setSubmitted] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const courseOptions = courses.map((c) => ({
    label: c.title,
    value: String(c.courseId),
  }));
  const weekOptions = Array.from({ length: WEEK_COUNT }, (_, i) => ({
    label: `${i + 1}주`,
    value: String(i + 1),
  }));

  const isFormValid =
    title.trim() !== '' &&
    courseId > 0 &&
    week > 0 &&
    questions.every(
      (q) =>
        q.content.trim() !== '' &&
        q.options.every((o) => o.trim() !== '') &&
        q.answerIndex >= 0 &&
        q.explanation.trim() !== '',
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
    setIsLoading(true);
    const payload: QuizFormPayload = { title, courseId, week, questions };
    const res =
      mode === 'edit' && initialData
        ? await updateQuizAction(initialData.quizId, payload)
        : await createQuizAction(payload);
    setIsLoading(false);
    if (res.success) {
      toast.success(res.message ?? '저장되었습니다.');
      onSuccess?.();
      onClose();
    } else {
      toast.error(res.message ?? '저장에 실패했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-[896px] flex-col rounded-2xl bg-white shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1)]">
        {/* 헤더 */}
        <h2 className="shrink-0 px-8 pb-6 pt-8 text-center text-2xl font-bold text-[#1F2937]">
          {mode === 'edit' ? '퀴즈 수정' : '퀴즈 등록'}
        </h2>

        {/* 본문 (스크롤) */}
        <div id="quiz-form-body" className="flex-1 overflow-y-auto px-8">
          {/* 퀴즈 제목 */}
          <div id="quiz-field-title">
            <label className="mb-2 block text-sm font-semibold text-[#1F2937]">
              퀴즈 제목
            </label>
            <input
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

          {/* 연결 강의 + 연결 주차 */}
          <div className="mt-2 grid grid-cols-2 gap-6">
            <div id="quiz-field-course">
              <label className="mb-2 block text-sm font-semibold text-[#1F2937]">
                연결 강의
              </label>
              <SelectDropdown
                placeholder="강의 선택"
                value={courseId > 0 ? String(courseId) : ''}
                options={courseOptions}
                onChange={(v) => setCourseId(Number(v))}
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
                fullWidth
              />
              <FieldError message={errors?.week} />
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
                  onRemove={() => removeQuestion(i)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 푸터 */}
        <div className="flex shrink-0 gap-3 px-8 pb-8 pt-6">
          <button
            type="button"
            onClick={onClose}
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

      {isConfirmOpen && (
        <DoubleBtnModal
          title={mode === 'edit' ? '퀴즈 수정' : '퀴즈 등록'}
          description={
            mode === 'edit'
              ? '이 퀴즈를 수정하시겠습니까?'
              : '이 퀴즈를 등록하시겠습니까?'
          }
          leftText="취소"
          rightText="확인"
          onLeftClick={() => setIsConfirmOpen(false)}
          onRightClick={handleConfirm}
        />
      )}
      {isLoading && (
        <LoadingModal
          title={
            mode === 'edit'
              ? '퀴즈를 수정하고 있습니다'
              : '퀴즈를 등록하고 있습니다'
          }
          description="잠시만 기다려주세요."
        />
      )}
    </div>
  );
}
