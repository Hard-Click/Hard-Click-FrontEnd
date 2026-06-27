import { SCORE_BUCKETS, scoreBucket, summarizeScores } from './scoreboard';
import type { QuizScoreRow } from './types';

/** 행 생성 헬퍼 — 점수/응시여부만 신경 쓰면 되도록 나머지는 기본값 */
function row(overrides: Partial<QuizScoreRow>): QuizScoreRow {
  return {
    studentId: '@student',
    name: '학생',
    attended: true,
    score: null,
    submittedDate: null,
    ...overrides,
  };
}

describe('SCORE_BUCKETS — 점수 구간 정의', () => {
  it('4개 구간이 높은 점수부터 낮은 점수 순으로 정의된다', () => {
    expect(SCORE_BUCKETS).toHaveLength(4);
    expect(SCORE_BUCKETS.map((b) => b.key)).toEqual([
      'excellent',
      'good',
      'fair',
      'poor',
    ]);
  });

  it('각 구간의 min 경계가 90/70/50/0 이다', () => {
    expect(SCORE_BUCKETS.map((b) => b.min)).toEqual([90, 70, 50, 0]);
  });

  it('각 구간이 label·color·key·min 필드를 모두 갖는다', () => {
    for (const b of SCORE_BUCKETS) {
      expect(typeof b.key).toBe('string');
      expect(typeof b.label).toBe('string');
      expect(typeof b.color).toBe('string');
      expect(typeof b.min).toBe('number');
    }
  });

  it('min 값이 내림차순이라 find가 위에서부터 첫 매칭을 잡는다', () => {
    const mins = SCORE_BUCKETS.map((b) => b.min);
    const sorted = [...mins].sort((a, b) => b - a);
    expect(mins).toEqual(sorted);
  });
});

describe('scoreBucket — 점수를 구간 배지로 변환 (경계값)', () => {
  it('null(미응시)은 null 을 반환한다', () => {
    expect(scoreBucket(null)).toBeNull();
  });

  // excellent 구간 (90~100)
  it('100점은 excellent', () => {
    expect(scoreBucket(100)?.key).toBe('excellent');
  });
  it('90점(경계)은 excellent', () => {
    expect(scoreBucket(90)?.key).toBe('excellent');
  });
  it('89점(경계 바로 아래)은 good', () => {
    expect(scoreBucket(89)?.key).toBe('good');
  });

  // good 구간 (70~89)
  it('70점(경계)은 good', () => {
    expect(scoreBucket(70)?.key).toBe('good');
  });
  it('69점(경계 바로 아래)은 fair', () => {
    expect(scoreBucket(69)?.key).toBe('fair');
  });

  // fair 구간 (50~69)
  it('50점(경계)은 fair', () => {
    expect(scoreBucket(50)?.key).toBe('fair');
  });
  it('49점(경계 바로 아래)은 poor', () => {
    expect(scoreBucket(49)?.key).toBe('poor');
  });

  // poor 구간 (0~49)
  it('0점(경계)은 poor', () => {
    expect(scoreBucket(0)?.key).toBe('poor');
  });
  it('1점은 poor', () => {
    expect(scoreBucket(1)?.key).toBe('poor');
  });

  it('음수 점수는 어떤 min(>=0)에도 안 걸려 마지막 구간(poor)으로 폴백한다', () => {
    expect(scoreBucket(-1)?.key).toBe('poor');
    expect(scoreBucket(-100)?.key).toBe('poor');
  });

  it('반환 구간이 label·color 를 함께 담아 배지 렌더에 쓸 수 있다', () => {
    const b = scoreBucket(95);
    expect(b?.label).toBe('90~100');
    expect(b?.color).toBe('#16A34A');
  });

  it('구간별 모든 경계값을 한 번에 검증', () => {
    const cases: Array<[number, string]> = [
      [100, 'excellent'],
      [90, 'excellent'],
      [89, 'good'],
      [70, 'good'],
      [69, 'fair'],
      [50, 'fair'],
      [49, 'poor'],
      [0, 'poor'],
    ];
    for (const [score, key] of cases) {
      expect(scoreBucket(score)?.key).toBe(key);
    }
  });
});

