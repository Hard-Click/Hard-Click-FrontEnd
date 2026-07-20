'use client';

import { isMock } from '@/mocks/config';
import { toast } from '@/lib/toast';
import {
  startStudySession,
  saveHeartbeat,
  endStudySession,
  pauseStudySession,
  resumeStudySession,
  getCurrentSession,
  getDailyStudyStats,
} from './services';
import type { SessionStatus } from './types';

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

// 순공시간 일시정지 — 서버에 PAUSED 기록. 반환: 서버 확정 누적 초(정지 시점까지). 실패 시 null.
// BE가 정지 시점을 기록해 이후 정지구간을 누적에서 제외한다(경과시간 모델의 정지구간 과다누적 해소).
export async function pauseTimerAction(
  sessionId: number,
): Promise<number | null> {
  if (isMock('studyTimers')) return null; // mock: 클라 인터벌만 정지(서버 대상 없음)
  const res = await pauseStudySession(sessionId, {
    pausedAt: new Date().toISOString(),
  });
  if (!res.success) {
    console.warn('[StudyTimer] pause 실패:', res.message);
    return null;
  }
  return res.data.accumulatedStudySeconds;
}

// 순공시간 재개 — 서버에 RUNNING 기록. 반환: 서버 확정 누적 초. 실패 시 null.
export async function resumeTimerAction(
  sessionId: number,
): Promise<number | null> {
  if (isMock('studyTimers')) return null;
  const res = await resumeStudySession(sessionId, {
    resumedAt: new Date().toISOString(),
  });
  if (!res.success) {
    console.warn('[StudyTimer] resume 실패:', res.message);
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
  let res = await endStudySession(sessionId, {
    endedAt: new Date().toISOString(),
  });
  // ST003(NOT_RUNNING) = "RUNNING 세션만 처리 가능". 두 경우로 갈린다:
  //  (a) 이미 ENDED(이중 종료·이탈 자동종료) → /current에 없음 → 종료 의도 달성 → idempotent 성공.
  //  (b) PAUSED 상태로 종료 시도 → /current에 PAUSED로 남아있음. BE는 RUNNING만 종료 가능하므로
  //      먼저 resume(→RUNNING)한 뒤 재종료한다(라이브 검증 2026-07-11: PAUSED에 end=409 ST003).
  //      안 그러면 가짜 성공→UI만 지워지고 서버 세션이 PAUSED로 남아 이어하기 배너가 계속 재출현한다.
  //  ⚠️ ST004(락 타임아웃)도 같은 409지만 저장 안 됐으므로 성공 처리 금지 → errorCode로 구분(§0.1).
  if (!res.success && res.errorCode === 'ST003') {
    const cur = await getCurrentSession();
    if (cur.success && cur.data != null && cur.data.sessionId === sessionId) {
      // 그 세션이 아직 활성 → 종료 가능 상태로 만든 뒤 재종료. PAUSED면 resume(→RUNNING) 먼저,
      // RUNNING이면(멀티탭 재개 등 레이스) 바로 재종료. end는 RUNNING만 허용하므로.
      if (cur.data.status === 'PAUSED') {
        const resumeRes = await resumeStudySession(sessionId, {
          resumedAt: new Date().toISOString(),
        });
        if (!resumeRes.success) {
          // resume 실패면 end 재시도해도 또 ST003(PAUSED) → end 실패로 오표시하지 말고 실제 원인(resume 실패) 안내.
          toast.error(
            resumeRes.message || '세션 재개에 실패했어요. 다시 시도해 주세요.',
            timerToastStyle,
          );
          return false;
        }
      }
      res = await endStudySession(sessionId, {
        endedAt: new Date().toISOString(),
      });
    } else if (cur.success) {
      // 조회 성공인데 그 세션이 활성 목록에 없음(null·다른 세션) = 확정 종료(이중 종료·이탈 자동종료) → idempotent 성공.
      toast.success('순공시간이 저장되었습니다', timerToastStyle);
      return true;
    }
    // cur.success===false(조회 실패) → 종료 여부 확정 불가 → 가짜 성공 금지, 아래로 떨어져 실패 처리.
  }
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

// 오늘 저장된 순공 누적초(종료된 세션 합계) — 집중 모드 '오늘 총 학습 시간' seed용.
//  마이페이지 '오늘 순공시간'과 동일 소스(/stats/daily)라 두 화면 값이 일치한다.
//  ⚠️ daily_study_stats는 세션 종료 시점에 기록되므로(BE) 진행 중 세션은 아직 미포함 →
//     패널이 여기 값(base) + 현재 세션 초를 더해 표시한다(이중 집계 없음).
//  조회 실패/미집계면 0(가짜 값 금지, §0.1). getDailyStudyStats가 mock 분기를 내부 처리.
// 조회 실패는 null — 0으로 내리면 '오늘 아직 공부 안 함'과 구분이 안 돼 장애가 정상처럼 보인다(§0.1④).
// 진짜 0(오늘 기록 없음)은 0으로 그대로 내려간다.
export async function fetchTodayStudySecondsAction(): Promise<number | null> {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const res = await getDailyStudyStats({ startDate: today, endDate: today });
  if (!res.success || !res.data) return null;
  return res.data.find((d) => d.date === today)?.studySeconds ?? 0;
}

// 특정 세션이 아직 살아있는지 확정 조회(이어하기 재검증용).
// ⚠️ fetchCurrentSessionAction은 '조회 실패'와 '실행 세션 없음'을 둘 다 null로 뭉개므로,
//    이어하기 전 재검증엔 이 함수를 쓴다: 'ended'(확정 종료)일 때만 배너를 정리하고,
//    'unknown'(조회 실패)이면 살아있는 세션을 함부로 버리지 않는다.
export async function probeSessionAction(expectedSessionId: number): Promise<{
  state: 'running' | 'ended' | 'unknown';
  status: SessionStatus | null;
}> {
  if (isMock('studyTimers')) return { state: 'unknown', status: null };
  const res = await getCurrentSession();
  if (!res.success) return { state: 'unknown', status: null }; // 조회 실패 — 상태 확정 불가
  const session = res.data;
  // current는 ACTIVE_STATUSES=[RUNNING,PAUSED]를 반환한다(BE 코드검증 2026-07-11, 없으면 data=null).
  // 활성(RUNNING·PAUSED)이고 그 세션이면 '살아있음' → 이어하기 대상 + 최신 status 반환(호출부가 stale
  // 대신 이걸 쓰게). 그 외(없음/다른 세션)는 끝난 것.
  if (
    session &&
    (session.status === 'RUNNING' || session.status === 'PAUSED') &&
    session.sessionId === expectedSessionId
  ) {
    return { state: 'running', status: session.status };
  }
  return { state: 'ended', status: null };
}
