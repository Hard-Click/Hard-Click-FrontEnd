'use client';

import { useEffect, useRef } from 'react';
import { toast } from '@/lib/toast';
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
    const res = await saveWatchTime(videoId, { watchTimeSeconds: delta });
    // 서버 저장 실패 시 localStorage를 앞서 갱신하지 않는다 — 실패한 delta까지 반영되면
    // 화면 진행률(로컬 기준)이 실제 백엔드 누적 watchTimeSeconds보다 앞서가 100%로 보여도
    // 완료 검증(90% 기준)을 통과 못 하는 불일치가 생긴다.
    if (!res.success) return;

    /* 클라이언트 측 누적 시청 시간(localStorage) — 백엔드 응답이 void이므로 progressRate는
     * (누적 watchTime / durationSeconds)으로 클라이언트에서 계산. lastPosition은 별도 키. */
    let totalWatchTime = delta;
    if (typeof window !== 'undefined') {
      const key = `learning:watchedSeconds:${videoId}`;
      const stored = Number(window.localStorage.getItem(key) || 0);
      totalWatchTime = (Number.isFinite(stored) ? stored : 0) + delta;
      window.localStorage.setItem(key, String(totalWatchTime));
    }

    /* 클라이언트 측 progressRate — 백엔드 응답에 progressRate 없어서 자체 계산 */
    const rate = durationSeconds > 0
      ? Math.min(100, (totalWatchTime / durationSeconds) * 100)
      : 0;
    onProgress?.(rate);

    /* 90% 이상 도달 시 1회 토스트 + 백엔드 완료 처리 호출 (body 없음).
     * 완료 검증은 백엔드에서 watchTimeSeconds >= ceil(duration * 0.9). */
    if (!milestoneFiredRef.current && rate >= 90) {
      milestoneFiredRef.current = true;
      toast.success('90% 이상 수강되었습니다.');
    }
    if (!completedFiredRef.current && rate >= 90) {
      // completeVideo 호출 전에 먼저 래치 — await 도중 다음 heartbeat이 겹쳐 들어와도
      // 중복 호출되지 않게 막는다. 90% 미달로 실패(409/L004)하면 롤백해 다음 heartbeat에서
      // 재시도 가능하게 한다(성공 시에만 래치하면 그 사이 겹친 두 번째 flush가 또 호출한다).
      completedFiredRef.current = true;
      const completeRes = await completeVideo(videoId);
      if (completeRes.success) {
        onCompleted?.();
      } else {
        completedFiredRef.current = false;
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
   * - 하드 내비(탭 닫기·새로고침 pagehide/beforeunload): 비동기 fetch를 끝낼 수 없고
   *   sendBeacon은 Authorization을 못 붙여 인증 실패 → localStorage에만 누적(데이터 보존).
   * - 소프트 내비(영상 변경·페이지 이동 unmount): fetch 가능 → flush로 BE에도 전송한다.
   *   ⚠️ 예전엔 여기서도 localStorage만 갱신해 BE 누적값이 실제보다 적었고, 끝까지 봐도
   *      BE watchTime이 90%에 못 미쳐 완료가 안 되는 버그가 있었다. flush는 localStorage+BE 동시 갱신. */
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
      /* 소프트 내비 unmount — 잔여 delta를 BE에 flush(localStorage+BE 동시 갱신) */
      if (playStartTimeRef.current) {
        const delta = Math.floor((Date.now() - playStartTimeRef.current) / 1000);
        playStartTimeRef.current = null;
        if (delta >= 1) void flush(delta);
      }
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
