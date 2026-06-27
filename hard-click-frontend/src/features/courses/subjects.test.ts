import { SUBJECTS, subjectLabel, subjectValueById } from './subjects';

describe('subjectLabel — BE enum 이름 → 한글 라벨', () => {
  it('알려진 enum 코드는 한글 라벨로 변환', () => {
    expect(subjectLabel('MATH_1')).toBe('수학Ⅰ');
    expect(subjectLabel('KO_READING')).toBe('독서');
    expect(subjectLabel('SC_PHYSICS_1')).toBe('물리학Ⅰ');
    expect(subjectLabel('FL_HANMUN')).toBe('한문Ⅰ');
  });

  it('SUBJECTS 전체가 자기 value→name으로 매핑된다', () => {
    for (const s of SUBJECTS) {
      expect(subjectLabel(s.value)).toBe(s.name);
    }
  });

  it('모르는 코드는 입력값 그대로 폴백', () => {
    expect(subjectLabel('UNKNOWN_CODE')).toBe('UNKNOWN_CODE');
    expect(subjectLabel('수학Ⅰ')).toBe('수학Ⅰ'); // 이미 라벨인 값도 그대로
    expect(subjectLabel('math_1')).toBe('math_1'); // 대소문자 구분 (정확 일치만)
  });

  it('null은 빈 문자열', () => {
    expect(subjectLabel(null)).toBe('');
  });

  it('undefined는 빈 문자열', () => {
    expect(subjectLabel(undefined)).toBe('');
  });

  it('빈 문자열은 빈 문자열 (falsy 폴백)', () => {
    expect(subjectLabel('')).toBe('');
  });
});

describe('subjectValueById — FE subjectId → BE enum 이름', () => {
  it('유효한 id는 해당 enum value 반환', () => {
    expect(subjectValueById(1)).toBe('KO_READING');
    expect(subjectValueById(5)).toBe('MATH_1');
    expect(subjectValueById(38)).toBe('FL_HANMUN');
  });

  it('SUBJECTS 전체가 자기 subjectId→value로 매핑된다', () => {
    for (const s of SUBJECTS) {
      expect(subjectValueById(s.subjectId)).toBe(s.value);
    }
  });

  it('경계 밖 id(0·39·음수)는 undefined', () => {
    expect(subjectValueById(0)).toBeUndefined();
    expect(subjectValueById(39)).toBeUndefined();
    expect(subjectValueById(-1)).toBeUndefined();
  });

  it('존재하지 않는 id는 undefined', () => {
    expect(subjectValueById(999)).toBeUndefined();
  });
});

describe('SUBJECTS — 목록 일관성', () => {
  it('38개 세부과목', () => {
    expect(SUBJECTS).toHaveLength(38);
  });

  it('subjectId는 1~38 연속이고 중복 없음', () => {
    const ids = SUBJECTS.map((s) => s.subjectId);
    expect(ids).toEqual(Array.from({ length: 38 }, (_, i) => i + 1));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('value(enum 이름)는 중복 없음', () => {
    const values = SUBJECTS.map((s) => s.value);
    expect(new Set(values).size).toBe(values.length);
  });

  it('name(한글 라벨)은 중복 없음', () => {
    const names = SUBJECTS.map((s) => s.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('모든 항목이 빈값 없는 value·name을 가진다', () => {
    for (const s of SUBJECTS) {
      expect(typeof s.value).toBe('string');
      expect(s.value.length).toBeGreaterThan(0);
      expect(typeof s.name).toBe('string');
      expect(s.name.length).toBeGreaterThan(0);
    }
  });
});
