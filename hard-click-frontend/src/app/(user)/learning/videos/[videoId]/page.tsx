'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import VideoPlayer from '@/features/learning/components/VideoPlayer';
import CourseProgressSummary from '@/features/learning/components/CourseProgressSummary';
import LearningCurriculumSidebar from '@/features/learning/components/LearningCurriculumSidebar';
import ResumeControlPanel from '@/features/learning/components/ResumeControlPanel';
import VideoErrorState from '@/features/learning/components/VideoErrorState';
import ResumeWatchModal from '@/features/learning/components/ResumeWatchModal';
import VideoStatusModal from '@/features/learning/components/VideoStatusModal';
import TimerInfoModal from '@/features/learning/components/TimerInfoModal';
import { getVideoPlayInfo, getCourseProgress } from '@/features/learning/services';
import {
  startTimerAction,
  endTimerAction,
  heartbeatAction,
  fetchCurrentSessionAction,
} from '@/features/studyTimers/actions';
import type { VideoPlayInfo, CourseProgress } from '@/features/learning/types';

const HEARTBEAT_INTERVAL_MS = 60_000;

/** module-level cache — 페이지 navigation 간 마지막 정상 영상 유지 (page remount에도 살아남음) */
let lastValidVideoCache: VideoPlayInfo | null = null;
let lastValidProgressCache: CourseProgress | null = null;

function formatStudyTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function LearningVideoPage() {
  const params = useParams<{ videoId: string }>();
  const router = useRouter();
  const videoId = Number(params?.videoId);

  const [video, setVideo] = useState<VideoPlayInfo | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  /* 이전 영상/진도 백업 — module-level cache 사용 (page remount 시에도 유지) */
  useEffect(() => {
    if (video) lastValidVideoCache = video;
  }, [video]);
  useEffect(() => {
    if (progress) lastValidProgressCache = progress;
  }, [progress]);

  /* 이어보기 모달 */
  const [resumePromptOpen, setResumePromptOpen] = useState(false);
  const [startPosition, setStartPosition] = useState(0);
  const [playerReady, setPlayerReady] = useState(false);

  /* 타이머 confirm 모달 */
  const [timerConfirmMode, setTimerConfirmMode] = useState<'start' | 'end' | null>(null);

  /* 타이머 상태 */
  const [timerSessionId, setTimerSessionId] = useState<number | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerSecondsRef = useRef(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* 영상 + 강의 진도 조회 */
  useEffect(() => {
    if (!Number.isFinite(videoId)) {
      setErrorStatus(404);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setErrorStatus(null);
      const videoRes = await getVideoPlayInfo(videoId);
      if (cancelled) return;
      if (!videoRes.success) {
        setErrorStatus(videoRes.httpStatus);
        setErrorMessage(videoRes.message ?? '');
        return;
      }
      setVideo(videoRes.data);

      const progRes = await getCourseProgress(videoRes.data.courseId);
      if (cancelled) return;
      if (progRes.success) setProgress(progRes.data);
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [videoId]);

  /* 영상 변경 시(videoId) 이어보기 모달 여부 결정.
   * 이전 시청 기록 (localStorage 또는 백엔드 lastPositionSeconds) > 0 이면 모달 */
  useEffect(() => {
    if (!video) return;
    setPlayerReady(false);
    setResumePromptOpen(false);

    const stored = typeof window !== 'undefined'
      ? window.localStorage.getItem(`learning:lastPosition:${video.videoId}`)
      : null;
    const storedSec = stored ? Number(stored) : 0;
    const lastSec = Math.max(
      Number.isFinite(storedSec) ? storedSec : 0,
      video.lastPositionSeconds || 0,
    );

    /* 끝까지 본 영상은 처음부터 자동 (모달 X) */
    if (lastSec >= video.durationSeconds - 1) {
      setStartPosition(0);
      setPlayerReady(true);
      toast.success('처음부터 재생됩니다.');
      return;
    }

    /* 의미 있는 시청 기록 (5초 이상) 있으면 모달 */
    if (lastSec >= 5) {
      setStartPosition(lastSec);
      setResumePromptOpen(true);
      return;
    }

    /* 미시청 또는 시청 시간 5초 미만 → 처음부터 자동 */
    setStartPosition(0);
    setPlayerReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video?.videoId]);

  const handleResume = () => {
    setResumePromptOpen(false);
    setPlayerReady(true);
  };

  const handleRestart = () => {
    if (typeof window !== 'undefined' && video) {
      window.localStorage.removeItem(`learning:lastPosition:${video.videoId}`);
    }
    setStartPosition(0);
    setResumePromptOpen(false);
    setPlayerReady(true);
  };

  /* 페이지 진입 시 실행 중 세션 복원 */
  useEffect(() => {
    fetchCurrentSessionAction().then((session) => {
      if (!session) return;
      setTimerSessionId(session.sessionId);
      setTimerSeconds(session.studySeconds);
      timerSecondsRef.current = session.studySeconds;
      startTimerTicks(session.sessionId);
    });
    return () => stopTimerTicks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startTimerTicks = (sid: number) => {
    tickRef.current = setInterval(() => {
      timerSecondsRef.current += 1;
      setTimerSeconds((s) => s + 1);
    }, 1000);
    heartbeatRef.current = setInterval(() => {
      void heartbeatAction(sid, timerSecondsRef.current);
    }, HEARTBEAT_INTERVAL_MS);
  };

  const stopTimerTicks = () => {
    if (tickRef.current) clearInterval(tickRef.current);
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    tickRef.current = null;
    heartbeatRef.current = null;
  };

  /* 타이머 시작/종료 — 버튼 클릭 시 confirm 모달 표시 → 확인 시 실제 동작 */
  const handleTimerStartClick = () => {
    if (timerSessionId) return;
    setTimerConfirmMode('start');
  };

  const handleTimerEndClick = () => {
    if (!timerSessionId) return;
    setTimerConfirmMode('end');
  };

  const handleTimerConfirm = async () => {
    if (timerConfirmMode === 'start') {
      setTimerConfirmMode(null);
      const res = await startTimerAction();
      if (!res) return;
      setTimerSessionId(res.sessionId);
      setTimerSeconds(0);
      timerSecondsRef.current = 0;
      startTimerTicks(res.sessionId);
      toast.success('타이머가 켜졌습니다.');
    } else if (timerConfirmMode === 'end') {
      setTimerConfirmMode(null);
      if (!timerSessionId) return;
      stopTimerTicks();
      const ok = await endTimerAction(timerSessionId, timerSecondsRef.current);
      if (!ok) return;
      setTimerSessionId(null);
      setTimerSeconds(0);
      timerSecondsRef.current = 0;
      toast.success('타이머가 종료되었습니다.');
    }
  };

  /* 현재 영상 메타 */
  const currentVideoItem = useMemo(() => {
    if (!progress || !video) return null;
    return progress.videos.find((v) => v.videoId === video.videoId) ?? null;
  }, [progress, video]);

  /* 진도율 갱신 — 진행률은 단조 증가 (클라이언트/백엔드 두 콜백 충돌 방지) */
  const handleProgressChange = (rate: number) => {
    setProgress((prev) => {
      if (!prev || !video) return prev;
      const nextVideos = prev.videos.map((v) =>
        v.videoId === video.videoId
          ? {
              ...v,
              /* 완료된 영상은 100 고정. 그 외엔 이전 값과 새 값 중 큰 값 (감소 방지) */
              progressRate: v.isCompleted ? 100 : Math.max(v.progressRate, rate),
              isCompleted: v.isCompleted || rate >= 90,
            }
          : v,
      );
      const completedCount = nextVideos.filter((v) => v.isCompleted).length;
      const overall =
        nextVideos.reduce((sum, v) => sum + v.progressRate, 0) / nextVideos.length;
      return {
        ...prev,
        videos: nextVideos,
        completedVideoCount: completedCount,
        progressRate: overall,
      };
    });

    if (rate >= 100 && video && !video.isCompleted) {
      setVideo({ ...video, isCompleted: true });
    }
  };

  /* fetch 실패 시 이전 영상/진도(module cache)로 UI 유지 */
  const displayVideo = video ?? lastValidVideoCache;
  const displayProgress = progress ?? lastValidProgressCache;

  /* 첫 진입 자체가 실패한 경우만 fallback (이전 영상도 없을 때) */
  if (!displayVideo || !displayProgress) {
    if (errorStatus !== null) {
      return (
        <div className="min-h-screen bg-[#1F2937]">
          <VideoStatusModal
            status={errorStatus}
            message={errorMessage}
            onClose={() => router.back()}
          />
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-[#1F2937] flex items-center justify-center text-white/60">
        강의 정보를 불러오는 중...
      </div>
    );
  }

  const timerRunning = timerSessionId !== null;

  return (
    <div className="h-[calc(100vh-64px)] bg-[#1F2937] flex flex-col overflow-hidden">
      <CourseProgressSummary
        courseTitle={displayProgress.courseTitle ?? `강의 #${displayVideo.courseId}`}
        videoTitle={displayVideo.title}
        instructorName={displayProgress.instructorName ?? '강사'}
        progressRate={displayProgress.progressRate}
        completedVideoCount={displayProgress.completedVideoCount}
        totalVideoCount={displayProgress.totalVideoCount}
        backHref={`/courses/${displayVideo.courseId}`}
      />

      <div className="flex flex-1 min-h-0">
        <main className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 min-h-0 flex items-center justify-center bg-black">
            {playerReady && video ? (
              <VideoPlayer
                videoId={video.videoId}
                playUrl={video.playUrl}
                lastPositionSeconds={startPosition}
                durationSeconds={video.durationSeconds}
                isCompleted={video.isCompleted}
                onProgressChange={handleProgressChange}
                onCompleted={() => video && setVideo({ ...video, isCompleted: true })}
              />
            ) : (
              <div className="text-white/60 text-sm">잠시만 기다려주세요...</div>
            )}
          </div>

          <ResumeControlPanel
            videos={displayProgress.videos}
            currentVideoId={displayVideo.videoId}
          />

          {/* 좌하단 타이머 영역 */}
          <div className="bg-[#111827] border-t border-[#374151] px-6 py-[14px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#2F5DAA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6V12L16 14" />
                </svg>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-[#9CA3AF]">오늘 순공시간</span>
                  <span className="text-2xl font-semibold text-white leading-8">
                    {formatStudyTime(timerSeconds)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={timerRunning ? handleTimerEndClick : handleTimerStartClick}
                className="px-6 h-12 bg-[#2F5DAA] hover:bg-[#1D3E75] rounded-[10px] text-base font-semibold text-white transition-colors"
              >
                {timerRunning ? '타이머 종료' : '타이머 시작'}
              </button>
            </div>
          </div>
        </main>

        <LearningCurriculumSidebar
          videos={displayProgress.videos}
          currentVideoId={displayVideo.videoId}
        />
      </div>

      {resumePromptOpen && (
        <ResumeWatchModal
          lastPositionSeconds={startPosition}
          onResume={handleResume}
          onRestart={handleRestart}
        />
      )}

      {timerConfirmMode && (
        <TimerInfoModal
          mode={timerConfirmMode}
          onCancel={() => setTimerConfirmMode(null)}
          onConfirm={handleTimerConfirm}
        />
      )}

      {errorStatus !== null && (
        <VideoStatusModal
          status={errorStatus}
          message={errorMessage}
          onClose={() => {
            setErrorStatus(null);
            /* 이전 영상이 있으면 그 URL로 복귀, 없으면 뒤로 가기 */
            if (lastValidVideoCache) {
              router.replace(`/learning/videos/${lastValidVideoCache.videoId}`);
            } else {
              router.back();
            }
          }}
        />
      )}
    </div>
  );
}
