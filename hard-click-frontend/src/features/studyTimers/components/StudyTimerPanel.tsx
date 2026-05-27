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

// Heartbeat 간격: 60초마다 서버에 저장 (UA-P1-147)
const HEARTBEAT_INTERVAL_MS = 60_000;

const AUTH_PATHS = ['/auth', '/community/new'];

export default function StudyTimerPanel() {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.some((path) => pathname.startsWith(path));

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

  // 페이지 진입 시 실행 중인 세션 복원
  useEffect(() => {
    fetchCurrentSessionAction().then((session) => {
      if (session) {
        setResumeSession({
          sessionId: session.sessionId,
          startedAt: session.startedAt,
          studySeconds: session.studySeconds,
        });
        setSeconds(session.studySeconds);
        secondsRef.current = session.studySeconds;
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
      await heartbeatAction(sid, secondsRef.current);
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
    if (!result) return;
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

  // 일시정지
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
    const success = await endTimerAction(sid, secondsRef.current);
    if (success) {
      setIsRunning(false);
      setIsPaused(false);
      setShowOverlay(false);
      setSessionId(null);
      setResumeSession(null);
      setSeconds(0);
      secondsRef.current = 0;
    }
  };

  // 오버레이 닫기 (ESC - 타이머는 계속 실행)
  const handleCloseOverlay = async () => {
    await handleEnd();
  };

  useEffect(() => {
    return () => stopIntervals();
  }, [stopIntervals]);

  if (isAuthPage) return null;

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
