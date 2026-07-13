import Image from 'next/image';
import FieldError from './FieldError';
import type { QuizQuestionInput } from '../types';

/** 문제 1개의 필드별 에러 */
export interface QuestionErrors {
  content: string;
  options: string[]; // 길이 4
  answer: string;
  explanation: string;
  difficulty: string;
}

/** 난이도 선택지 — BE 값(1=하/2=중/3=상). 표시는 상→하 순(팀 "문제 위에 상중하 표시"). */
const DIFFICULTY_OPTIONS: { value: number; label: string }[] = [
  { value: 3, label: '상' },
  { value: 2, label: '중' },
  { value: 1, label: '하' },
];

/**
 * 등록/수정 폼의 문제 1개 (문제·보기4·정답·해설).
 * 표시·입력용. 상태는 부모(QuizFormModal)가 들고 props로 내려줌. (client 부모 아래라 directive 불필요)
 */
export default function QuizQuestionFields({
  index,
  question,
  errors,
  canRemove,
  onChange,
  onRemove,
}: {
  index: number;
  question: QuizQuestionInput;
  errors?: QuestionErrors;
  canRemove: boolean;
  onChange: (q: QuizQuestionInput) => void;
  onRemove: () => void;
}) {
  const update = (patch: Partial<QuizQuestionInput>) =>
    onChange({ ...question, ...patch });

  return (
    <div className="rounded-[20px] border border-[#E2E8F0] bg-[#F8FAFC] p-6">
      {/* 문제 N + 삭제 */}
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-base font-semibold text-[#1F2937]">
          문제 {index + 1}
        </h4>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="flex items-center gap-1 text-sm font-medium text-[#B91C1C] transition hover:opacity-80"
          >
            <Image src="/icons/trashIcon.svg" alt="" width={14} height={14} />
            삭제
          </button>
        )}
      </div>

      {/* 난이도 (필수, 문제 위) — 정답 선택과 동일한 세그먼트 버튼(선택=브랜드 블루) */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-semibold text-[#1F2937]">
          난이도
        </label>
        <div className="grid grid-cols-3 gap-2">
          {DIFFICULTY_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => update({ difficulty: value })}
              aria-pressed={question.difficulty === value}
              aria-label={`난이도: ${label}`}
              className={`h-10 rounded-[10px] border text-base font-semibold transition ${
                question.difficulty === value
                  ? 'border-[#2F5DAA] bg-[#2F5DAA] text-white'
                  : 'border-[#E2E8F0] bg-white text-[#4B5563] hover:bg-[#F1F5F9]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <FieldError message={errors?.difficulty} />
      </div>

      {/* 문제 (내용 길어지면 자동으로 늘어남) */}
      <div>
        <label
          htmlFor={`q${index}-content`}
          className="mb-2 block text-sm font-semibold text-[#1F2937]"
        >
          문제
        </label>
        <textarea
          id={`q${index}-content`}
          value={question.content}
          rows={1}
          onChange={(e) => update({ content: e.target.value })}
          placeholder="문제를 입력하세요"
          className={`field-sizing-content min-h-12 w-full resize-none rounded-[10px] border bg-white px-4 py-3 text-base outline-none transition ${
            errors?.content
              ? 'border-[#B91C1C]'
              : 'border-[#E2E8F0] focus:border-[#2F5DAA]'
          }`}
        />
        <FieldError message={errors?.content} />
      </div>

      {/* 보기 4개 (2x2) */}
      <div className="mt-2">
        <label className="mb-2 block text-sm font-semibold text-[#1F2937]">
          보기
        </label>
        <div className="grid grid-cols-2 gap-x-3">
          {question.options.map((opt, i) => (
            <div key={i}>
              <div
                className={`flex h-12 items-center rounded-[10px] border bg-white px-4 transition ${
                  errors?.options?.[i]
                    ? 'border-[#B91C1C]'
                    : 'border-[#E2E8F0] focus-within:border-[#2F5DAA]'
                }`}
              >
                <span className="mr-2 shrink-0 text-base font-semibold text-[#9CA3AF]">
                  {i + 1}.
                </span>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => {
                    const next = [...question.options];
                    next[i] = e.target.value;
                    update({ options: next });
                  }}
                  placeholder={`보기 ${i + 1}`}
                  aria-label={`보기 ${i + 1}`}
                  className="w-full bg-transparent text-base outline-none"
                />
              </div>
              <FieldError message={errors?.options?.[i]} />
            </div>
          ))}
        </div>
      </div>

      {/* 정답 선택 (선택 시 초록) */}
      <div className="mt-2">
        <label className="mb-2 block text-sm font-semibold text-[#1F2937]">
          정답
        </label>
        <div className="grid grid-cols-4 gap-2">
          {question.options.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => update({ answerIndex: i })}
              aria-pressed={question.answerIndex === i}
              aria-label={`정답: 보기 ${i + 1}`}
              className={`h-10 rounded-[10px] border text-base font-semibold transition ${
                question.answerIndex === i
                  ? 'border-[#16A34A] bg-[#16A34A] text-white'
                  : 'border-[#E2E8F0] bg-white text-[#4B5563] hover:bg-[#F1F5F9]'
              }`}
            >
              보기 {i + 1}
            </button>
          ))}
        </div>
        <FieldError message={errors?.answer} />
      </div>

      {/* 해설 (필수) */}
      <div className="mt-2">
        <label
          htmlFor={`q${index}-explanation`}
          className="mb-2 block text-sm font-semibold text-[#1F2937]"
        >
          해설
        </label>
        <textarea
          id={`q${index}-explanation`}
          value={question.explanation}
          onChange={(e) => update({ explanation: e.target.value })}
          placeholder="해설을 입력하세요"
          className={`h-24 w-full resize-none rounded-[10px] border bg-white px-4 py-3 text-base outline-none transition ${
            errors?.explanation
              ? 'border-[#B91C1C]'
              : 'border-[#E2E8F0] focus:border-[#2F5DAA]'
          }`}
        />
        <FieldError message={errors?.explanation} />
      </div>
    </div>
  );
}
