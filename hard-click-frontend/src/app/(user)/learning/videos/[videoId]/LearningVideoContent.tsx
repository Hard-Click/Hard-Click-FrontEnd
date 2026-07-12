'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/toast';
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
  resumeTimerAction,
  fetchCurrentSessionAction,
} from '@/features/studyTimers/actions';
import { markSessionLeaving } from '@/features/studyTimers/leaveSignal';
import { isMock } from '@/mocks/config';
import type {
  VideoPlayInfo,
  CourseProgress,
  SidebarVideoItem,
} from '@/features/learning/types';
import type { CourseDetail } from '@/features/courses/types';

const HEARTBEAT_INTERVAL_MS = 60_000;
// 레슨 전환(key={videoId} remount)으로 언마운트→재마운트되는 짧은 틈. 이 시간 안에 새 인스턴스가
// 마운트되면 end를 취소한다(=레슨 전환). 지나도 재마운트 없으면 진짜 이탈로 보고 end.
const LESSON_SWITCH_GRACE_MS = 300;

/** module-level cache — 페이지 navigation 간 마지막 정상 상태 유지 (page remount에도 살아남음) */
let lastValidVideoCache: VideoPlayInfo | null = null;
let lastValidProgressCache: CourseProgress | null = null;
let lastValidDetailCache: CourseDetail | null = null;

