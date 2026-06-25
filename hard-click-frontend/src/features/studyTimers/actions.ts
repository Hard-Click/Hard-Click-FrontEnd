'use client';

import { isMock } from '@/mocks/config';
import { toast } from 'sonner';
import {
  startStudySession,
  saveHeartbeat,
  endStudySession,
  getCurrentSession,
} from './services';

// 순공시간 세션 시작
export async function startTimerAction(): Promise<{
  sessionId: number;
  startedAt: string;
} | null> {
  if (isMock('studyTimers')) {
    return { sessionId: 1, startedAt: new Date().toISOString() };
  }
  const res = await startStudySession({ startedAt: new Date().toISOString() });
  if (!res.success) {
    if (res.httpStatus === 409) {
      toast.error('이미 실행 중인 순공시간 세션이 있습니다.');
    } else {
      toast.error(res.message || '순공시간 시작에 실패했습니다.');
    }
    return null;
  }
  return { sessionId: res.data.sessionId, startedAt: res.data.startedAt };
}

// 순공시간 heartbeat 저장 — BE는 heartbeatAt(타임스탬프)로 경과시간을 누적(studySeconds 미사용).
export async function heartbeatAction(sessionId: number): Promise<boolean> {
  if (isMock('studyTimers')) return true;
  const res = await saveHeartbeat(sessionId, {
    heartbeatAt: new Date().toISOString(),
  });
  if (!res.success) {
    console.warn('[Heartbeat] 저장 실패:', res.message);
    return false;
  }
  return true;
}

const timerToastStyle = {
  className: 'timer-toast',
  duration: 2000,
};

// 순공시간 세션 종료 — BE는 endedAt(타임스탬프)로 최종 누적시간을 확정한다.
export async function endTimerAction(sessionId: number): Promise<boolean> {
  if (isMock('studyTimers')) {
    toast.success('순공시간이 저장되었습니다', timerToastStyle);
    return true;
  }
  const res = await endStudySession(sessionId, {
    endedAt: new Date().toISOString(),
  });
  if (!res.success) {
    toast.error(res.message || '순공시간 저장에 실패했습니다.', timerToastStyle);
    return false;
  }
  toast.success('순공시간이 저장되었습니다', timerToastStyle);
  return true;
}

// 현재 실행 중인 세션 조회
export async function fetchCurrentSessionAction() {
  if (isMock('studyTimers')) return null;
  const res = await getCurrentSession();
  if (!res.success) return null;
  return res.data;
}
