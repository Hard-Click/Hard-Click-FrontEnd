'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { saveWatchTime, completeVideo } from '@/features/learning/services';

interface UseWatchTimeSaverOptions {
  videoId: number;
  durationSeconds: number;
  /** 현재 영상이 재생 중인지 — 재생 시작 시점에 startTime 기록, 정지 시 elapsed 전송 */
  isPlaying: boolean;
  /** PATCH 응답의 progressRate 콜백 (사이드바 갱신용) */
  onProgress?: (progressRate: number) => void;
  /** 90% 도달 → 백엔드 완료 처리 성공 시 콜백 */
  onCompleted?: () => void;
}

/**
 * 재생/정지 기반 시청 시간 누적 저장 hook.
 *
 * - 재생(play) 시점에 `playStartTime` 기록
 * - 정지(pause)/페이지 이탈 시 (현재시간 - playStartTime) 계산 → PATCH /watch-time
 * - 응답 progressRate ≥ 90 도달 시 1회 PATCH /progress/complete 호출
 */
export function useWatchTimeSaver({
  videoId,
  durationSeconds,
  isPlaying,
  onProgress,
  onCompleted,
}: UseWatchTimeSaverOptions) {
  const playStartTimeRef = useRef<number | null>(null);
  const completedFiredRef = useRef(false);
  const milestoneFiredRef = useRef(false);

  const flush = async (delta: number) => {
    if (delta < 1) return;
    /* 클라이언트 측 누적 시청 시간(localStorage) — 사이드바 진행률 폴백.
     * lastPosition은 드래그로도 변경되므로 별도 watchedSeconds 키 사용. */
    if (typeof window !== 'undefined') {
      const key = `learning:watchedSeconds:${videoId}`;
      const stored = Number(window.localStorage.getItem(key) || 0);
      const next = (Number.isFinite(stored) ? stored : 0) + delta;
      window.localStorage.setItem(key, String(next));
    }
    const res = await saveWatchTime(videoId, { watchedSecondsDelta: delta });
    if (!res.success) return;
    onProgress?.(res.data.progressRate);

    /* 90% 이상 도달 시 1회 토스트 + 백엔드 완료 처리 호출 */
    if (!milestoneFiredRef.current && res.data.progressRate >= 90) {
      milestoneFiredRef.current = true;
      toast.success('90% 이상 수강되었습니다.');
    }
    if (!completedFiredRef.current && res.data.progressRate >= 90) {
      completedFiredRef.current = true;
      const completeRes = await completeVideo(videoId, {
        watchedSeconds: res.data.watchedSeconds,
        durationSeconds,
      });
      if (completeRes.success && completeRes.data.isCompleted) {
        onCompleted?.();
      }
    }
  };

  /* 재생/정지 + 5초 heartbeat — 재생 중 5초마다 PATCH로 백엔드 동기화 */
  useEffect(() => {
    if (!isPlaying) {
      /* 정지 시점 — 잔여 elapsed flush */
      if (playStartTimeRef.current) {
        const delta = Math.floor((Date.now() - playStartTimeRef.current) / 1000);
        playStartTimeRef.current = null;
        if (delta >= 1) void flush(delta);
      }
      return;
    }
    playStartTimeRef.current = Date.now();
    /* 5초마다 heartbeat — 영상 안 멈춰도 백엔드 progressRate 갱신 */
    const heartbeat = setInterval(() => {
      if (!playStartTimeRef.current) return;
      const now = Date.now();
      const delta = Math.floor((now - playStartTimeRef.current) / 1000);
      if (delta >= 1) {
        playStartTimeRef.current = now;
        void flush(delta);
      }
    }, 5000);
    return () => clearInterval(heartbeat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  /* 페이지 이탈 / 영상 변경 시 잔여 시간 처리.
   * sendBeacon은 Authorization 헤더 못 붙여 백엔드 인증 실패 → 사용 X.
   * 대신 localStorage에 누적값 갱신 (다음 진입 시 saveWatchTime이 누적 동기화). */
  useEffect(() => {
    const handleUnload = () => {
      if (!playStartTimeRef.current) return;
      const delta = Math.floor((Date.now() - playStartTimeRef.current) / 1000);
      playStartTimeRef.current = null;
      if (delta < 1) return;
      if (typeof window !== 'undefined') {
        const key = `learning:watchedSeconds:${videoId}`;
        const stored = Number(window.localStorage.getItem(key) || 0);
        const next = (Number.isFinite(stored) ? stored : 0) + delta;
        window.localStorage.setItem(key, String(next));
      }
    };
    window.addEventListener('pagehide', handleUnload);
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('pagehide', handleUnload);
      window.removeEventListener('beforeunload', handleUnload);
      handleUnload();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  /* 영상 바뀌면 milestone/completed reset */
  useEffect(() => {
    milestoneFiredRef.current = false;
    completedFiredRef.current = false;
    playStartTimeRef.current = null;
  }, [videoId]);
}
