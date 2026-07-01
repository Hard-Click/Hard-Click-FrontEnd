'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { toast } from '@/lib/toast';
import { useWatchTimeSaver } from '@/features/learning/hooks/useWatchTimeSaver';
import { saveLastPosition } from '@/features/learning/services';

interface VideoPlayerProps {
  videoId: number;
  playUrl: string;
  lastPositionSeconds: number;
  durationSeconds: number;
  isCompleted: boolean;
  /** 백엔드 완료 처리 성공 시 — 사이드바/요약 isCompleted=true 갱신용 */
  onCompleted?: () => void;
  /** 5초 heartbeat마다 갱신된 진행률(%) — 사이드바 실시간 반영용 */
  onProgress?: (progressRate: number) => void;
}

/** 볼륨 아이콘 — 디자이너가 넣어둔 videoVolume.svg(소리 ON) + 음소거(사선) 2-state.
 * 음소거(volume 0)일 때만 사선친 스피커를 인라인으로 표시한다. */
function VolumeDynamicIcon({ volume }: { volume: number }) {
  if (volume === 0) {
    return (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
        <polygon
          points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"
          fill="#FFFFFF"
          stroke="#FFFFFF"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />
        <line x1="16" y1="9" x2="22" y2="15" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="22" y1="9" x2="16" y2="15" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  return <Image src="/icons/videoVolume.svg" alt="" width={24} height={24} />;
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function VideoPlayer({
  videoId,
  playUrl,
  lastPositionSeconds,
  durationSeconds,
  isCompleted,
  onCompleted,
  onProgress,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsInstanceRef = useRef<unknown>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(durationSeconds);
  const [volume, setVolume] = useState(1);
  const restartToastFiredRef = useRef(false);

  useWatchTimeSaver({
    videoId,
    durationSeconds,
    isPlaying,
    onCompleted,
    onProgress,
  });

  /* localStorage에 마지막 위치 저장/복원 — mock 환경 이어보기 polyfill */
  const LAST_POS_KEY = `learning:lastPosition:${videoId}`;

  const resolveResumePosition = () => {
    /* localStorage 우선 — 사용자가 직접 본 마지막 위치 */
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem(LAST_POS_KEY);
      if (stored) {
        const sec = Number(stored);
        if (Number.isFinite(sec) && sec > 0) {
          /* 끝까지 봤으면 처음부터 */
          if (sec >= durationSeconds - 1) return 0;
          return sec;
        }
      }
    }
    /* 백엔드 응답에서 끝 위치면 처음부터 */
    if (isCompleted && lastPositionSeconds >= durationSeconds - 1) return 0;
    return lastPositionSeconds;
  };

  /* HLS 초기화 — hls.js 동적 import */
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !playUrl) return;

    let cancelled = false;
    restartToastFiredRef.current = false; // 영상 바뀔 때마다 reset

    const setup = async () => {
      const isHls = playUrl.toLowerCase().includes('.m3u8');
      /* 시작 위치 계산 — completed/이어보기 분기 (resume 0 ⇒ 처음부터) */
      const resume = resolveResumePosition();
      if (resume === 0 && isCompleted && !restartToastFiredRef.current) {
        restartToastFiredRef.current = true;
        toast.success('처음부터 재생됩니다.');
      }

      if (!isHls) {
        // mp4 등 일반 비디오 — native src
        video.src = playUrl;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS
        video.src = playUrl;
      } else {
        // 그 외 브라우저 HLS — hls.js (startPosition으로 manifest 단계에서 seek)
        const Hls = (await import('hls.js')).default;
        if (cancelled) return;
        if (Hls.isSupported()) {
          const hls = new Hls({ startPosition: resume });
          hls.loadSource(playUrl);
          hls.attachMedia(video);
          hlsInstanceRef.current = hls;
        } else {
          video.src = playUrl;
        }
      }

      /* fallback — canplay 시점에 currentTime 강제 + state 동기화 */
      const onCanPlay = () => {
        try {
          if (
            Number.isFinite(video.duration) &&
            resume > 0 &&
            resume <= video.duration &&
            Math.abs(video.currentTime - resume) > 1
          ) {
            video.currentTime = resume;
          }
        } catch {
          /* seek 실패 무시 */
        }
        /* state 동기화 — paused 상태에서도 진행바 위치 반영 */
        setCurrentTime(video.currentTime);
        setDuration(video.duration || durationSeconds);
        video.removeEventListener('canplay', onCanPlay);
      };
      video.addEventListener('canplay', onCanPlay);
    };

    void setup();

    return () => {
      cancelled = true;
      const hls = hlsInstanceRef.current as { destroy?: () => void } | null;
      if (hls?.destroy) hls.destroy();
      hlsInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playUrl]);

  /* video element 이벤트 ↔ state + 실시간 진도율/이어보기 저장 */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    /* 마지막 위치 저장 — localStorage 즉시 갱신 + 백엔드 PATCH /progress/position */
    const persistLastPosition = (position: number) => {
      if (!Number.isFinite(position) || position <= 0) return;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(LAST_POS_KEY, String(position));
      }
      void saveLastPosition(videoId, {
        positionSeconds: Math.floor(position),
      });
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => {
      setIsPlaying(false);
      /* 일시정지 시점에 마지막 위치 저장 (백엔드 + localStorage) */
      persistLastPosition(video.currentTime);
    };
    const onSeeked = () => {
      /* seek 완료 시점에 state 동기화 */
      setCurrentTime(video.currentTime);
    };
    const onTime = () => {
      /* 재생바 위치만 동기화 — 진행률은 시청 누적 시간 기준이므로 여기서 계산 X.
       * 사이드바 진행률은 useWatchTimeSaver가 정지/이탈 시 PATCH 응답으로 갱신. */
      setCurrentTime(video.currentTime);
    };
    const onLoaded = () => setDuration(video.duration || durationSeconds);
    const onVolume = () => setVolume(video.volume);
    const onEnded = () => {
      /* 영상 종료 = 마지막 위치만 저장. '완료'는 useWatchTimeSaver가 watch-time을 누적해
       * 백엔드 완료 검증(completeVideo)을 통과해야만 처리한다(§0.1 — 끝까지 안 봐도 완료되는 위조 방지). */
      persistLastPosition(video.duration);
    };
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('timeupdate', onTime);
    video.addEventListener('loadedmetadata', onLoaded);
    video.addEventListener('volumechange', onVolume);
    video.addEventListener('ended', onEnded);
    video.addEventListener('seeked', onSeeked);
    return () => {
      /* 언마운트 시점 마지막 위치 저장 (백엔드 + localStorage) */
      persistLastPosition(video.currentTime);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('timeupdate', onTime);
      video.removeEventListener('loadedmetadata', onLoaded);
      video.removeEventListener('volumechange', onVolume);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('seeked', onSeeked);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durationSeconds, videoId]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  };

  const restartFromBeginning = () => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    toast.success('처음부터 재생됩니다.');
  };

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const newTime = Number(e.target.value);
    if (Number.isFinite(newTime)) {
      setCurrentTime(newTime); // 점 위치 즉시 갱신
      try {
        v.currentTime = newTime; // HLS 영상은 fragment 새로 로드
      } catch {
        /* seek 실패 무시 */
      }
    }
  };

  const onVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = Number(e.target.value);
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void el.requestFullscreen();
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-full max-h-full aspect-video bg-black overflow-hidden group"
    >
      <video
        ref={videoRef}
        className="w-full h-full"
        playsInline
        preload="auto"
        onClick={togglePlay}
      />

      {/* 정지 상태 오버레이 — 클릭 시 재생 */}
      {!isPlaying && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label="재생"
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40 text-white/90"
        >
          <Image src="/icons/videoPlayOverlay.svg" alt="" width={96} height={96} />
          <span className="text-sm">재생</span>
        </button>
      )}

      {/* 컨트롤바 */}
      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        {/* 진행 바 */}
        <input
          type="range"
          min={0}
          max={Number.isFinite(duration) && duration > 0 ? duration : durationSeconds || 1}
          step={1}
          value={Number.isFinite(currentTime) ? currentTime : 0}
          onChange={onSeek}
          className="w-full h-1 cursor-pointer accent-[#2F5DAA]"
        />

        <div className="flex items-center justify-between mt-2 text-white text-xs">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <button type="button" onClick={togglePlay} aria-label={isPlaying ? '일시정지' : '재생'}>
            <Image
              src={isPlaying ? '/icons/videoPause.svg' : '/icons/videoPlay.svg'}
              alt=""
              width={28}
              height={28}
            />
          </button>
          <button type="button" onClick={restartFromBeginning} aria-label="처음부터 재생">
            <Image src="/icons/videoReplay.svg" alt="" width={28} height={28} />
          </button>
          <div className="flex items-center gap-2 h-7 px-1">
            <VolumeDynamicIcon volume={volume} />
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={onVolumeChange}
              className="volume-slider w-[96px] cursor-pointer"
            />
          </div>
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label="전체화면"
            className="ml-auto"
          >
            <Image src="/icons/videoFullscreen.svg" alt="" width={24} height={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
