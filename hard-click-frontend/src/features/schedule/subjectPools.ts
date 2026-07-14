import { SUBJECTS } from '@/features/courses/subjects';

/** 국어 선택과목(화법과 작문/언어와 매체). */
export const KOREAN_ELECTIVES = SUBJECTS.filter((s) => s.value.startsWith('KO_') && s.subjectId >= 3);
/** 수학 선택과목(미적분/확률과 통계/기하). */
export const MATH_ELECTIVES = SUBJECTS.filter(
  (s) => s.value.startsWith('MATH_') && s.value !== 'MATH_1' && s.value !== 'MATH_2',
);
export const SOCIAL_SUBJECTS = SUBJECTS.filter((s) => s.value.startsWith('SO_'));
export const SCIENCE_SUBJECTS = SUBJECTS.filter((s) => s.value.startsWith('SC_'));
/** 탐구 1·2 — 사회탐구 9 + 과학탐구 8 = 17과목 풀(계열 무관 독립 선택). */
export const EXPLORE_SUBJECTS = [...SOCIAL_SUBJECTS, ...SCIENCE_SUBJECTS];
/** 제2외국어/한문(9과목). */
export const FOREIGN_LANGUAGE_SUBJECTS = SUBJECTS.filter((s) => s.value.startsWith('FL_'));

/** 스케줄 설정 폼에서 고른 과목 — 모의고사 성적 화면의 응시과목 기본값으로 이어받는다. */
export interface SelectedSubjects {
  korean: string;
  math: string;
  explore1: string;
  explore2: string;
  /** false면 제2외국어/한문 응시 안 함 — 모의고사 성적 화면에 그 행 자체를 안 보여준다. */
  hasSecondLanguage: boolean;
  secondLanguage: string;
}
