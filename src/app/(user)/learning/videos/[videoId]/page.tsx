'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import VideoPlayer from '@/features/learning/components/VideoPlayer';
import CourseProgressSummary from '@/features/learning/components/CourseProgressSummary';
import LearningCurriculumSidebar from '@/features/learning/components/LearningCurriculumSidebar';
import ResumeControlPanel from '@/features/learning/components/ResumeControlPanel';
import ResumeWatchModal from '@/features/learning/components/ResumeWatchModal';
import VideoStatusModal from '@/features/learning/components/VideoStatusModal';
import TimerInfoModal from '@/features/learning/components/TimerInfoModal';
import {
  getVideoPlayInfo,
  getCourseProgress,
} from '@/features/learning/services';
import { getCourseDetail } from '@/features/courses/services';
import {
  startTimerAction,
  endTimerAction,
  heartbeatAction,
  fetchCurrentSessionAction,
} from '@/features/studyTimers/actions';
import type {
  VideoPlayInfo,
  CourseProgress,
  SidebarVideoItem,
} from '@/features/learning/types';
import type { CourseDetail } from '@/features/courses/types';

const HEARTBEAT_INTERVAL_MS = 60_000;

/** module-level cache — 페이지 navigation 간 마지막 정상 상태 유지 (page remount에도 살아남음) */
let lastValidVideoCache: VideoPlayInfo | null = null;
let lastValidProgressCache: CourseProgress | null = null;
let lastValidDetailCache: CourseDetail | null = null;

function formatStudyTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** 백엔드 progress.lessons + 강의 상세 curriculum (title/section/duration/isPreview) 머지 */
function mergeLessons(
  detail: CourseDetail | null,
  progress: CourseProgress | null,
): SidebarVideoItem[] {
  if (!detail) return [];
  const progressMap = new Map<number, { completed: boolean; lastPositionSeconds: number }>();
  progress?.lessons.forEach((l) =>
    progressMap.set(l.videoId, {
      completed: l.completed,
      lastPositionSeconds: l.lastPositionSeconds,
    }),
  );
  const result: SidebarVideoItem[] = [];
  detail.curriculum.forEach((section) => {
    section.lessons.forEach((lesson) => {
      const lp = progressMap.get(lesson.lessonId);
      const [m, s] = lesson.duration.split(':').map(Number);
      result.push({
        videoId: lesson.lessonId,
        title: lesson.title,
        sectionTitle: section.title,
        durationSeconds: (m ?? 0) * 60 + (s ?? 0),
        completed: lp?.completed ?? false,
        lastPositionSeconds: lp?.lastPositionSeconds ?? 0,
        isPreview: lesson.isPreview,
      });
    });
  });
  return result;
}

export default function LearningVideoPage() {
  const params = useParams<{ videoId: string }>();
  const router = useRouter();
  const videoId = Number(params?.videoId);

  const [video, setVideo] = useState<VideoPlayInfo | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [detail, setDetail] = useState<CourseDetail | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  /* module cache — page remount에도 마지막 정상 상태 유지 */
  useEffect(() => {
    if (video) lastValidVideoCache = video;
  }, [video]);
  useEffect(() => {
    if (progress) lastValidProgressCache = progress;
  }, [progress]);
  useEffect(() => {
    if (detail) lastValidDetailCache = detail;
  }, [detail]);

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

  /* 영상 + 강의 진도 + 강의 상세 조회 (강의 상세는 사이드바 title/section/duration용) */
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

      const [progRes, detailRes] = await Promise.all([
        getCourseProgress(videoRes.data.courseId),
        getCourseDetail(videoRes.data.courseId),
      ]);
      if (cancelled) return;
      if (progRes.success) setProgress(progRes.data);
      if (detailRes) setDetail(detailRes);
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [videoId]);

  /* 영상 변경 시 이어보기 모달 여부 결정.
   * 백엔드 video.lastPositionSec 기준 + localStorage 폴백 */
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
      video.lastPositionSec || 0,
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

  /* fetch 실패 시 이전 상태(module cache)로 UI 유지 */
  const displayVideo = video ?? lastValidVideoCache;
  const displayProgress = progress ?? lastValidProgressCache;
  const displayDetail = detail ?? lastValidDetailCache;
  const sidebarVideos = useMemo(
    () => mergeLessons(displayDetail, displayProgress),
    [displayDetail, displayProgress],
  );
  const currentLessonTitle = useMemo(
    () =>
      sidebarVideos.find((v) => v.videoId === displayVideo?.videoId)?.title ?? '',
    [sidebarVideos, displayVideo?.videoId],
  );

  /* 진도율 갱신 — 백엔드 응답이 void라 클라이언트에서 lessons completed 갱신 */
  const handleProgressChange = (rate: number) => {
    if (rate < 90 || !video) return;
    setProgress((prev) => {
      if (!prev) return prev;
      const nextLessons = prev.lessons.map((l) =>
        l.videoId === video.videoId ? { ...l, completed: true } : l,
      );
      const completedCount = nextLessons.filter((l) => l.completed).length;
      const newRate = nextLessons.length > 0
        ? (completedCount / nextLessons.length) * 100
        : 0;
      return {
        ...prev,
        lessons: nextLessons,
        completedLessonCount: completedCount,
        progressRate: newRate,
      };
    });
    if (!video.completed) setVideo({ ...video, completed: true });
  };

  /* 첫 진입 자체가 실패한 경우만 fallback */
  if (!displayVideo || !displayProgress || !displayDetail) {
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
        courseTitle={displayDetail.title}
        videoTitle={currentLessonTitle}
        instructorName={displayDetail.instructorName}
        progressRate={displayProgress.progressRate}
        completedVideoCount={displayProgress.completedLessonCount}
        totalVideoCount={displayProgress.totalLessonCount}
        backHref={`/courses/${displayVideo.courseId}`}
      />

      <div className="flex flex-1 min-h-0">
        <main className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 min-h-0 flex items-center justify-center bg-black">
            {playerReady && video ? (
              <VideoPlayer
                videoId={video.videoId}
                playUrl={video.streamingUrl}
                lastPositionSeconds={startPosition}
                durationSeconds={video.durationSeconds}
                isCompleted={video.completed}
                onProgressChange={handleProgressChange}
                onCompleted={() => video && setVideo({ ...video, completed: true })}
              />
            ) : (
              <div className="text-white/60 text-sm">잠시만 기다려주세요...</div>
            )}
          </div>

          <ResumeControlPanel
            videos={sidebarVideos}
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
          videos={sidebarVideos}
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
