'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  startTimerAction,
  endTimerAction,
  heartbeatAction,
  fetchCurrentSessionAction,
} from '../actions';
import FocusModeOverlay from './FocusModeOverlay';
import CurrentSessionAlert from './CurrentSessionAlert';
import { useAuth } from '@/features/auth/AuthProvider';

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
  const [todaySeconds, setTodaySeconds] = useState(0);
  const [resumeSession, setResumeSession] = useState<{
    sessionId: number;
    startedAt: string;
    studySeconds: number;
  } | null>(null);

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const secondsRef = useRef(0);

  // 페이지 진입 시 실행 중인 세션 복원 — RUNNING만 이어하기 대상(PAUSED·ENDED는 tick 금지)
  useEffect(() => {
    fetchCurrentSessionAction().then((session) => {
      if (session && session.status === 'RUNNING') {
        setResumeSession({
          sessionId: session.sessionId,
          startedAt: session.startedAt,
          studySeconds: session.accumulatedStudySeconds,
        });
        setSeconds(session.accumulatedStudySeconds);
        secondsRef.current = session.accumulatedStudySeconds;
      }
    });
  }, []);

  const startTick = useCallback(() => {
    tickRef.current = setInterval(() => {
      secondsRef.current += 1;
      setSeconds((s) => s + 1);
      setTodaySeconds((s) => s + 1);
    }, 1000);
  }, []);

  const startHeartbeat = useCallback((sid: number) => {
    heartbeatRef.current = setInterval(async () => {
      const serverSeconds = await heartbeatAction(sid);
      // 서버가 확정한 누적시간으로 로컬 카운터 보정 — 백그라운드 탭 throttle 등 드리프트 해소
      if (serverSeconds != null) {
        secondsRef.current = serverSeconds;
        setSeconds(serverSeconds);
      }
    }, HEARTBEAT_INTERVAL_MS);
  }, []);

  const stopIntervals = useCallback(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    tickRef.current = null;
    heartbeatRef.current = null;
  }, []);

  // 타이머 시작 (UA-P1-145)
  const handleStart = async () => {
    const result = await startTimerAction();
    if (!result) {
      // 시작 실패(예: 409 이미 실행 중) → 현재 세션 재조회해 이어하기 제안(stuck 방지)
      const session = await fetchCurrentSessionAction();
      if (session && session.status === 'RUNNING') {
        setResumeSession({
          sessionId: session.sessionId,
          startedAt: session.startedAt,
          studySeconds: session.accumulatedStudySeconds,
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

  // 이어하기
  const handleResume = () => {
    if (!resumeSession) return;
    setSessionId(resumeSession.sessionId);
    setIsRunning(true);
    setIsPaused(false);
    setShowOverlay(true);
    setResumeSession(null);
    startTick();
    startHeartbeat(resumeSession.sessionId);
  };

  // 일시정지 — 클라 인터벌만 정지(서버 pause 호출 안 함).
  // ⚠️ BE PATCH /pause는 현재 C002(500) 버그라 호출 불가(라이브 검증 2026-06-25). 또한 BE는 경과시간
  //   기준으로 누적해서, 정지 중 heartbeat가 멈춰도 종료 시 정지구간이 누적될 수 있다. BE pause 수정되면
  //   여기서 서버 pause/resume을 호출해 정지구간을 정확히 제외할 것. [BE 요청 대상]
  const handlePause = () => {
    setIsPaused(true);
    stopIntervals();
  };

  // 재개
  const handleResumeTimer = () => {
    if (!sessionId) return;
    setIsPaused(false);
    startTick();
    startHeartbeat(sessionId);
  };

  // 타이머 종료 (UA-P1-146)
  const handleEnd = async () => {
    const sid = sessionId ?? resumeSession?.sessionId;
    if (!sid) return;
    stopIntervals();
    const success = await endTimerAction(sid);
    if (success) {
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
          todaySeconds={todaySeconds}
          isPaused={isPaused}
          onPause={handlePause}
          onResume={handleResumeTimer}
          onEnd={handleCloseOverlay}
        />
      )}
    </>
  );
}
