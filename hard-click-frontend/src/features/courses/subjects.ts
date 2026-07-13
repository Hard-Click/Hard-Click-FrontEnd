/**
 * BE `SubjectType` enum(38 세부과목) ↔ 한글 라벨.
 *
 * - BE 응답 `subjectName`은 **raw enum 이름**("KO_READING")으로 내려온다 (BE에 라벨 매핑 없음)
 *   → FE에서 `subjectLabel()`로 한글 라벨로 바꿔 표시한다.
 * - 과목 필터는 이 **enum value를 그대로 BE에 전송**한다 (`?subject=KO_READING`).
 * - `subjectId`(1~38)는 필터 UI(드롭다운/URL)용 안정 식별자.
 */
export interface SubjectOption {
  subjectId: number;
  value: string; // BE enum 이름 (필터 파라미터)
  name: string; // 한글 라벨 (화면 표시)
}

export const SUBJECTS: readonly SubjectOption[] = [
  { subjectId: 1, value: 'KO_READING', name: '독서' },
  { subjectId: 2, value: 'KO_LITERATURE', name: '문학' },
  { subjectId: 3, value: 'KO_SPEECH_WRITING', name: '화법과 작문' },
  { subjectId: 4, value: 'KO_LANGUAGE_MEDIA', name: '언어와 매체' },
  { subjectId: 5, value: 'MATH_1', name: '수학Ⅰ' },
  { subjectId: 6, value: 'MATH_2', name: '수학Ⅱ' },
  { subjectId: 7, value: 'MATH_PROB_STAT', name: '확률과 통계' },
  { subjectId: 8, value: 'MATH_CALCULUS', name: '미적분' },
  { subjectId: 9, value: 'MATH_GEOMETRY', name: '기하' },
  { subjectId: 10, value: 'ENG_1', name: '영어Ⅰ' },
  { subjectId: 11, value: 'ENG_2', name: '영어Ⅱ' },
  { subjectId: 12, value: 'KOR_HISTORY', name: '한국사' },
  { subjectId: 13, value: 'SO_LIFE_ETHICS', name: '생활과 윤리' },
  { subjectId: 14, value: 'SO_ETHICS_THOUGHT', name: '윤리와 사상' },
  { subjectId: 15, value: 'SO_KOREAN_GEOGRAPHY', name: '한국지리' },
  { subjectId: 16, value: 'SO_WORLD_GEOGRAPHY', name: '세계지리' },
  { subjectId: 17, value: 'SO_EAST_ASIAN_HISTORY', name: '동아시아사' },
  { subjectId: 18, value: 'SO_WORLD_HISTORY', name: '세계사' },
  { subjectId: 19, value: 'SO_ECONOMICS', name: '경제' },
  { subjectId: 20, value: 'SO_POLITICS_LAW', name: '정치와 법' },
  { subjectId: 21, value: 'SO_CULTURE', name: '사회·문화' },
  { subjectId: 22, value: 'SC_PHYSICS_1', name: '물리학Ⅰ' },
  { subjectId: 23, value: 'SC_CHEMISTRY_1', name: '화학Ⅰ' },
  { subjectId: 24, value: 'SC_BIOLOGY_1', name: '생명과학Ⅰ' },
  { subjectId: 25, value: 'SC_EARTH_1', name: '지구과학Ⅰ' },
  { subjectId: 26, value: 'SC_PHYSICS_2', name: '물리학Ⅱ' },
  { subjectId: 27, value: 'SC_CHEMISTRY_2', name: '화학Ⅱ' },
  { subjectId: 28, value: 'SC_BIOLOGY_2', name: '생명과학Ⅱ' },
  { subjectId: 29, value: 'SC_EARTH_2', name: '지구과학Ⅱ' },
  { subjectId: 30, value: 'FL_GERMAN', name: '독일어Ⅰ' },
  { subjectId: 31, value: 'FL_FRENCH', name: '프랑스어Ⅰ' },
  { subjectId: 32, value: 'FL_SPANISH', name: '스페인어Ⅰ' },
  { subjectId: 33, value: 'FL_CHINESE', name: '중국어Ⅰ' },
  { subjectId: 34, value: 'FL_JAPANESE', name: '일본어Ⅰ' },
  { subjectId: 35, value: 'FL_RUSSIAN', name: '러시아어Ⅰ' },
  { subjectId: 36, value: 'FL_ARABIC', name: '아랍어Ⅰ' },
  { subjectId: 37, value: 'FL_VIETNAMESE', name: '베트남어Ⅰ' },
  { subjectId: 38, value: 'FL_HANMUN', name: '한문Ⅰ' },
];

const LABEL_BY_VALUE = new Map(SUBJECTS.map((s) => [s.value, s.name]));
const VALUE_BY_ID = new Map(SUBJECTS.map((s) => [s.subjectId, s.value]));

/** BE enum 이름("KO_READING") → 한글 라벨("독서"). 모르는 값이면 원본 그대로. */
export function subjectLabel(value: string | null | undefined): string {
  if (!value) return '';
  return LABEL_BY_VALUE.get(value) ?? value;
}

