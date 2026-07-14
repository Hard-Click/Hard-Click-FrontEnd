'use client';

import { useState } from 'react';
import {
  EXPLORE_SUBJECTS,
  FOREIGN_LANGUAGE_SUBJECTS,
  KOREAN_ELECTIVES,
  MATH_ELECTIVES,
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
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-11 w-full rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm text-[#1F2937] outline-none focus:border-[#2F5DAA]"
    >
      <option value="">선택</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.name}
        </option>
      ))}
    </select>
  );
}

function ScoreInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="number"
      inputMode="numeric"
      min={0}
      max={100}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="원점수"
      className="h-11 w-full rounded-xl border border-[#E2E8F0] px-4 text-sm outline-none placeholder:text-[#94A3B8] focus:border-[#2F5DAA]"
    />
  );
}

function ScoreRow({
  label,
  subject,
  score,
  onScoreChange,
}: {
  label: string;
  subject: React.ReactNode;
  score: string;
  onScoreChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-[100px_1fr_140px] items-center gap-4">
      <span className="text-sm font-semibold text-[#1E293B]">{label}</span>
      <div>{subject}</div>
      <div className="flex items-center gap-2">
        <ScoreInput value={score} onChange={onScoreChange} />
        <span className="text-sm text-[#64748B]">점</span>
      </div>
    </div>
  );
}

/**
 * 최근 모의고사 성적 입력 (client 섬, #855 후속 화면).
 * 수능 응시영역 순서대로 과목 선택 + 원점수 입력.
 * ⚠️ BE 저장 API 없음(2026-07-14 기준) — 제출 시 서버 저장 없이 캘린더로 이동만 한다.
 */
export function ExamScoreForm({ onSubmit }: { onSubmit: () => void }) {
  const [korean, setKorean] = useState('');
  const [koreanScore, setKoreanScore] = useState('');
  const [math, setMath] = useState('');
  const [mathScore, setMathScore] = useState('');
  const [englishScore, setEnglishScore] = useState('');
  const [koreanHistoryScore, setKoreanHistoryScore] = useState('');
  const [explore1, setExplore1] = useState('');
  const [explore1Score, setExplore1Score] = useState('');
  const [explore2, setExplore2] = useState('');
  const [explore2Score, setExplore2Score] = useState('');
  const [secondLanguage, setSecondLanguage] = useState('');
  const [secondLanguageScore, setSecondLanguageScore] = useState('');

  const explore1Options = EXPLORE_SUBJECTS.filter((s) => s.value !== explore2);
  const explore2Options = EXPLORE_SUBJECTS.filter((s) => s.value !== explore1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
        />
        <ScoreRow
          label="수학"
          subject={<SubjectSelect value={math} onChange={setMath} options={MATH_ELECTIVES} />}
          score={mathScore}
          onScoreChange={setMathScore}
        />
        <ScoreRow
          label="영어"
          subject={<span className="text-sm text-[#94A3B8]">-</span>}
          score={englishScore}
          onScoreChange={setEnglishScore}
        />
        <ScoreRow
          label="한국사"
          subject={<span className="text-sm text-[#94A3B8]">-</span>}
          score={koreanHistoryScore}
          onScoreChange={setKoreanHistoryScore}
        />
        <ScoreRow
          label="탐구1"
          subject={<SubjectSelect value={explore1} onChange={setExplore1} options={explore1Options} />}
          score={explore1Score}
          onScoreChange={setExplore1Score}
        />
        <ScoreRow
          label="탐구2"
          subject={<SubjectSelect value={explore2} onChange={setExplore2} options={explore2Options} />}
          score={explore2Score}
          onScoreChange={setExplore2Score}
        />
        <ScoreRow
          label="제2외국어/한문"
          subject={
            <SubjectSelect value={secondLanguage} onChange={setSecondLanguage} options={FOREIGN_LANGUAGE_SUBJECTS} />
          }
          score={secondLanguageScore}
          onScoreChange={setSecondLanguageScore}
        />
      </div>

      <div className="mt-8 border-t border-[#E2E8F0] pt-6">
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
