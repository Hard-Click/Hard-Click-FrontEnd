export type SubjectGroup =
  | '국어'
  | '수학'
  | '영어'
  | '한국사'
  | '사회탐구'
  | '과학탐구'
  | '제2외국어/한문';

export interface Subject {
  code: string;
  name: string;
  group: SubjectGroup;
}

export const SUBJECTS: Subject[] = [
  // 국어
  { code: 'KO_READING', name: '독서', group: '국어' },
  { code: 'KO_LITERATURE', name: '문학', group: '국어' },
  { code: 'KO_SPEECH_WRITING', name: '화법과 작문', group: '국어' },
  { code: 'KO_LANGUAGE_MEDIA', name: '언어와 매체', group: '국어' },
  // 수학
  { code: 'MATH_1', name: '수학Ⅰ', group: '수학' },
  { code: 'MATH_2', name: '수학Ⅱ', group: '수학' },
  { code: 'MATH_PROB_STAT', name: '확률과 통계', group: '수학' },
  { code: 'MATH_CALCULUS', name: '미적분', group: '수학' },
  { code: 'MATH_GEOMETRY', name: '기하', group: '수학' },
  { code: 'MATH_GEOMETRY', name: '기하', group: '수학' },
  /// 영어
  { code: 'ENG_1', name: '영어Ⅰ', group: '영어' },
  { code: 'ENG_2', name: '영어Ⅱ', group: '영어' },
  // 한국사
  { code: 'KOR_HISTORY', name: '한국사', group: '한국사' },
  // 사회탐구
  { code: 'SO_LIFE_ETHICS', name: '생활과 윤리', group: '사회탐구' },
  { code: 'SO_ETHICS_THOUGHT', name: '윤리와 사상', group: '사회탐구' },
  { code: 'SO_KOREAN_GEOGRAPHY', name: '한국지리', group: '사회탐구' },
  { code: 'SO_WORLD_GEOGRAPHY', name: '세계지리', group: '사회탐구' },
  { code: 'SO_EAST_ASIAN_HISTORY', name: '동아시아사', group: '사회탐구' },
  { code: 'SO_WORLD_HISTORY', name: '세계사', group: '사회탐구' },
  { code: 'SO_ECONOMICS', name: '경제', group: '사회탐구' },
  { code: 'SO_POLITICS_LAW', name: '정치와 법', group: '사회탐구' },
  { code: 'SO_CULTURE', name: '사회·문화', group: '사회탐구' },
  // 과학탐구
  { code: 'SC_PHYSICS_1', name: '물리학Ⅰ', group: '과학탐구' },
  { code: 'SC_CHEMISTRY_1', name: '화학Ⅰ', group: '과학탐구' },
  { code: 'SC_BIOLOGY_1', name: '생명과학Ⅰ', group: '과학탐구' },
  { code: 'SC_EARTH_1', name: '지구과학Ⅰ', group: '과학탐구' },
  { code: 'SC_PHYSICS_2', name: '물리학Ⅱ', group: '과학탐구' },
  { code: 'SC_CHEMISTRY_2', name: '화학Ⅱ', group: '과학탐구' },
  { code: 'SC_BIOLOGY_2', name: '생명과학Ⅱ', group: '과학탐구' },
  { code: 'SC_EARTH_2', name: '지구과학Ⅱ', group: '과학탐구' },
  // 제2외국어/한문
  { code: 'FL_GERMAN', name: '독일어Ⅰ', group: '제2외국어/한문' },
  { code: 'FL_FRENCH', name: '프랑스어Ⅰ', group: '제2외국어/한문' },
  { code: 'FL_SPANISH', name: '스페인어Ⅰ', group: '제2외국어/한문' },
  { code: 'FL_CHINESE', name: '중국어Ⅰ', group: '제2외국어/한문' },
  { code: 'FL_JAPANESE', name: '일본어Ⅰ', group: '제2외국어/한문' },
  { code: 'FL_RUSSIAN', name: '러시아어Ⅰ', group: '제2외국어/한문' },
  { code: 'FL_ARABIC', name: '아랍어Ⅰ', group: '제2외국어/한문' },
  { code: 'FL_VIETNAMESE', name: '베트남어Ⅰ', group: '제2외국어/한문' },
  { code: 'FL_HANMUN', name: '한문Ⅰ', group: '제2외국어/한문' },
];

// code → name 빠른 조회
export const SUBJECT_NAME: Record<string, string> = Object.fromEntries(
  SUBJECTS.map((s) => [s.code, s.name])
);

// 그룹 순서 (드롭다운 정렬용)
export const SUBJECT_GROUPS: SubjectGroup[] = [
  '국어',
  '수학',
  '영어',
  '한국사',
  '사회탐구',
  '과학탐구',
  '제2외국어/한문',
];
