export type SessionStatus = 'RUNNING' | 'ENDED';

export interface StudySession {
  sessionId: number;
  userId: number;
  status: SessionStatus;
  startedAt: string;
  endedAt: string | null;
  studySeconds: number;
}

export interface StartSessionResponse {
  sessionId: number;
  status: SessionStatus;
  startedAt: string;
}

export interface HeartbeatRequest {
  studySeconds: number;
}

export interface HeartbeatResponse {
  sessionId: number;
  studySeconds: number;
  savedAt: string;
}

export interface EndSessionRequest {
  studySeconds: number;
}

export interface EndSessionResponse {
  sessionId: number;
  status: SessionStatus;
  studySeconds: number;
  endedAt: string;
}

export interface CurrentSessionResponse {
  sessionId: number;
  status: SessionStatus;
  startedAt: string;
  studySeconds: number;
}

export interface DailyStudyStats {
  date: string;
  studySeconds: number;
}

export interface DailyStatsQuery {
  startDate: string;
  endDate: string;
}
