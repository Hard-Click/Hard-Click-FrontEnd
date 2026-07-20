'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { toast } from '@/lib/toast';
import {
  startTimerAction,
  endTimerAction,
  heartbeatAction,
  pauseTimerAction,
  resumeTimerAction,
  fetchCurrentSessionAction,
  probeSessionAction,
  fetchTodayStudySecondsAction,
} from '../actions';
import { isMock } from '@/mocks/config';
import { isSessionLeaving } from '../leaveSignal';
import FocusModeOverlay from './FocusModeOverlay';
import CurrentSessionAlert from './CurrentSessionAlert';
import { useAuth } from '@/features/auth/AuthProvider';
import type { SessionStatus } from '../types';

// Heartbeat 간격: 60초마다 서버에 저장 (UA-P1-147)
const HEARTBEAT_INTERVAL_MS = 60_000;

const AUTH_PATHS = ['/auth', '/community/new'];

export default function StudyTimerPanel() {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.some((path) => pathname.startsWith(path));
  // 인증 상태는 서버 쿠키 기반 Context에서 (localStorage 대체)
  const { isLoggedIn } = useAuth();

  const [sessionId, setSessionId] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [seconds, setSeconds] = useState(0);
  // 오늘 종료된 세션들의 누적초(=/stats/daily 오늘 총합, 마이페이지 '오늘 순공시간'과 동일 소스).
  // 화면의 '오늘 총 학습 시간'은 이 base + 현재 세션(seconds)로 파생한다(진행 중 세션은 daily에 아직 미반영).
  const [dailyBaseSeconds, setDailyBaseSeconds] = useState<number | null>(0);
  const [resumeSession, setResumeSession] = useState<{
    sessionId: number;
    startedAt: string;
    studySeconds: number;
    status: SessionStatus;
  } | null>(null);

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const secondsRef = useRef(0);
  // pause↔resume 전이 in-flight 잠금 — 재개/일시정지 연타로 인터벌 중복·서버 이중호출·상태 경쟁 방지.
  const transitioningRef = useRef(false);
  // heartbeat 세대 — 세션 종료/재시작 시 증가. 이전 세션의 in-flight heartbeat 응답이 새 세션 시간을 덮어쓰지 않게.
  const heartbeatGenRef = useRef(0);

  // 서버 확정 누적초로 로컬 카운터 보정(백그라운드 탭 throttle 등 화면-저장 드리프트 해소).
  // '오늘 총 학습시간'은 dailyBaseSeconds + seconds로 파생되므로 여기서 별도 보정이 필요 없다.
  const applyServerSeconds = useCallback((serverSeconds: number) => {
    secondsRef.current = serverSeconds;
    setSeconds(serverSeconds);
  }, []);

  // 페이지 진입 시 활성 세션 복원 — RUNNING/PAUSED 둘 다 이어하기 대상.
  //  BE /current는 ACTIVE_STATUSES=[RUNNING,PAUSED]를 준다(코드검증 2026-07-11). 일시정지 후 하드내비로
  //  패널이 재마운트돼도 PAUSED 세션을 미아로 잃지 않고 배너로 복원한다. ENDED는 /current가 안 준다.
  useEffect(() => {
    fetchCurrentSessionAction().then((session) => {
      if (!session) return;
      // 영상 이탈로 곧 종료될 세션이면 "이어하기" 배너를 띄우지 않는다(영상 자동종료↔전역배너 이중관리
      // 방지, leaveSignal). 영상 타이머는 RUNNING이라 RUNNING만 억제. TTL 지나면 정상 복원(미아 방지).
      if (session.status === 'RUNNING' && isSessionLeaving(session.sessionId)) {
        return;
      }
      if (session.status === 'RUNNING' || session.status === 'PAUSED') {
        setResumeSession({
          sessionId: session.sessionId,
          startedAt: session.startedAt,
          studySeconds: session.accumulatedStudySeconds,
          status: session.status,
        });
        setSeconds(session.accumulatedStudySeconds);
        secondsRef.current = session.accumulatedStudySeconds;
      }
    });
  }, []);

  // 오늘 저장된 순공 총합(종료분) 로드 — '오늘 총 학습 시간' base. 현재 세션(seconds)은 표시 시 더해진다.
  useEffect(() => {
    fetchTodayStudySecondsAction().then(setDailyBaseSeconds);
  }, []);

  const startTick = useCallback(() => {
    if (tickRef.current) clearInterval(tickRef.current); // 멱등 — 재시작 시 중복 인터벌·누수 방지
    tickRef.current = setInterval(() => {
      secondsRef.current += 1;
      setSeconds((s) => s + 1);
    }, 1000);
  }, []);

  const startHeartbeat = useCallback(
    (sid: number) => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current); // 멱등
      const gen = ++heartbeatGenRef.current; // 이 heartbeat 세대 캡처
      heartbeatRef.current = setInterval(async () => {
        const serverSeconds = await heartbeatAction(sid);
        // 서버 확정 누적시간으로 보정 — 응답 도착 시 세션이 바뀌었으면(세대 불일치) 무시(stale 덮어쓰기 방지).
        if (serverSeconds != null && heartbeatGenRef.current === gen) {
          applyServerSeconds(serverSeconds);
        }
      }, HEARTBEAT_INTERVAL_MS);
    },
    [applyServerSeconds],
  );

  const stopIntervals = useCallback(() => {
    heartbeatGenRef.current++; // in-flight heartbeat 응답 무효화(종료/전환 시 stale 반영 방지)
    if (tickRef.current) clearInterval(tickRef.current);
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    tickRef.current = null;
    heartbeatRef.current = null;
  }, []);

  // 타이머 시작 (UA-P1-145)
  const handleStart = async () => {
    const result = await startTimerAction();
    if (!result) {
      // 시작 실패(예: 409 이미 실행/일시정지 중) → 현재 세션 재조회해 이어하기 제안(stuck 방지)
      const session = await fetchCurrentSessionAction();
      if (
        session &&
        (session.status === 'RUNNING' || session.status === 'PAUSED')
      ) {
        setResumeSession({
          sessionId: session.sessionId,
          startedAt: session.startedAt,
          studySeconds: session.accumulatedStudySeconds,
          status: session.status,
        });
        setSeconds(session.accumulatedStudySeconds);
        secondsRef.current = session.accumulatedStudySeconds;
      }
      return;
    }
    setSessionId(result.sessionId);
    setIsRunning(true);
    setIsPaused(false);
    setShowOverlay(true);
    setResumeSession(null);
    startTick();
    startHeartbeat(result.sessionId);
  };

  // 이어하기 — 학습 이탈 자동 종료 등으로 이미 끝난 세션이면 되살리지 않는다(재검증).
  const handleResume = async () => {
    if (!resumeSession) return;
    if (transitioningRef.current) return; // 연타 방지
    transitioningRef.current = true;
    try {
      // 'ended'(확정 종료)일 때만 배너 정리. 'unknown'(조회 실패)이면 살아있는 세션을 버리지 않고
      // 낙관적으로 재개한다(실제로 끝났다면 종료가 idempotent하게 정리).
      const probe = await probeSessionAction(resumeSession.sessionId);
      if (probe.state === 'ended') {
        setResumeSession(null);
        toast('이미 종료된 세션이에요. 새로 시작해 주세요.', {
          className: 'timer-toast',
          duration: 2000,
        });
        return;
      }
      // 재조회한 최신 status로 판단(resumeSession.status는 복원 시점 값이라 stale일 수 있음). 조회 실패(unknown)면 폴백.
      // PAUSED면 서버 RESUME(→RUNNING)부터. 실패하면 재개 안 함(가짜 재개=시간 유실 방지, §0.1) 배너 유지·재시도.
      // RUNNING이면 서버가 이미 도는 중 → tick만 재개.
      const status = probe.status ?? resumeSession.status;
      if (status === 'PAUSED') {
        const serverSeconds = await resumeTimerAction(resumeSession.sessionId);
        if (serverSeconds == null && !isMock('studyTimers')) {
          // live 재개 실패 → 재개 안 함(가짜 재개 금지). 배너 유지·재시도 가능.
          toast.error('재개에 실패했어요. 다시 시도해 주세요.', {
            className: 'timer-toast',
            duration: 2000,
          });
          return;
        }
        if (serverSeconds != null) applyServerSeconds(serverSeconds); // mock은 보정 없이 진행
      }
      setSessionId(resumeSession.sessionId);
      setIsRunning(true);
      setIsPaused(false);
      setShowOverlay(true);
      setResumeSession(null);
      startTick();
      startHeartbeat(resumeSession.sessionId);
    } finally {
      transitioningRef.current = false;
    }
  };

  // 일시정지 — 클라 인터벌 정지 + 서버 PAUSE 기록. BE가 정지 시점을 남겨 정지구간을 누적에서 제외한다.
  //  (라이브 검증 2026-07-11: PATCH /pause·/resume 200. 이전 C002/500 버그는 BE가 수정함.)
  //  서버가 확정한 누적 초로 표시를 보정. live에서 서버 실패 시 낙관적 정지를 취소해 계속 돌게 복구(§0.1).
  const handlePause = async () => {
    if (transitioningRef.current) return; // 연타 방지
    transitioningRef.current = true;
    setIsPaused(true);
    stopIntervals();
    try {
      if (!sessionId) return;
      const serverSeconds = await pauseTimerAction(sessionId);
      if (serverSeconds == null) {
        // mock=서버 없음 → 클라 정지 유지. live=서버 실패 → 세션은 RUNNING이라 낙관적 정지를 취소해
        // 다시 돌게 복구(정지된 채 재개도 막혀 stuck 되는 것 방지) + 안내.
        if (!isMock('studyTimers')) {
          setIsPaused(false);
          startTick();
          startHeartbeat(sessionId);
          toast.error('일시정지에 실패했어요. 다시 시도해 주세요.', {
            className: 'timer-toast',
            duration: 2000,
          });
        }
        return;
      }
      applyServerSeconds(serverSeconds);
    } finally {
      transitioningRef.current = false;
    }
  };

  // 재개 — 서버 RESUME 성공해야 인터벌 재가동. 실패하면 재개하지 않고(가짜 재개=시간 유실 방지, §0.1)
  //  정지 상태를 유지해 재시도하게 한다. 성공 시 서버 확정 누적초부터 이어 센다(정지구간 제외 반영).
  const handleResumeTimer = async () => {
    if (!sessionId) return;
    if (transitioningRef.current) return; // 연타 방지 — 인터벌 중복·서버 이중호출 차단
    transitioningRef.current = true;
    try {
      const serverSeconds = await resumeTimerAction(sessionId);
      if (serverSeconds == null && !isMock('studyTimers')) {
        // live 재개 실패 → 재개 안 함(가짜 재개=시간 유실 방지, §0.1). 정지 유지·재시도 가능.
        toast.error('재개에 실패했어요. 다시 시도해 주세요.', {
          className: 'timer-toast',
          duration: 2000,
        });
        return;
      }
      if (serverSeconds != null) applyServerSeconds(serverSeconds); // mock은 서버 보정 없이 진행
      setIsPaused(false);
      startTick();
      startHeartbeat(sessionId);
    } finally {
      transitioningRef.current = false;
    }
  };

  // 타이머 종료 (UA-P1-146)
  const handleEnd = async () => {
    const sid = sessionId ?? resumeSession?.sessionId;
    if (!sid) return;
    // pause/resume 전이가 in-flight면 종료를 인터리브하지 않는다(전이의 await 뒤 인터벌 재가동이 종료된
    // 세션에 좀비 tick/heartbeat를 되살리는 것 방지). 조용히 무시하지 않고 안내(§0.1) — 전이는 곧 끝난다.
    if (transitioningRef.current) {
      toast('처리 중이에요. 잠시 후 다시 눌러주세요.', {
        className: 'timer-toast',
        duration: 2000,
      });
      return;
    }
    transitioningRef.current = true;
    stopIntervals();
    try {
      const success = await endTimerAction(sid);
      if (success) {
        // 종료한 세션 시간을 '오늘 총' base에 낙관적으로 누적(재조회 없이 start→end→start 정합 유지).
        // 다음 마운트 시 /stats/daily 재조회로 정확값으로 대체됨.
        // base가 null(오늘 누적 조회 실패)이면 그대로 null 유지 — 세션분만 더해 '하루 총합'인 척하지 않는다.
        setDailyBaseSeconds((b) => (b === null ? null : b + secondsRef.current));
        setIsRunning(false);
        setIsPaused(false);
        setShowOverlay(false);
        setSessionId(null);
        setResumeSession(null);
        setSeconds(0);
        secondsRef.current = 0;
      } else if (isRunning && !isPaused) {
        // 종료 실패 → 세션은 서버에서 아직 RUNNING → 인터벌 재가동(패널이 멈춘 죽은 상태 방지, 재시도 가능)
        startTick();
        startHeartbeat(sid);
      }
    } finally {
      transitioningRef.current = false;
    }
  };

  // 오버레이 닫기 (ESC - 타이머는 계속 실행)
  const handleCloseOverlay = async () => {
    await handleEnd();
  };

  useEffect(() => {
    return () => stopIntervals();
  }, [stopIntervals]);

  if (isAuthPage || !isLoggedIn) return null;

  return (
    <>
      {/* 이어하기 배너 */}
      {resumeSession && !isRunning && (
        <div className="fixed bottom-20 left-1/2 z-40 w-full max-w-lg -translate-x-1/2 px-4">
          <CurrentSessionAlert
            startedAt={resumeSession.startedAt}
            onResume={handleResume}
            onEnd={handleEnd}
          />
        </div>
      )}

      {/* 하단 플로팅 학습 시작 버튼 */}
      {!isRunning && !resumeSession && (
        <button
          onClick={handleStart}
          className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
          style={{ backgroundColor: '#F97316' }}
        >
          <Image src="/icons/play.svg" alt="학습 시작" width={16} height={16} />
          학습 시작
        </button>
      )}

      {/* 타이머 실행 중 - 하단 미니 표시 버튼 */}
      {isRunning && !showOverlay && (
        <button
          onClick={() => setShowOverlay(true)}
          className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105"
          style={{ backgroundColor: '#F97316' }}
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
          {String(Math.floor(seconds / 3600)).padStart(2, '0')}:
          {String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')}:
          {String(seconds % 60).padStart(2, '0')}
        </button>
      )}

      {/* FocusModeOverlay */}
      {showOverlay && (
        <FocusModeOverlay
          seconds={seconds}
          todaySeconds={dailyBaseSeconds === null ? null : dailyBaseSeconds + seconds}
          isPaused={isPaused}
          onPause={handlePause}
          onResume={handleResumeTimer}
          onEnd={handleCloseOverlay}
        />
      )}
    </>
  );
}
