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

export const SUBJECTS: SubjectOption[] = [
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
