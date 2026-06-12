import Image from 'next/image';
import FieldError from './FieldError';
import type { QuizQuestionInput } from '../types';

/** 문제 1개의 필드별 에러 */
export interface QuestionErrors {
  content: string;
  options: string[]; // 길이 4
  answer: string;
  explanation: string;
}

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

      {/* 문제 (내용 길어지면 자동으로 늘어남) */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-[#1F2937]">
          문제
        </label>
        <textarea
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
        <label className="mb-2 block text-sm font-semibold text-[#1F2937]">
          해설
        </label>
        <textarea
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
