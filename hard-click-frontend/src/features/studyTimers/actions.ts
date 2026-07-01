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
// 반환: 서버가 확정한 누적 초(accumulatedStudySeconds). 클라 카운터를 이 값으로 보정해
//       백그라운드 탭 throttle 등으로 인한 화면-저장 시간 드리프트를 해소한다. 실패 시 null.
export async function heartbeatAction(
  sessionId: number,
): Promise<number | null> {
  if (isMock('studyTimers')) return null;
  const res = await saveHeartbeat(sessionId, {
    heartbeatAt: new Date().toISOString(),
  });
  if (!res.success) {
    console.warn('[Heartbeat] 저장 실패:', res.message);
    return null;
  }
  return res.data.accumulatedStudySeconds;
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
    // ST003(NOT_RUNNING): 학습 이탈 시 자동 종료 등으로 세션이 이미 끝난 경우 → 종료 의도는 달성됐고
    // 경과분도 저장됐으므로 idempotent하게 성공 처리한다(이중 종료 방어).
    // ⚠️ ST004(락 타임아웃)도 같은 409지만 이땐 저장이 안 됐으므로 성공 처리하면 안 됨(§0.1 '되는 척' 금지).
    //    그래서 httpStatus가 아니라 errorCode로 구분한다. BE는 ErrorResponse.errorCode에 코드값('ST003')을 넣는다.
    if (res.errorCode === 'ST003') {
      toast.success('순공시간이 저장되었습니다', timerToastStyle);
      return true;
    }
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

// 특정 세션이 아직 살아있는지 확정 조회(이어하기 재검증용).
// ⚠️ fetchCurrentSessionAction은 '조회 실패'와 '실행 세션 없음'을 둘 다 null로 뭉개므로,
//    이어하기 전 재검증엔 이 함수를 쓴다: 'ended'(확정 종료)일 때만 배너를 정리하고,
//    'unknown'(조회 실패)이면 살아있는 세션을 함부로 버리지 않는다.
export async function probeSessionAction(
  expectedSessionId: number,
): Promise<'running' | 'ended' | 'unknown'> {
  if (isMock('studyTimers')) return 'unknown';
  const res = await getCurrentSession();
  if (!res.success) return 'unknown'; // 조회 실패 — 상태 확정 불가
  const session = res.data;
  // current 엔드포인트는 RUNNING 세션만 반환(없으면 data=null). 다른/비RUNNING이면 그 세션은 끝난 것.
  if (session && session.status === 'RUNNING' && session.sessionId === expectedSessionId) {
    return 'running';
  }
  return 'ended';
}
