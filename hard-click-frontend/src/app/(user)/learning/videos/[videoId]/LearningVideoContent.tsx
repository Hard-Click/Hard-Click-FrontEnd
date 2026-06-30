'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import VideoPlayer from '@/features/learning/components/VideoPlayer';
import CourseProgressSummary from '@/features/learning/components/CourseProgressSummary';
import LearningCurriculumSidebar from '@/features/learning/components/LearningCurriculumSidebar';
import ResumeControlPanel from '@/features/learning/components/ResumeControlPanel';
import ResumeWatchModal from '@/features/learning/components/ResumeWatchModal';
import VideoStatusModal from '@/features/learning/components/VideoStatusModal';
import TimerInfoModal from '@/features/learning/components/TimerInfoModal';
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
      const vid = lesson.videoId ?? lesson.lessonId;
      const lp = progressMap.get(vid);
      const [m, s] = lesson.duration.split(':').map(Number);
      result.push({
        videoId: vid,
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

interface LearningVideoContentProps {
  initialVideo: VideoPlayInfo | null;
  initialProgress: CourseProgress | null;
  initialDetail: CourseDetail | null;
  initialErrorStatus: number | null;
}

export default function LearningVideoContent({
  initialVideo,
  initialProgress,
  initialDetail,
  initialErrorStatus,
}: LearningVideoContentProps) {
  const router = useRouter();

  // 데이터는 서버(page.tsx)에서 받아 초기값으로. 이후 상호작용으로만 변경(진도/완료 등).
  const [video, setVideo] = useState<VideoPlayInfo | null>(initialVideo);
  const [progress, setProgress] = useState<CourseProgress | null>(initialProgress);
  const [detail] = useState<CourseDetail | null>(initialDetail);
  const [errorStatus, setErrorStatus] = useState<number | null>(initialErrorStatus);

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
  /* 재생 중 5초 heartbeat마다 증가 — 사이드바가 localStorage 진행률을 실시간 재읽기하도록 트리거 */
  const [liveTick, setLiveTick] = useState(0);

  /* 타이머 confirm 모달 */
  const [timerConfirmMode, setTimerConfirmMode] = useState<'start' | 'end' | null>(null);

  /* 타이머 상태 */
  const [timerSessionId, setTimerSessionId] = useState<number | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerSecondsRef = useRef(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* 영상 변경 시 이어보기 모달 여부 결정.
   * 백엔드 video.lastPositionSec 기준 + localStorage 폴백 */
  useEffect(() => {
    if (!video) return;
    // 이어보기 판단은 localStorage(클라 전용)가 필요 → SSR 렌더 불가, 마운트 후 effect에서 init.
    /* eslint-disable react-hooks/set-state-in-effect */
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
    /* eslint-enable react-hooks/set-state-in-effect */
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

  const startTimerTicks = (sid: number) => {
    tickRef.current = setInterval(() => {
      timerSecondsRef.current += 1;
      setTimerSeconds((s) => s + 1);
    }, 1000);
    heartbeatRef.current = setInterval(async () => {
      // BE가 확정한 누적초로 보정 — 백그라운드 탭 throttle 등으로 1초 tick이 밀린
      // 화면-저장 드리프트를 해소한다(StudyTimerPanel과 동일).
      const serverSeconds = await heartbeatAction(sid);
      if (serverSeconds != null) {
        timerSecondsRef.current = serverSeconds;
        setTimerSeconds(serverSeconds);
      }
    }, HEARTBEAT_INTERVAL_MS);
  };

  const stopTimerTicks = () => {
    if (tickRef.current) clearInterval(tickRef.current);
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    tickRef.current = null;
    heartbeatRef.current = null;
  };

  /* 페이지 진입 시 실행 중 세션 복원 */
  useEffect(() => {
    fetchCurrentSessionAction().then((session) => {
      // RUNNING 세션만 복원 — PAUSED/ENDED 세션 위에 tick을 다시 돌리면
      // BE 누적과 화면이 어긋난다(StudyTimerPanel과 동일 가드).
      if (!session || session.status !== 'RUNNING') return;
      setTimerSessionId(session.sessionId);
      setTimerSeconds(session.accumulatedStudySeconds);
      timerSecondsRef.current = session.accumulatedStudySeconds;
      startTimerTicks(session.sessionId);
    });
    return () => stopTimerTicks();
  }, []);

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
      const ok = await endTimerAction(timerSessionId);
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

  /* 레슨 완료 갱신 — ⚠️ 백엔드 완료 검증(PATCH /progress/complete, watchTime ≥ 90%)을 통과해
   * completeVideo가 성공했을 때 useWatchTimeSaver의 onCompleted 콜백으로만 호출된다.
   * 클라이언트 추정 진도율(5초 카운터·영상 ended)로 '완료'를 만들지 않는다(§0.1 — 가짜 완료 방지).
   * 사이드바 lessons[].completed + 완료 개수 + 강의 진도율(완료 레슨/전체)을 함께 갱신. */
  const handleLessonCompleted = () => {
    if (!video) return;
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
            message=""
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
                onCompleted={handleLessonCompleted}
                onProgress={() => setLiveTick((t) => t + 1)}
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
          liveTick={liveTick}
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
          message=""
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
