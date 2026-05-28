'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { getVideoPlayInfo } from '@/features/learning/services';

interface PreviewVideoModalProps {
  /** 미리보기 영상의 lessonId (videoId) — 백엔드 영상 재생 정보 조회에 사용 */
  lessonId: number;
  /** 모달 헤더에 표시할 영상 제목 */
  title: string;
  onClose: () => void;
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function PreviewVideoModal({ lessonId, title, onClose }: PreviewVideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsInstanceRef = useRef<unknown>(null);

  const [playUrl, setPlayUrl] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  /* lessonId로 영상 재생 정보 조회 — mock은 VIDEO_MOCK_MAP에서 playUrl 반환 */
  useEffect(() => {
    let cancelled = false;
    setPlayUrl(null);
    setLoadError(false);
    void getVideoPlayInfo(lessonId).then((res) => {
      if (cancelled) return;
      if (res.success) setPlayUrl(res.data.playUrl);
      else setLoadError(true);
    });
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  /* HLS 초기화 — playUrl 변경 시 (단순 버전, lastPosition/heartbeat 없음) */
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !playUrl) return;
    let cancelled = false;

    const setup = async () => {
      const isHls = playUrl.toLowerCase().includes('.m3u8');
      if (!isHls) {
        video.src = playUrl;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = playUrl;
      } else {
        const Hls = (await import('hls.js')).default;
        if (cancelled) return;
        if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(playUrl);
          hls.attachMedia(video);
          hlsInstanceRef.current = hls;
        } else {
          video.src = playUrl;
        }
      }
    };

    void setup();

    return () => {
      cancelled = true;
      const hls = hlsInstanceRef.current as { destroy?: () => void } | null;
      if (hls?.destroy) hls.destroy();
      hlsInstanceRef.current = null;
    };
  }, [playUrl]);

  /* video element 이벤트 ↔ state */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTime = () => setCurrentTime(video.currentTime);
    const onLoaded = () => setDuration(video.duration || 0);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('timeupdate', onTime);
    video.addEventListener('loadedmetadata', onLoaded);
    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('timeupdate', onTime);
      video.removeEventListener('loadedmetadata', onLoaded);
    };
  }, [playUrl]);

  /* ESC 키로 닫기 */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  };

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const newTime = Number(e.target.value);
    if (Number.isFinite(newTime)) {
      setCurrentTime(newTime);
      try {
        v.currentTime = newTime;
      } catch {}
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div
        className="w-[896px] h-[648px] bg-white rounded-2xl relative overflow-hidden flex flex-col"
        style={{
          boxShadow:
            '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 8px 10px -6px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Header (77px) — 타이틀 + 닫기 X */}
        <div
          className="flex items-center justify-between border-b border-[#E5E7EB]"
          style={{ height: 77, padding: '0 32px' }}
        >
          <h2 className="text-lg font-semibold text-[#1F2937]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="w-9 h-9 flex items-center justify-center rounded-2xl hover:bg-[#F3F4F6] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="#4B5563" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* 영상 영역 (504px) — #1F2937 배경 + HLS 플레이어 */}
        <div className="relative bg-[#1F2937] group" style={{ height: 504 }}>
          <video
            ref={videoRef}
            className="w-full h-full"
            playsInline
            preload="auto"
            onClick={togglePlay}
          />

          {/* 로딩 / 에러 / 정지 오버레이 */}
          {!playUrl && !loadError && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#1F2937] text-white/80 text-sm">
              영상을 불러오는 중...
            </div>
          )}
          {loadError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1F2937] text-white/80 text-sm gap-1">
              <span>미리보기 영상을 불러오지 못했습니다.</span>
            </div>
          )}
          {playUrl && !isPlaying && (
            <button
              type="button"
              onClick={togglePlay}
              aria-label="재생"
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/30 text-white/90"
            >
              <Image src="/icons/videoPlayOverlay.svg" alt="" width={80} height={80} />
              <span className="text-sm">미리보기 영상</span>
            </button>
          )}

          {/* 컨트롤바 — hover 시 표시 */}
          {playUrl && (
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <input
                type="range"
                min={0}
                max={Number.isFinite(duration) && duration > 0 ? duration : 1}
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
                    width={24}
                    height={24}
                  />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer (67px) — 안내 메시지 */}
        <div
          className="flex items-center justify-center bg-[#F8FAFC] border-t border-[#E5E7EB]"
          style={{ height: 67, padding: '0 32px' }}
        >
          <p className="text-sm text-[#4B5563]">
            이 강의를 모두 수강하려면 수강 신청이 필요합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