describe('summarizeScores — 응시/미응시/평균/분포 집계', () => {
  it('빈 배열이면 모두 0·평균 0·분포 전부 0%', () => {
    const result = summarizeScores([]);
    expect(result.totalCount).toBe(0);
    expect(result.attendedCount).toBe(0);
    expect(result.notAttendedCount).toBe(0);
    expect(result.average).toBe(0);
    expect(result.distribution).toHaveLength(4);
    for (const d of result.distribution) {
      expect(d.count).toBe(0);
      expect(d.percent).toBe(0);
    }
  });

  it('전원 미응시(점수 null)면 응시 0·미응시 N·평균 0·분포 0%', () => {
    const rows = [
      row({ attended: false, score: null }),
      row({ attended: false, score: null }),
      row({ attended: false, score: null }),
    ];
    const result = summarizeScores(rows);
    expect(result.totalCount).toBe(3);
    expect(result.attendedCount).toBe(0);
    expect(result.notAttendedCount).toBe(3);
    expect(result.average).toBe(0);
    for (const d of result.distribution) {
      expect(d.count).toBe(0);
      expect(d.percent).toBe(0);
    }
  });

  it('응시/미응시 카운트를 attended 플래그로 분리한다', () => {
    const rows = [
      row({ attended: true, score: 80 }),
      row({ attended: true, score: 60 }),
      row({ attended: false, score: null }),
    ];
    const result = summarizeScores(rows);
    expect(result.totalCount).toBe(3);
    expect(result.attendedCount).toBe(2);
    expect(result.notAttendedCount).toBe(1);
  });

  it('평균은 점수가 있는(non-null) 행만으로 계산한다', () => {
    // (80 + 60) / 2 = 70
    const rows = [
      row({ attended: true, score: 80 }),
      row({ attended: true, score: 60 }),
      row({ attended: false, score: null }),
    ];
    expect(summarizeScores(rows).average).toBe(70);
  });

  it('평균은 반올림된다 (Math.round)', () => {
    // (90 + 81) / 2 = 85.5 -> 86
    const rows = [
      row({ score: 90 }),
      row({ score: 81 }),
    ];
    expect(summarizeScores(rows).average).toBe(86);

    // (90 + 80 + 81) / 3 = 83.67 -> 84
    const rows2 = [
      row({ score: 90 }),
      row({ score: 80 }),
      row({ score: 81 }),
    ];
    expect(summarizeScores(rows2).average).toBe(84);
  });

  it('분포는 점수가 있는 행만 구간별로 집계한다 (미응시 제외)', () => {
    const rows = [
      row({ score: 95 }), // excellent
      row({ score: 90 }), // excellent (경계)
      row({ score: 75 }), // good
      row({ score: 55 }), // fair
      row({ score: 10 }), // poor
      row({ attended: false, score: null }), // 제외
    ];
    const result = summarizeScores(rows);
    const byLabel = Object.fromEntries(
      result.distribution.map((d) => [d.label, d.count]),
    );
    expect(byLabel['90~100']).toBe(2);
    expect(byLabel['70~89']).toBe(1);
    expect(byLabel['50~69']).toBe(1);
    expect(byLabel['0~49']).toBe(1);
  });

  it('분포 percent는 응시자(점수 보유) 기준 백분율 반올림이다', () => {
    // 점수 4개: excellent 1, good 1, fair 1, poor 1 -> 각 25%
    const rows = [
      row({ score: 100 }),
      row({ score: 70 }),
      row({ score: 50 }),
      row({ score: 0 }),
      row({ attended: false, score: null }), // 분모에서 제외
    ];
    const result = summarizeScores(rows);
    for (const d of result.distribution) {
      expect(d.percent).toBe(25);
    }
  });

  it('percent 분모는 응시자 수라 미응시가 많아도 합이 100에 수렴한다', () => {
    // 점수 3개 -> 각 1개씩 33% (반올림)
    const rows = [
      row({ score: 95 }),
      row({ score: 75 }),
      row({ score: 30 }),
    ];
    const result = summarizeScores(rows);
    const byLabel = Object.fromEntries(
      result.distribution.map((d) => [d.label, d.percent]),
    );
    expect(byLabel['90~100']).toBe(33);
    expect(byLabel['70~89']).toBe(33);
    expect(byLabel['0~49']).toBe(33);
    expect(byLabel['50~69']).toBe(0);
  });

  it('분포는 항상 4개 구간을 label·color와 함께 반환한다', () => {
    const result = summarizeScores([row({ score: 80 })]);
    expect(result.distribution).toHaveLength(4);
    expect(result.distribution.map((d) => d.label)).toEqual([
      '90~100',
      '70~89',
      '50~69',
      '0~49',
    ]);
    for (const d of result.distribution) {
      expect(typeof d.color).toBe('string');
      expect(d.color.length).toBeGreaterThan(0);
    }
  });

  it('attended=true 인데 score=null 인 행은 응시자로 세지만 평균·분포 분모에선 빠진다', () => {
    // 응시 카운트는 attended 기준(2), 평균·분포는 score non-null(1) 기준
    const rows = [
      row({ attended: true, score: 80 }),
      row({ attended: true, score: null }), // 응시했으나 점수 없음
    ];
    const result = summarizeScores(rows);
    expect(result.attendedCount).toBe(2);
    expect(result.average).toBe(80); // 80 한 개만
    const byLabel = Object.fromEntries(
      result.distribution.map((d) => [d.label, d.count]),
    );
    expect(byLabel['70~89']).toBe(1);
    // 분모=1이므로 70~89는 100%
    const good = result.distribution.find((d) => d.label === '70~89');
    expect(good?.percent).toBe(100);
  });
});
