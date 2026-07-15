'use client';

import { useState } from 'react';
import {
  EXPLORE_SUBJECTS,
  FOREIGN_LANGUAGE_SUBJECTS,
  KOREAN_ELECTIVES,
  MATH_ELECTIVES,
  type SelectedSubjects,
} from '../subjectPools';

interface SubjectOption {
  value: string;
  name: string;
}

function SubjectSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: SubjectOption[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-11 w-full appearance-none rounded-xl border border-[#E2E8F0] bg-white px-4 pr-10 text-sm outline-none focus:border-[#2F5DAA] ${
          value ? 'text-[#1F2937]' : 'text-[#94A3B8]'
        }`}
      >
        <option value="">선택</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.name}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
        width="18"
        height="18"
        viewBox="0 0 20 20"
        fill="none"
      >
        <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function ScoreInput({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: boolean;
}) {
  return (
    <input
      type="number"
      inputMode="numeric"
      min={0}
      max={100}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="원점수"
      className={`h-11 w-full rounded-xl border px-4 text-sm outline-none placeholder:text-[#94A3B8] focus:border-[#2F5DAA] ${
        error ? 'border-[#DC2626]' : 'border-[#E2E8F0]'
      }`}
    />
  );
}

function ScoreRow({
  label,
  subject,
  score,
  onScoreChange,
  error,
}: {
  label: string;
  subject: React.ReactNode;
  score: string;
  onScoreChange: (v: string) => void;
  error?: boolean;
}) {
  return (
    <div className="grid grid-cols-[100px_1fr_140px] items-center gap-4">
      <span className="text-sm font-semibold text-[#1E293B]">{label}</span>
      <div>{subject}</div>
      <div className="flex items-center gap-2">
        <ScoreInput value={score} onChange={onScoreChange} error={error} />
        <span className="text-sm text-[#64748B]">점</span>
      </div>
    </div>
  );
}

/**
 * 최근 모의고사 성적 입력 (client 섬, #855 후속 화면).
 * 수능 응시영역 순서대로 과목 선택 + 원점수 입력.
 * 응시과목 기본값은 이전 단계(스케줄 설정 폼)에서 고른 과목을 그대로 이어받되, 드롭다운으로 바꿀 수 있다.
 * ⚠️ BE 저장 API 없음(2026-07-14 기준) — 제출 시 서버 저장 없이 캘린더로 이동만 한다.
 */
export function ExamScoreForm({
  initialSubjects,
  onSubmit,
}: {
  initialSubjects: SelectedSubjects;
  onSubmit: () => void;
}) {
  const [korean, setKorean] = useState(initialSubjects.korean);
  const [koreanScore, setKoreanScore] = useState('');
  const [math, setMath] = useState(initialSubjects.math);
  const [mathScore, setMathScore] = useState('');
  const [englishScore, setEnglishScore] = useState('');
  const [koreanHistoryScore, setKoreanHistoryScore] = useState('');
  const [explore1, setExplore1] = useState(initialSubjects.explore1);
  const [explore1Score, setExplore1Score] = useState('');
  const [explore2, setExplore2] = useState(initialSubjects.explore2);
  const [explore2Score, setExplore2Score] = useState('');
  const [secondLanguage, setSecondLanguage] = useState(initialSubjects.secondLanguage);
  const [secondLanguageScore, setSecondLanguageScore] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const explore1Options = EXPLORE_SUBJECTS.filter((s) => s.value !== explore2);
  const explore2Options = EXPLORE_SUBJECTS.filter((s) => s.value !== explore1);

  const requiredScores = [
    koreanScore,
    mathScore,
    englishScore,
    koreanHistoryScore,
    explore1Score,
    explore2Score,
    ...(initialSubjects.hasSecondLanguage ? [secondLanguageScore] : []),
  ];
  const hasEmptyScore = requiredScores.some((s) => !s.trim());
  const showError = submitted && hasEmptyScore;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (requiredScores.some((s) => !s.trim())) return;
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-[#E2E8F0] bg-white p-8">
      <h1 className="text-2xl font-bold text-[#1E293B]">최근 모의고사 성적</h1>
      <p className="mt-1 text-sm text-[#64748B]">
        수능 응시영역 순서대로 과목을 선택하고 원점수를 입력하면 AI가 취약 과목 위주로 일정을 짜드려요.
      </p>

      <div className="mt-8 grid grid-cols-[100px_1fr_140px] gap-4 pb-2 text-xs text-[#94A3B8]">
        <span>응시영역</span>
        <span>응시과목</span>
        <span>원점수</span>
      </div>

      <div className="flex flex-col gap-4">
        <ScoreRow
          label="국어"
          subject={<SubjectSelect value={korean} onChange={setKorean} options={KOREAN_ELECTIVES} />}
          score={koreanScore}
          onScoreChange={setKoreanScore}
          error={showError && !koreanScore.trim()}
        />
        <ScoreRow
          label="수학"
          subject={<SubjectSelect value={math} onChange={setMath} options={MATH_ELECTIVES} />}
          score={mathScore}
          onScoreChange={setMathScore}
          error={showError && !mathScore.trim()}
        />
        <ScoreRow
          label="영어"
          subject={<span className="text-sm text-[#94A3B8]">-</span>}
          score={englishScore}
          onScoreChange={setEnglishScore}
          error={showError && !englishScore.trim()}
        />
        <ScoreRow
          label="한국사"
          subject={<span className="text-sm text-[#94A3B8]">-</span>}
          score={koreanHistoryScore}
          onScoreChange={setKoreanHistoryScore}
          error={showError && !koreanHistoryScore.trim()}
        />
        <ScoreRow
          label="탐구1"
          subject={<SubjectSelect value={explore1} onChange={setExplore1} options={explore1Options} />}
          score={explore1Score}
          onScoreChange={setExplore1Score}
          error={showError && !explore1Score.trim()}
        />
        <ScoreRow
          label="탐구2"
          subject={<SubjectSelect value={explore2} onChange={setExplore2} options={explore2Options} />}
          score={explore2Score}
          onScoreChange={setExplore2Score}
          error={showError && !explore2Score.trim()}
        />
        {initialSubjects.hasSecondLanguage && (
          <ScoreRow
            label="제2외국어/한문"
            subject={
              <SubjectSelect value={secondLanguage} onChange={setSecondLanguage} options={FOREIGN_LANGUAGE_SUBJECTS} />
            }
            error={showError && !secondLanguageScore.trim()}
            score={secondLanguageScore}
            onScoreChange={setSecondLanguageScore}
          />
        )}
      </div>

      <div className="mt-8 border-t border-[#E2E8F0] pt-6">
        <p className={`mb-4 h-5 text-sm font-medium text-[#DC2626] ${showError ? '' : 'invisible'}`}>
          모든 점수를 입력해주세요.
        </p>
        <button
          type="submit"
          className="flex h-12 w-full items-center justify-center rounded-xl bg-[#2F5DAA] text-sm font-semibold text-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] transition hover:bg-[#274C8B]"
        >
          저장하고 다음
        </button>
      </div>
    </form>
  );
}
