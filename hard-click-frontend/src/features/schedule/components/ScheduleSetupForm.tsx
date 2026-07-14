'use client';

import { forwardRef, useRef, useState } from 'react';
import {
  FOREIGN_LANGUAGE_SUBJECTS,
  KOREAN_ELECTIVES,
  MATH_ELECTIVES,
  SCIENCE_SUBJECTS,
  SOCIAL_SUBJECTS,
  type SelectedSubjects,
} from '../subjectPools';

type ExamStrategy = 'REGULAR' | 'EARLY' | 'BOTH';
type ExploreTrack = 'SOCIAL' | 'SCIENCE' | 'MIXED';
type StudyTendency = 'MORNING' | 'EVENING' | 'NONE';

const EXAM_STRATEGY_OPTIONS: { value: ExamStrategy; label: string }[] = [
  { value: 'REGULAR', label: '정시 위주' },
  { value: 'EARLY', label: '수시 위주' },
  { value: 'BOTH', label: '병행 / 미정' },
];

const EXPLORE_TRACK_OPTIONS: { value: ExploreTrack; label: string }[] = [
  { value: 'SOCIAL', label: '사회탐구' },
  { value: 'SCIENCE', label: '과학탐구' },
  { value: 'MIXED', label: '혼합' },
];

const STUDY_TENDENCY_OPTIONS: { value: StudyTendency; label: string }[] = [
  { value: 'MORNING', label: '아침형' },
  { value: 'EVENING', label: '저녁형' },
  { value: 'NONE', label: '무관' },
];

function exploreSubjectPool(track: ExploreTrack) {
  if (track === 'SOCIAL') return SOCIAL_SUBJECTS;
  if (track === 'SCIENCE') return SCIENCE_SUBJECTS;
  return [...SOCIAL_SUBJECTS, ...SCIENCE_SUBJECTS];
}

