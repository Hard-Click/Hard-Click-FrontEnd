/** `PUT /api/onboarding/profile` 1단계 값. */
export type AdmissionStrategy = 'REGULAR' | 'EARLY' | 'UNDECIDED';
export type KoreanElective = 'SPEECH_WRITING' | 'LANGUAGE_MEDIA';
export type MathElective = 'CALCULUS' | 'GEOMETRY' | 'STATISTICS';
export type ExplorationTrack = 'SOCIAL' | 'SCIENCE' | 'MIXED';
export type StudyPreference = 'MORNING' | 'EVENING' | 'NONE';

/** 온보딩 진행 상태 (`GET /api/onboarding/me`). */
export interface OnboardingStatus {
  profileCompleted: boolean;
  availabilityCompleted: boolean;
  examScoreCompleted: boolean;
  onboarded: boolean;
  /** 서버가 가용시간에서 유도한 하루 학습 상한(분). 2단계(불가능한 시간) 전이면 null. */
  dailyCapMin: number | null;
  /** 휴식요일 비트마스크. bit0=일 … bit6=토. */
  restDays: number;
}

/** `PUT /api/onboarding/profile` 요청 바디. */
export interface ProfileInput {
  targetUniversity?: string;
  targetMajor?: string;
  admissionStrategy: AdmissionStrategy;
  koreanElective?: KoreanElective;
  mathElective?: MathElective;
  explorationTrack: ExplorationTrack;
  /** 자유 문자열 ≤40자(예: "세계지리"). */
  explorationSubject1?: string;
  explorationSubject2?: string;
  secondLanguage: boolean;
  studyPreference: StudyPreference;
}

/** `PUT /api/onboarding/availability` 요청 바디 — 체크된(불가능한) 칸만 보낸다. */
export interface AvailabilityInput {
  unavailable: {
    /** 0=일 … 6=토 */
    dayOfWeek: number;
    /** 30분 슬롯 0~47 (`slot = 시*2 + (분>=30?1:0)`) */
    slots: number[];
  }[];
}

/** `PUT /api/onboarding/exam-scores` 응시영역. ⚠️ 제2외국어는 BE 스펙에 없어 전송 대상 아님. */
export type ExamSubjectArea = 'KOREAN' | 'MATH' | 'ENGLISH' | 'HISTORY' | 'EXPLORATION_1' | 'EXPLORATION_2';

export interface ExamScoreInput {
  /** 선택, 미지정 시 오늘 */
  examDate?: string;
  scores: {
    subjectArea: ExamSubjectArea;
    /** KOREAN/MATH/EXPLORATION_1/EXPLORATION_2만 필요, ENGLISH/HISTORY는 무시됨 */
    subjectName?: string;
    rawScore: number;
  }[];
}
