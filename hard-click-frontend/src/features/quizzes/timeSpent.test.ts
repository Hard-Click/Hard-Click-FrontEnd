/**
 * 풀이시간 정규화 공용 유틸 — 정규 퀴즈·유사퀴즈가 같은 계약을 쓰는지 고정한다.
 * 이 파일이 계약의 단일 소스이므로 경계값을 여기서 전부 검증한다.
 */
import { normalizeTimeSpentSeconds, pickTimeSpentSeconds } from './timeSpent';

describe('normalizeTimeSpentSeconds', () => {
  it('정상 측정값은 그대로', () => {
    expect(normalizeTimeSpentSeconds(95)).toBe(95);
  });

  it('소수는 반올림', () => {
    expect(normalizeTimeSpentSeconds(70.6)).toBe(71);
  });

  it('실측 0(찍고 바로 넘김)은 null이 아니라 진짜 0', () => {
    expect(normalizeTimeSpentSeconds(0.2)).toBe(0);
    expect(normalizeTimeSpentSeconds(0)).toBe(0);
  });

  it('측정 실패(음수·NaN·Infinity·비숫자)는 null — 가짜 0을 만들지 않는다', () => {
    expect(normalizeTimeSpentSeconds(-5)).toBeNull();
    expect(normalizeTimeSpentSeconds(Number.NaN)).toBeNull();
    expect(normalizeTimeSpentSeconds(Number.POSITIVE_INFINITY)).toBeNull();
    expect(normalizeTimeSpentSeconds(undefined)).toBeNull();
    expect(normalizeTimeSpentSeconds('30')).toBeNull();
  });

  it('비즈니스 상한(1시간)은 걸지 않는다 — 서버 몫', () => {
    expect(normalizeTimeSpentSeconds(99999)).toBe(99999);
  });

  it('BE DTO(32비트 Integer) 범위 밖만 null — 역직렬화 400 차단', () => {
    expect(normalizeTimeSpentSeconds(2147483647)).toBe(2147483647); // 경계값 통과
    expect(normalizeTimeSpentSeconds(2147483648)).toBeNull();
    expect(normalizeTimeSpentSeconds(1e10)).toBeNull();
  });
});

describe('pickTimeSpentSeconds', () => {
  it('맵에 값이 있으면 정규화해서 반환', () => {
    expect(pickTimeSpentSeconds({ 1: 70.6 }, 1)).toBe(71);
  });

  it('맵에 해당 문항이 없으면(미측정) null', () => {
    expect(pickTimeSpentSeconds({ 2: 30 }, 1)).toBeNull();
  });

  it('맵 자체가 없거나 비객체여도 던지지 않고 null — 제출 전체 실패 방지', () => {
    expect(pickTimeSpentSeconds(undefined, 1)).toBeNull();
    expect(
      pickTimeSpentSeconds(null as unknown as Record<number, number>, 1),
    ).toBeNull();
  });
});
