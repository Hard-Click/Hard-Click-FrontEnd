import { api } from '@/services/api';
import type {
  StreakResponse,
  GrassQuery,
  StudyTimeGrassCell,
  LessonsGrassCell,
  GrassDayDetail,
} from './types';

const USE_MOCK = true;

/* ───── 연속 학습일 조회 (GET /api/grass/streak) ───── */
export async function getStreak() {
  if (USE_MOCK) {
    return {
      success: true,
      httpStatus: 200,
      message: '연속 학습일을 조회했습니다.',
      data: { streak: 7 } as StreakResponse,
    };
  }
  return api.get<StreakResponse>('/api/grass/streak');
}

/* ───── 순공시간 잔디 조회 (GET /api/grass/study-time?year=&month=) ─────
 * 마이페이지 학습 시간 잔디에서 사용 */
export async function getStudyTimeGrass(query: GrassQuery) {
  if (USE_MOCK) {
    return {
      success: true,
      httpStatus: 200,
      message: '순공시간 잔디 데이터를 조회했습니다.',
      data: generateMockStudyTime(query.year, query.month),
    };
  }
  const qs = buildGrassQuery(query);
  return api.get<StudyTimeGrassCell[]>(`/api/grass/study-time${qs}`);
}

/* ───── 수강량 잔디 조회 (GET /api/grass/lessons?year=&month=) ─────
 * 마이페이지 수강량 잔디에서 사용 */
export async function getLessonsGrass(query: GrassQuery) {
  if (USE_MOCK) {
    return {
      success: true,
      httpStatus: 200,
      message: '수강량 잔디 데이터를 조회했습니다.',
      data: generateMockLessons(query.year, query.month),
    };
  }
  const qs = buildGrassQuery(query);
  return api.get<LessonsGrassCell[]>(`/api/grass/lessons${qs}`);
}

/* ───── 특정 날짜 잔디 상세 조회 (GET /api/grass/days/{date}) ─────
 * 잔디 셀 hover/click 툴팁에서 사용 */
export async function getGrassDayDetail(date: string) {
  if (USE_MOCK) {
    return {
      success: true,
      httpStatus: 200,
      message: '잔디 상세 정보를 조회했습니다.',
      data: {
        date,
        watchedLessonCount: 3,
        studySeconds: 5400,
        hasStudyRecord: true,
      } as GrassDayDetail,
    };
  }
  return api.get<GrassDayDetail>(`/api/grass/days/${date}`);
}

/* ───── 내부 헬퍼 ───── */
function buildGrassQuery({ year, month }: GrassQuery) {
  const params = new URLSearchParams();
  params.set('year', String(year));
  if (month !== undefined) params.set('month', String(month));
  return `?${params.toString()}`;
}

/** SSR/CSR 동일한 결과를 내기 위해 deterministic seed 사용 (Math.sin) */
function generateMockStudyTime(year: number, month?: number): StudyTimeGrassCell[] {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const dates = enumerateDates(year, month);
  return dates.map((date, idx) => {
    const isFuture = date > todayStr;
    const level = isFuture ? 0 : Math.floor(Math.abs(Math.sin(idx * 1.3)) * 6);
    return {
      date,
      studySeconds: isFuture ? 0 : level * 1800,
      level,
      isFuture,
    };
  });
}

function generateMockLessons(year: number, month?: number): LessonsGrassCell[] {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const dates = enumerateDates(year, month);
  return dates.map((date, idx) => {
    const isFuture = date > todayStr;
    const level = isFuture ? 0 : Math.floor(Math.abs(Math.sin(idx * 1.7)) * 6);
    return {
      date,
      watchedLessonCount: isFuture ? 0 : level,
      level,
      isFuture,
    };
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
