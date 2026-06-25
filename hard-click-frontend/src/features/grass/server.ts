import { serverApi } from '@/lib/api';
import { isMock } from '@/mocks/config';
import type {
  StreakResponse,
  GrassQuery,
  StudyTimeGrassCell,
  LessonsGrassCell,
} from './types';

/* ───── 연속 학습일 (GET /api/grass/streak) — Server Component 전용 ─────
 * grass 도메인은 BE 미구현 → USE_MOCK(client services.ts와 동일). 연동 시 엔드포인트만 교체. */
export async function getStreakServer(): Promise<StreakResponse> {
  if (isMock('grass')) {
    return { streak: 7 };
  }
  // TODO(API 연동): GET /api/grass/streak
  const res = await serverApi.get<StreakResponse>('/api/grass/streak');
  return res.success && res.data ? res.data : { streak: 0 };
}

/* ───── 순공시간 잔디 (GET /api/grass/study-time?year=&month=) ───── */
export async function getStudyTimeGrassServer(
  query: GrassQuery,
): Promise<StudyTimeGrassCell[]> {
  if (isMock('grass')) {
    return generateMockStudyTime(query.year, query.month);
  }
  // TODO(API 연동): GET /api/grass/study-time
  const res = await serverApi.get<StudyTimeGrassCell[]>(
    `/api/grass/study-time${buildGrassQuery(query)}`,
  );
  return res.success && res.data ? res.data : [];
}

/* ───── 수강량 잔디 (GET /api/grass/lessons?year=&month=) ───── */
export async function getLessonsGrassServer(
  query: GrassQuery,
): Promise<LessonsGrassCell[]> {
  if (isMock('grass')) {
    return generateMockLessons(query.year, query.month);
  }
  // TODO(API 연동): GET /api/grass/lessons
  const res = await serverApi.get<LessonsGrassCell[]>(
    `/api/grass/lessons${buildGrassQuery(query)}`,
  );
  return res.success && res.data ? res.data : [];
}

/* ───── 내부 mock 헬퍼 (client services.ts의 생성 로직과 동일 — grass BE 연동 시 함께 제거) ───── */
function buildGrassQuery({ year, month }: GrassQuery) {
  const params = new URLSearchParams();
  params.set('year', String(year));
  if (month !== undefined) params.set('month', String(month));
  return `?${params.toString()}`;
}

/** SSR/CSR 동일 결과를 위해 deterministic seed(Math.sin) 사용 */
function generateMockStudyTime(
  year: number,
  month?: number,
): StudyTimeGrassCell[] {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return enumerateDates(year, month).map((date, idx) => {
    const isFuture = date > todayStr;
    const level = isFuture ? 0 : Math.floor(Math.abs(Math.sin(idx * 1.3)) * 6);
    return { date, studySeconds: isFuture ? 0 : level * 1800, level, isFuture };
  });
}

function generateMockLessons(year: number, month?: number): LessonsGrassCell[] {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return enumerateDates(year, month).map((date, idx) => {
    const isFuture = date > todayStr;
    const level = isFuture ? 0 : Math.floor(Math.abs(Math.sin(idx * 1.7)) * 6);
    return { date, watchedLessonCount: isFuture ? 0 : level, level, isFuture };
  });
}

function enumerateDates(year: number, month?: number): string[] {
  const result: string[] = [];
  const start = month ? new Date(year, month - 1, 1) : new Date(year, 0, 1);
  const end = month ? new Date(year, month, 0) : new Date(year, 11, 31);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    result.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
    );
  }
  return result;
}