function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`h-11 rounded-xl border px-5 text-sm font-semibold transition ${
              active
                ? 'border-[#2F5DAA] bg-[#2F5DAA] text-white'
                : 'border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#F8FAFC]'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

const Select = forwardRef<
  HTMLSelectElement,
  {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    options: { value: string; name: string }[];
    error?: string;
    highlight?: boolean;
  }
>(function Select({ label, value, onChange, placeholder, options, error, highlight }, ref) {
  return (
    <div>
      <select
        ref={ref}
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-12 w-full rounded-xl border bg-white px-4 text-sm text-[#1F2937] outline-none focus:border-[#2F5DAA] ${
          highlight ? 'border-[#DC2626]' : 'border-[#E2E8F0]'
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.name}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-[#DC2626]">{error}</p>}
    </div>
  );
});

const TextField = forwardRef<
  HTMLInputElement,
  {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    error?: string;
    highlight?: boolean;
  }
>(function TextField({ label, value, onChange, placeholder, error, highlight }, ref) {
  return (
    <div>
      <input
        ref={ref}
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`h-12 w-full rounded-xl border px-4 text-sm outline-none placeholder:text-[#94A3B8] focus:border-[#2F5DAA] ${
          highlight ? 'border-[#DC2626]' : 'border-[#E2E8F0]'
        }`}
      />
      {error && <p className="mt-1 text-xs text-[#DC2626]">{error}</p>}
    </div>
  );
});

type FieldKey = 'targetSchool' | 'targetMajor' | 'korean' | 'math' | 'explore1' | 'explore2' | 'secondLanguage';
type FieldErrors = Partial<Record<FieldKey, string>>;

/** 위에서부터 나오는 순서 — focus·빨간 테두리는 이 중 맨 처음 에러난 칸에만. */
const FIELD_ORDER: FieldKey[] = ['targetSchool', 'targetMajor', 'korean', 'math', 'explore1', 'explore2', 'secondLanguage'];

const REQUIRED_SELECT_MESSAGE = '과목을 선택해주세요';

/**
 * 학습 스케줄 초기 설정 폼 (client 섬) — 구독 직후 1회 입력.
 * "다음" 클릭 시 불가능한 시간 체크(주간 시간 블록) 화면으로 이어진다(onNext, #855).
 * 여기서 고른 과목(국어·수학·탐구1/2·제2외국어)은 모의고사 성적 화면(#857)의 기본값으로 이어받는다.
 */
export function ScheduleSetupForm({ onNext }: { onNext: (selected: SelectedSubjects) => void }) {
  const [targetSchool, setTargetSchool] = useState('');
  const [targetMajor, setTargetMajor] = useState('');
  const [examStrategy, setExamStrategy] = useState<ExamStrategy>('BOTH');
  const [korean, setKorean] = useState('');
  const [math, setMath] = useState('');
  const [exploreTrack, setExploreTrack] = useState<ExploreTrack>('SOCIAL');
  const [explore1, setExplore1] = useState('');
  const [explore2, setExplore2] = useState('');
  const [hasSecondLanguage, setHasSecondLanguage] = useState(false);
  const [secondLanguage, setSecondLanguage] = useState('');
  const [studyTendency, setStudyTendency] = useState<StudyTendency>('NONE');
  // 첫 제출 시도 이후엔 입력값이 바뀔 때마다(=매 렌더) 실시간으로 재검증 — 채우면 사라지고 다시 지우면 재표시.
  const [submitted, setSubmitted] = useState(false);
  // 빨간 테두리 대상 필드 — 제출 시점에만 고정(다른 칸 채운다고 옮겨다니지 않음). 그 필드가 채워지면 그냥 사라짐.
  const [topErrorField, setTopErrorField] = useState<FieldKey | null>(null);

  const targetSchoolRef = useRef<HTMLInputElement>(null);
  const targetMajorRef = useRef<HTMLInputElement>(null);
  const koreanRef = useRef<HTMLSelectElement>(null);
  const mathRef = useRef<HTMLSelectElement>(null);
  const explore1Ref = useRef<HTMLSelectElement>(null);
  const explore2Ref = useRef<HTMLSelectElement>(null);
  const secondLanguageRef = useRef<HTMLSelectElement>(null);

  const fieldRefs: Record<FieldKey, React.RefObject<HTMLInputElement | HTMLSelectElement | null>> = {
    targetSchool: targetSchoolRef,
    targetMajor: targetMajorRef,
    korean: koreanRef,
    math: mathRef,
    explore1: explore1Ref,
    explore2: explore2Ref,
    secondLanguage: secondLanguageRef,
  };

  const explorePool = exploreSubjectPool(exploreTrack);
  const explore1Options = explorePool.filter((s) => s.value !== explore2);
  const explore2Options = explorePool.filter((s) => s.value !== explore1);

  const handleExploreTrackChange = (track: ExploreTrack) => {
    setExploreTrack(track);
    setExplore1('');
    setExplore2('');
  };

  /** 빈 칸마다 전부 에러 메시지 대상 — 그중 맨 위(FIELD_ORDER 기준) 칸만 별도로 focus·테두리 표시. */
  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (!targetSchool.trim()) next.targetSchool = '목표 대학을 입력해주세요.';
    if (!targetMajor.trim()) next.targetMajor = '목표 학과를 입력해주세요.';
    if (!korean) next.korean = REQUIRED_SELECT_MESSAGE;
    if (!math) next.math = REQUIRED_SELECT_MESSAGE;
    if (!explore1) next.explore1 = REQUIRED_SELECT_MESSAGE;
    if (!explore2) next.explore2 = REQUIRED_SELECT_MESSAGE;
    if (hasSecondLanguage && !secondLanguage) next.secondLanguage = REQUIRED_SELECT_MESSAGE;
    return next;
  };

  const errors = submitted ? validate() : {};
  // 제출 시점에 고정된 필드라도 그 사이 값이 채워졌으면 더 이상 테두리 표시 안 함(사라지기만, 다른 칸으로 안 옮겨감).
  const highlightField = topErrorField && errors[topErrorField] ? topErrorField : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const nextErrors = validate();
    const firstInvalid = FIELD_ORDER.find((key) => nextErrors[key]) ?? null;
    setTopErrorField(firstInvalid);
    if (firstInvalid) {
      fieldRefs[firstInvalid].current?.focus();
      return;
    }
    onNext({ korean, math, explore1, explore2, hasSecondLanguage, secondLanguage });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[#E2E8F0] bg-white p-8"
    >
      <h1 className="text-2xl font-bold text-[#1E293B]">학습 스케줄 초기 설정</h1>
      <p className="mt-1 text-sm text-[#64748B]">
        한 번만 입력하면 됩니다. 실력·정답률은 이후 진단테스트로 따로 수집합니다.
      </p>

      {/* 목표 */}
      <div className="mt-8">
        <h2 className="text-sm font-bold text-[#1E293B]">목표</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <TextField
            ref={targetSchoolRef}
            label="목표 대학"
            value={targetSchool}
            onChange={setTargetSchool}
            placeholder="목표 대학 (예: 서울대학교)"
            error={errors.targetSchool}
            highlight={highlightField === 'targetSchool'}
          />
          <TextField
            ref={targetMajorRef}
            label="목표 학과"
            value={targetMajor}
            onChange={setTargetMajor}
            placeholder="목표 학과 (예: 컴퓨터공학부)"
            error={errors.targetMajor}
            highlight={highlightField === 'targetMajor'}
          />
        </div>
      </div>

      {/* 입시 전략 */}
      <div className="mt-8">
        <h2 className="text-sm font-bold text-[#1E293B]">입시 전략</h2>
        <div className="mt-3">
          <SegmentedToggle
            options={EXAM_STRATEGY_OPTIONS}
            value={examStrategy}
            onChange={setExamStrategy}
          />
        </div>
      </div>

      {/* 선택과목 */}
      <div className="mt-8">
        <h2 className="text-sm font-bold text-[#1E293B]">선택과목</h2>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <div>
            <p className="mb-2 text-xs text-[#64748B]">국어</p>
            <Select
              ref={koreanRef}
              label="국어 선택과목"
              value={korean}
              onChange={setKorean}
              placeholder="선택"
              options={KOREAN_ELECTIVES}
              error={errors.korean}
              highlight={highlightField === 'korean'}
            />
          </div>
          <div>
            <p className="mb-2 text-xs text-[#64748B]">수학</p>
            <Select
              ref={mathRef}
              label="수학 선택과목"
              value={math}
              onChange={setMath}
              placeholder="선택"
              options={MATH_ELECTIVES}
              error={errors.math}
              highlight={highlightField === 'math'}
            />
          </div>
        </div>

        <p className="mb-2 mt-6 text-xs text-[#64748B]">탐구 계열</p>
        <SegmentedToggle
          options={EXPLORE_TRACK_OPTIONS}
          value={exploreTrack}
          onChange={handleExploreTrackChange}
        />

        <p className="mb-2 mt-6 text-xs text-[#64748B]">탐구 과목 (2개 선택)</p>
        <div className="grid grid-cols-2 gap-4">
          <Select
            ref={explore1Ref}
            label="탐구 1 과목"
            value={explore1}
            onChange={setExplore1}
            placeholder="탐구 1"
            options={explore1Options}
            error={errors.explore1}
            highlight={highlightField === 'explore1'}
          />
          <Select
            ref={explore2Ref}
            label="탐구 2 과목"
            value={explore2}
            onChange={setExplore2}
            placeholder="탐구 2"
            options={explore2Options}
            error={errors.explore2}
            highlight={highlightField === 'explore2'}
          />
        </div>

        <label className="mt-6 flex items-center gap-2 text-sm text-[#1E293B]">
          <input
            type="checkbox"
            checked={hasSecondLanguage}
            onChange={(e) => {
              setHasSecondLanguage(e.target.checked);
              if (!e.target.checked) setSecondLanguage('');
            }}
            className="h-4 w-4 rounded border-[#CBD5E1] accent-[#2F5DAA]"
          />
          제2외국어 / 한문 응시
        </label>
        {hasSecondLanguage && (
          <div className="mt-3">
            <Select
              ref={secondLanguageRef}
              label="제2외국어/한문 과목"
              value={secondLanguage}
              onChange={setSecondLanguage}
              placeholder="선택"
              options={FOREIGN_LANGUAGE_SUBJECTS}
              error={errors.secondLanguage}
              highlight={highlightField === 'secondLanguage'}
            />
          </div>
        )}
      </div>

      {/* 학습 성향 */}
      <div className="mt-8">
        <h2 className="text-sm font-bold text-[#1E293B]">학습 성향</h2>
        <div className="mt-3">
          <SegmentedToggle
            options={STUDY_TENDENCY_OPTIONS}
            value={studyTendency}
            onChange={setStudyTendency}
          />
        </div>
      </div>

      <div className="mt-10 flex justify-end border-t border-[#E2E8F0] pt-6">
        <button
          type="submit"
          className="flex h-12 items-center justify-center rounded-xl bg-[#2F5DAA] px-6 text-sm font-semibold text-white transition hover:bg-[#274C8B]"
        >
          다음
        </button>
      </div>
    </form>
  );
}
