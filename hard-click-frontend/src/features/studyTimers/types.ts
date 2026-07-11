export type SessionStatus = 'RUNNING' | 'PAUSED' | 'ENDED';

export interface StudySession {
  sessionId: number;
  userId: number;
  status: SessionStatus;
  startedAt: string;
  endedAt: string | null;
  accumulatedStudySeconds: number;
}

/**
 * 세션 시작/heartbeat/종료 요청 — BE는 ISO-8601 타임스탬프(타임존 오프셋 포함)를 요구한다.
 * `new Date().toISOString()`(…Z)가 그대로 허용됨(라이브 검증 2026-06-25). BE가 경과시간으로 누적 계산.
 */
export interface StartSessionRequest {
  startedAt: string;
}
export interface HeartbeatRequest {
  heartbeatAt: string;
}
export interface EndSessionRequest {
  endedAt: string;
}
export interface PauseSessionRequest {
  pausedAt: string;
}
export interface ResumeSessionRequest {
  resumedAt: string;
}

export interface StartSessionResponse {
  sessionId: number;
  status: SessionStatus;
  startedAt: string;
}
export interface HeartbeatResponse {
  sessionId: number;
  status: SessionStatus;
  accumulatedStudySeconds: number;
  heartbeatAt: string;
}
export interface EndSessionResponse {
  sessionId: number;
  status: SessionStatus;
  accumulatedStudySeconds: number;
  endedAt: string;
}
export interface PauseSessionResponse {
  sessionId: number;
  status: SessionStatus;
  accumulatedStudySeconds: number;
  pausedAt: string;
}
export interface ResumeSessionResponse {
  sessionId: number;
  status: SessionStatus;
  accumulatedStudySeconds: number;
  resumedAt: string;
}
export interface CurrentSessionResponse {
  sessionId: number;
  status: SessionStatus;
  startedAt: string;
  accumulatedStudySeconds: number;
}

export interface DailyStudyStats {
  date: string;
  studySeconds: number;
}

export interface DailyStatsQuery {
  startDate: string;
  endDate: string;
}
