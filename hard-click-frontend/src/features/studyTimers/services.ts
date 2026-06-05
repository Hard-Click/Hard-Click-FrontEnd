import { USE_MOCK } from '@/mocks/config';
import { api } from '@/services/api';
import type {
  StartSessionResponse,
  HeartbeatRequest,
  HeartbeatResponse,
  EndSessionRequest,
  EndSessionResponse,
  CurrentSessionResponse,
  DailyStudyStats,
  DailyStatsQuery,
} from './types';

// 순공시간 세션 시작 (RUNNING 상태로 생성)
export const startStudySession = () =>
  api.post<StartSessionResponse>('/api/study-timers/sessions');

// 순공시간 heartbeat 저장 (비정상 종료 대비 주기적 저장)
export const saveHeartbeat = (sessionId: number, body: HeartbeatRequest) =>
  api.patch<HeartbeatResponse>(`/api/study-timers/sessions/${sessionId}/heartbeat`, body);

// 순공시간 세션 종료 (ENDED 상태로 변경)
export const endStudySession = (sessionId: number, body: EndSessionRequest) =>
  api.patch<EndSessionResponse>(`/api/study-timers/sessions/${sessionId}/end`, body);

// 현재 실행 중인 세션 조회
export const getCurrentSession = () =>
  api.get<CurrentSessionResponse>('/api/study-timers/sessions/current');

// 일별 순공시간 통계 조회
export async function getDailyStudyStats(query: DailyStatsQuery) {
  if (USE_MOCK) {
    // 오늘 날짜 2시간 30분 = 9000초 mock
    return {
      success: true,
      httpStatus: 200,
      message: '일별 순공시간 통계를 조회했습니다.',
      data: [{ date: query.endDate, studySeconds: 9000 }] as DailyStudyStats[],
    };
  }
  return api.get<DailyStudyStats[]>(
    `/api/study-timers/stats/daily?startDate=${query.startDate}&endDate=${query.endDate}`,
  );
}
