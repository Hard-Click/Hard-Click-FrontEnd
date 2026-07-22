/**
 * 문제별 풀이시간 정규화 — 정규 퀴즈·유사퀴즈 공용.
 *
 * 두 도메인이 같은 계약(BE 요청 2026-07-21)을 쓰는데 로직이 갈리면
 * 상한 정책이 한쪽에만 반영되는 사고가 난다. 단일 소스로 둔다.
 *
 * 계약:
 *  - 미측정·측정 실패(음수·NaN·비유한·비숫자)는 0이 아니라 **null**.
 *    0을 보내면 "0초에 순식간에 풀었다"와 "시간을 못 쟀다"가 같은 값이 돼,
 *    풀이시간 중앙값으로 '오래 걸림'을 판정하는 추천 로직이 0에 깔려 신호가 꺼진다.
 *  - 실측값이 0으로 반올림된 경우(찍고 바로 넘김)는 **진짜 0**이므로 그대로 0.
 *  - 비즈니스 상한(1시간 초과 → null)은 **서버 몫**이라 걸지 않는다.
 *    단 BE DTO가 32비트 Integer라 그 범위 밖 값은 BE 정규화에 닿기도 전에
 *    역직렬화 400으로 터져 제출 전체가 실패하므로, 계약이 표현 못 하는 값만 막는다.
 */

/** BE 요청 DTO의 timeSpentSeconds가 32비트 Integer — 이 범위를 넘으면 역직렬화 단계에서 400. */
const INT32_MAX = 2147483647;

/**
 * 클라가 준 초 값을 BE 전송용으로 정규화한다.
 * Server Action 경계라 입력을 신뢰하지 않는다(§5).
 */
export function normalizeTimeSpentSeconds(t: unknown): number | null {
  return typeof t === 'number' && Number.isFinite(t) && t >= 0 && t <= INT32_MAX
    ? Math.round(t)
    : null;
}

/**
 * 시간 맵에서 해당 문항의 값을 꺼내 정규화한다.
 * 맵 자체도 신뢰하지 않는다 — null/비객체가 오면 인덱싱에서 TypeError가 나
 * 제출 전체가 실패하므로 맵 유무를 먼저 가른다.
 */
export function pickTimeSpentSeconds(
  map: Record<number, number> | undefined,
  questionId: number,
): number | null {
  const t = map && typeof map === 'object' ? map[questionId] : undefined;
  return normalizeTimeSpentSeconds(t);
}
