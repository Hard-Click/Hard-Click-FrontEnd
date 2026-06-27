import { maskName, relativeTime } from './formatter';

describe('maskName — 이름 마스킹 (개인정보 보호)', () => {
  it('빈 문자열은 그대로 반환', () => {
    expect(maskName('')).toBe('');
  });

  it('1글자는 그대로 (가릴 가운데가 없음)', () => {
    expect(maskName('김')).toBe('김');
  });

  it('2글자는 끝 글자를 마스킹', () => {
    expect(maskName('김민')).toBe('김*');
  });

  it('3글자는 가운데 1글자 마스킹', () => {
    expect(maskName('한도선')).toBe('한*선');
  });

  it('4글자 이상은 첫·끝 남기고 가운데 전부 마스킹', () => {
    expect(maskName('남궁민수')).toBe('남**수');
    expect(maskName('시연학생')).toBe('시**생');
  });

  it('앞뒤 공백은 trim 후 마스킹', () => {
    expect(maskName('  김민수  ')).toBe('김*수');
  });
});

describe('relativeTime — 상대 시간 라벨', () => {
  // Date.now()를 고정해 시간 의존성 제거
  const NOW = new Date('2026-06-27T12:00:00Z').getTime();
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(NOW);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('잘못된 날짜는 빈 문자열', () => {
    expect(relativeTime('not-a-date')).toBe('');
  });

  it('1분 미만은 "방금 전"', () => {
    expect(relativeTime('2026-06-27T11:59:30Z')).toBe('방금 전');
  });

  it('1시간 미만은 "N분 전"', () => {
    expect(relativeTime('2026-06-27T11:30:00Z')).toBe('30분 전');
  });

  it('24시간 미만은 "N시간 전"', () => {
    expect(relativeTime('2026-06-27T09:00:00Z')).toBe('3시간 전');
  });

  it('7일 미만은 "N일 전"', () => {
    expect(relativeTime('2026-06-25T12:00:00Z')).toBe('2일 전');
  });

  it('7일 이상은 YYYY.MM.DD 형식', () => {
    expect(relativeTime('2026-06-01T12:00:00Z')).toMatch(/^\d{4}\.\d{2}\.\d{2}$/);
  });
});