/** FE subjectId(1~38) → BE enum 이름(필터 전송용). */
export function subjectValueById(subjectId: number): string | undefined {
  return VALUE_BY_ID.get(subjectId);
}

/**
 * 대분류 색상 (학습 스케줄러 캘린더용).
 *
 * 38개 세부과목을 전부 다른 hue로 칠하면 색약 구분(CVD)이 무너져(dataviz 6-checks
 * 카테고리 hue는 8개 고정), 접두사로 뽑은 **대분류 7개 + 복습 1개 = 8개**만 고정 hue를
 * 배정한다(scheduler 최상단 범례와 1:1). validate_palette.js로 통과 확인된 팔레트.
 */
export type SubjectCategory =
  | 'KOREAN'
  | 'MATH'
  | 'ENGLISH'
  | 'KOREAN_HISTORY'
  | 'SOCIAL'
  | 'SCIENCE'
  | 'FOREIGN_LANGUAGE'
  | 'REVIEW';

interface CategoryColor {
  light: string;
  dark: string;
}

/**
 * ⚠️ 사용자 지정 파스텔 팔레트(2026-07-13) — "Winter Color Palettes" 참고 이미지(25색)에서
 * 최대한 안 겹치는 8개를 골라 추출. 원본 소재 자체가 블루그레이·더스티핑크 위주라
 * dataviz 6-checks CVD 분리는 통과 못 하지만(사용자가 이 트레이드오프를 인지하고 선택),
 * 톤 자체를 우선한 결정.
 */
const CATEGORY_COLOR: Record<SubjectCategory, CategoryColor> = {
  MATH: { light: '#50b4d8', dark: '#50b4d8' }, // 비비드 sky blue
  SCIENCE: { light: '#57838d', dark: '#57838d' }, // 톤다운 teal-gray
  REVIEW: { light: '#a7d9c9', dark: '#a7d9c9' }, // sage green
  KOREAN_HISTORY: { light: '#f7e5b7', dark: '#f7e5b7' }, // pale yellow
  ENGLISH: { light: '#ffe4c9', dark: '#ffe4c9' }, // peach
  FOREIGN_LANGUAGE: { light: '#cab3c1', dark: '#cab3c1' }, // dusty lilac (ENGLISH 살구톤과 헷갈려서 salmon에서 변경)
  SOCIAL: { light: '#c29ba3', dark: '#c29ba3' }, // dusty rose
  KOREAN: { light: '#d7e2ea', dark: '#d7e2ea' }, // 페일 blue-gray (SOCIAL 더스티로즈와 헷갈려서 lilac에서 변경)
};

/** BE 과목 enum 값("KO_READING" 등) → 대분류. 세부과목 접두사 기준(§ CATEGORY_COLOR). */
export function subjectCategory(value: string | null | undefined): SubjectCategory | null {
  if (!value) return null;
  if (value === 'KOR_HISTORY') return 'KOREAN_HISTORY';
  if (value.startsWith('KO_')) return 'KOREAN';
  if (value.startsWith('MATH_')) return 'MATH';
  if (value.startsWith('ENG_')) return 'ENGLISH';
  if (value.startsWith('SO_')) return 'SOCIAL';
  if (value.startsWith('SC_')) return 'SCIENCE';
  if (value.startsWith('FL_')) return 'FOREIGN_LANGUAGE';
  return null;
}

/** 과목 enum 값 → 캘린더 색(light/dark). 미매칭 값은 null(호출부에서 회색 등 기본값 처리). */
export function subjectColor(value: string | null | undefined): CategoryColor | null {
  const category = subjectCategory(value);
  return category ? CATEGORY_COLOR[category] : null;
}

/** 복습(과목 무관, 스케줄러 자체 카테고리) 색. */
export function reviewColor(): CategoryColor {
  return CATEGORY_COLOR.REVIEW;
}

/** 대분류(SubjectCategory) → 색. 이미 대분류로 판정된 값을 다룰 때(예: 오늘 할 일 항목) 사용. */
export function categoryColor(category: SubjectCategory): CategoryColor {
  return CATEGORY_COLOR[category];
}

const CATEGORY_LABEL: Record<SubjectCategory, string> = {
  KOREAN: '국어',
  MATH: '수학',
  ENGLISH: '영어',
  KOREAN_HISTORY: '한국사',
  SOCIAL: '사회',
  SCIENCE: '과학',
  FOREIGN_LANGUAGE: '외국어',
  REVIEW: '복습',
};

export interface ScheduleLegendItem {
  category: SubjectCategory;
  label: string;
  color: CategoryColor;
}

/** 학습 스케줄러 범례(대분류 7개 + 복습, 표시 순서 고정). */
export const SCHEDULE_LEGEND: readonly ScheduleLegendItem[] = (
  ['KOREAN', 'MATH', 'ENGLISH', 'KOREAN_HISTORY', 'SOCIAL', 'SCIENCE', 'FOREIGN_LANGUAGE', 'REVIEW'] as const
).map((category) => ({
  category,
  label: CATEGORY_LABEL[category],
  color: CATEGORY_COLOR[category],
}));