/** 레슨 전환(page key={videoId} remount) 시엔 end 예약을 취소해 세션 유지, 진짜 학습 이탈 시에만 end. */
let pendingSessionEnd: ReturnType<typeof setTimeout> | null = null;

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
  // heartbeat 세대 — 종료/재시작 시 증가. 이전 세션의 in-flight heartbeat 응답이 새 세션 시간을 덮어쓰지 않게.
  const timerGenRef = useRef(0);

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
    if (tickRef.current) clearInterval(tickRef.current); // 멱등 — 중복 인터벌·누수 방지
    tickRef.current = setInterval(() => {
      timerSecondsRef.current += 1;
      setTimerSeconds((s) => s + 1);
    }, 1000);
    if (heartbeatRef.current) clearInterval(heartbeatRef.current); // 멱등
    const gen = ++timerGenRef.current; // 이 heartbeat 세대 캡처
    heartbeatRef.current = setInterval(async () => {
      // BE 확정 누적초로 보정 — 응답 도착 시 세션이 바뀌었으면(세대 불일치) 무시(stale 덮어쓰기 방지).
      const serverSeconds = await heartbeatAction(sid);
      if (serverSeconds != null && timerGenRef.current === gen) {
        timerSecondsRef.current = serverSeconds;
        setTimerSeconds(serverSeconds);
      }
    }, HEARTBEAT_INTERVAL_MS);
  };

  const stopTimerTicks = () => {
    timerGenRef.current++; // in-flight heartbeat 응답 무효화(종료/전환 시 stale 반영 방지)
    if (tickRef.current) clearInterval(tickRef.current);
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    tickRef.current = null;
    heartbeatRef.current = null;
  };

  // 언마운트 cleanup 클로저는 초기값(null)만 캡처하므로 최신 sessionId를 ref로 미러링.
  const timerSessionIdRef = useRef<number | null>(null);
  useEffect(() => {
    timerSessionIdRef.current = timerSessionId;
  }, [timerSessionId]);

  /* 하드 nav·새로고침·탭 닫기 — 페이지 unload 땐 아래 setTimeout 종료가 안 먹으므로 keepalive fetch로
   * 즉시 종료 요청해 저장을 보장한다(keepalive는 unload 후에도 전송 유지. sendBeacon은 POST만이라 PATCH엔 부적합).
   * 동일출처 /api/* → BFF 프록시가 httpOnly 쿠키로 인증. mock에선 실세션 없어 skip. */
  useEffect(() => {
    const endOnUnload = (e: PageTransitionEvent) => {
      // bfcache 진입(뒤로/앞으로 캐시 — 복귀 가능)은 종료하지 않는다. 종료하면 복귀 시 얼린 인터벌이
      // 끝난 세션 위에서 되살아나 화면 시간만 오르는 좀비(§0.1-2 가짜 수치)가 된다.
      if (e.persisted) return;
      if (isMock('studyTimers')) return;
      const sid = timerSessionIdRef.current;
      if (sid == null) return;
      try {
        void fetch(`/api/study-timers/sessions/${sid}/end`, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ endedAt: new Date().toISOString() }),
          keepalive: true,
        });
      } catch {
        /* unload 중 실패는 무시 */
      }
    };
    window.addEventListener('pagehide', endOnUnload);
    return () => window.removeEventListener('pagehide', endOnUnload);
  }, []);

  /* 페이지 진입 시 실행 중 세션 복원 */
  useEffect(() => {
    // 직전 인스턴스(레슨 전환 remount)가 예약한 세션 end 취소 → 레슨 바꿀 땐 세션 유지.
    if (pendingSessionEnd) {
      clearTimeout(pendingSessionEnd);
      pendingSessionEnd = null;
      markSessionLeaving(null); // 레슨 전환(remount) = 이탈 아님 → 이탈 신호 해제
    }
    fetchCurrentSessionAction().then((session) => {
      // RUNNING 세션만 복원 — PAUSED/ENDED 세션 위에 tick을 다시 돌리면
      // BE 누적과 화면이 어긋난다(StudyTimerPanel과 동일 가드).
      if (!session || session.status !== 'RUNNING') return;
      setTimerSessionId(session.sessionId);
      setTimerSeconds(session.accumulatedStudySeconds);
      timerSecondsRef.current = session.accumulatedStudySeconds;
      startTimerTicks(session.sessionId);
    });
    return () => {
      stopTimerTicks();
      // 학습 이탈 시 순공 세션 end → 경과분이 daily_study_stats에 저장돼 마이페이지 오늘순공·랭킹 순공 반영.
      // 단 페이지가 key={videoId}라 레슨마다 remount → end를 잠깐 예약하고, 곧 새 인스턴스가 마운트되면
      // (=레슨 전환) 위 effect에서 취소한다. 재마운트 없는 진짜 이탈일 때만 end 실행(소프트 nav).
      // (하드 nav·새로고침·탭 닫기는 위 pagehide keepalive가 담당.)
      const sid = timerSessionIdRef.current;
      if (sid != null) {
        markSessionLeaving(sid); // 전역 배너가 이 세션엔 "이어하기"를 안 띄우게(곧 종료됨, 이중관리 방지)
        pendingSessionEnd = setTimeout(() => {
          // 종료 완료(성공/실패) 시 이탈 신호 해제 — TTL은 hang 대비 failsafe. 실패면 신호 풀려 다음 진입 때
          // 미아 세션이 배너로 다시 보인다(숨긴 채 방치 방지).
          void endTimerAction(sid).finally(() => markSessionLeaving(null));
          pendingSessionEnd = null;
        }, LESSON_SWITCH_GRACE_MS);
      }
    };
  }, []);

  const handleTimerStartClick = () => {
    if (timerSessionId) return;
    setTimerConfirmMode('start');
  };

  const handleTimerEndClick = () => {
    if (!timerSessionId) return;
    setTimerConfirmMode('end');
  };

  const confirmInFlightRef = useRef(false);
  const handleTimerConfirm = async () => {
    // 이중 confirm 방지 — 서버 왕복(start/resume/end) 중 모달 재오픈으로 재진입해 세션이 이중 생성되거나
    // 상태가 꼬이는 것을 차단(StudyTimerPanel의 transitioningRef 패턴 이식). learning엔 전역 잠금이 없음.
    if (confirmInFlightRef.current) return;
    confirmInFlightRef.current = true;
    try {
      if (timerConfirmMode === 'start') {
        setTimerConfirmMode(null);
        // 이미 활성(RUNNING/PAUSED) 세션이 있으면 새로 만들지 않고 이어받는다. learning 라우트는 전역
        // 이어하기 배너가 숨겨져 있어(layout TIMER_HIDDEN_PATTERNS), 여기서 안 살리면 409로 막다른 길이 된다.
        // PAUSED면 서버 RESUME(→RUNNING)하고 서버 확정 누적초부터 이어 켠다.
        const existing = await fetchCurrentSessionAction();
        if (
          existing &&
          (existing.status === 'RUNNING' || existing.status === 'PAUSED')
        ) {
          let accumulated = existing.accumulatedStudySeconds;
          if (existing.status === 'PAUSED') {
            const resumed = await resumeTimerAction(existing.sessionId);
            if (resumed == null) {
              // 재개 실패 → 서버 PAUSED 유지. 켜진 척(가짜 성공) 금지(§0.1) — 안내 후 중단, 재시도 가능.
              toast.error('세션 재개에 실패했어요. 다시 시도해 주세요.');
              return;
            }
            accumulated = resumed;
          }
          setTimerSessionId(existing.sessionId);
          setTimerSeconds(accumulated);
          timerSecondsRef.current = accumulated;
          startTimerTicks(existing.sessionId);
          toast.success('이전 순공 세션을 이어서 켰습니다.');
          return;
        }
        // 활성 세션 없음 → 새로 시작
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
        if (!ok) {
          // 종료 실패 → 서버 세션이 아직 RUNNING이면 화면만 멈춘 죽은 상태 → 재조회 후 서버 누적초로 보정하고
          // tick·heartbeat 재가동(재시도 가능). 세션이 이미 없으면(끝남) 그대로 정리.
          const cur = await fetchCurrentSessionAction();
          if (cur && cur.status === 'RUNNING' && cur.sessionId === timerSessionId) {
            setTimerSeconds(cur.accumulatedStudySeconds);
            timerSecondsRef.current = cur.accumulatedStudySeconds;
            startTimerTicks(cur.sessionId);
          }
          return;
        }
        setTimerSessionId(null);
        setTimerSeconds(0);
        timerSecondsRef.current = 0;
        toast.success('타이머가 종료되었습니다.');
      }
    } finally {
      confirmInFlightRef.current = false;
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

    // 라우터 캐시 stale 방지 — '완료'는 서버 progress(완료 배지·전체 진도율·완료 개수)가 바뀌는 유일 시점.
    // 클라 Router Cache를 무효화해 /learning/[courseId] 커리큘럼 페이지로 복귀(뒤로가기 포함)할 때
    // 최신 진도를 다시 받게 한다. (courses/[courseId] enroll/장바구니 후 router.refresh와 동일 패턴.)
    // video/progress/detail은 useState 초기값(prop 재동기화 없음)이고 페이지 key={videoId}가 고정이라,
    // 현재 영상 페이지가 재요청돼도 재생은 끊기지 않는다.
    router.refresh();
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
