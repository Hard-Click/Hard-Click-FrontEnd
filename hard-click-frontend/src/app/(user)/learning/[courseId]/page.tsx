'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getCourseDetail } from '@/features/courses/services';
import { getCourseProgress } from '@/features/learning/services';
import { mergeCurriculumProgress, formatDuration } from '@/features/learning/utils';
import type { CourseDetail } from '@/features/courses/types';
import type { CourseProgress, SidebarVideoItem } from '@/features/learning/types';

/** 섹션 단위로 그룹화 (커리큘럼 원래 순서 유지) */
function groupBySection(items: SidebarVideoItem[]): Array<{
  title: string;
  lessons: SidebarVideoItem[];
}> {
  const order: string[] = [];
  const map = new Map<string, SidebarVideoItem[]>();
  items.forEach((v) => {
    const key = v.sectionTitle || '강의 목록';
    if (!map.has(key)) {
      map.set(key, []);
      order.push(key);
    }
    map.get(key)!.push(v);
  });
  return order.map((title) => ({ title, lessons: map.get(title)! }));
}

/* 상태 아이콘 — 완료(초록 체크) / 미완료·진행중(파랑 플레이) */
function CompletedIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9.5" stroke="#16A34A" strokeWidth="2" />
      <path d="M8.5 12l2.5 2.5L16 9" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlayCircleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9.5" stroke="#2F5DAA" strokeWidth="2" />
      <path d="M10 8.5l5 3.5-5 3.5V8.5z" stroke="#2F5DAA" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke="#4B5563" strokeWidth="1.33" />
      <path d="M8 4.5V8l2.5 1.5" stroke="#4B5563" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function LearningCurriculumPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = Number(params?.courseId);

  const [detail, setDetail] = useState<CourseDetail | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  /* localStorage 누적 시청 시간 (백엔드 진도가 0이어도 로컬 재생 기록 반영) */
  const [storedWatched, setStoredWatched] = useState<Record<number, number>>({});

  /* 페이지 진입 시 항상 최상단부터 — 이전 페이지(마이페이지) 스크롤 위치가 남는 것 방지 */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [courseId]);

  useEffect(() => {
    if (!Number.isFinite(courseId)) {
      setErrorStatus(404);
      setLoading(false);
      return;
    }
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setErrorStatus(null);
      const [detailRes, progRes] = await Promise.all([
        getCourseDetail(courseId),
        getCourseProgress(courseId),
      ]);
      if (cancelled) return;

      if (!detailRes) {
        setErrorStatus(404);
        setLoading(false);
        return;
      }
      setDetail(detailRes);

      if (progRes.success) {
        setProgress(progRes.data);
      } else if (progRes.httpStatus === 403 || progRes.httpStatus === 404) {
        setErrorStatus(progRes.httpStatus);
      }
      setLoading(false);
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  const lessons = useMemo(
    () => mergeCurriculumProgress(detail, progress),
    [detail, progress],
  );

  /* 클라이언트에서 localStorage 누적 시청 시간 읽기 */
  useEffect(() => {
    if (typeof window === 'undefined' || lessons.length === 0) return;
    const map: Record<number, number> = {};
    lessons.forEach((v) => {
      const stored = window.localStorage.getItem(
        `learning:watchedSeconds:${v.videoId}`,
      );
      const sec = stored ? Number(stored) : 0;
      if (Number.isFinite(sec) && sec > 0) map[v.videoId] = sec;
    });
    setStoredWatched(map);
  }, [lessons]);

  /** 강의별 진행률(%) — 완료=100, 그 외 max(백엔드 위치, 로컬 누적) */
  const rateOf = (v: SidebarVideoItem): number => {
    if (v.completed) return 100;
    if (!v.durationSeconds) return 0;
    const positionRate = (v.lastPositionSeconds / v.durationSeconds) * 100;
    const localRate = ((storedWatched[v.videoId] || 0) / v.durationSeconds) * 100;
    return Math.min(100, Math.max(positionRate, localRate));
  };

  const sections = useMemo(() => groupBySection(lessons), [lessons]);

  const totalCount = lessons.length;
  const completedCount = lessons.filter((l) => l.completed).length;
  const overallRate = progress
    ? Math.round(progress.progressRate)
    : totalCount > 0
      ? Math.round((completedCount / totalCount) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <div className="bg-[#F8FAFC]">
        <div className="max-w-[1440px] mx-auto px-[61.5px] pt-12 pb-32 flex flex-col gap-8">
          {loading ? (
            <LoadingState />
          ) : errorStatus ? (
            <ErrorState status={errorStatus} />
          ) : (
            <>
              {/* ── 강의 헤더 (돌아가기 + 썸네일 + 제목) ── */}
              <div className="relative h-[184px]">
                <Link
                  href="/mypage"
                  className="inline-flex items-center gap-2 text-[#4B5563] text-base font-semibold hover:text-[#1F2937] transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M12 15l-5-5 5-5" stroke="#4B5563" strokeWidth="1.667" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  내 학습으로 돌아가기
                </Link>

                <div className="flex items-start gap-6 mt-4">
                  <div className="w-64 h-36 rounded-[20px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] overflow-hidden flex-shrink-0 bg-white flex items-center justify-center">
                    {detail?.thumbnailUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={detail.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src="/icons/courseThumbnailIcon.svg" width={48} height={48} alt="" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-[30px] font-bold leading-9 text-[#1F2937] tracking-[0.4px] truncate">
                      {detail?.title}
                    </h1>
                    <p className="mt-[60px] text-base text-[#4B5563] tracking-[-0.31px]">
                      강사: {detail?.instructorName}
                    </p>
                  </div>
                </div>
              </div>

              {/* ── 진도율 카드 ── */}
              <div className="bg-white border border-[#E2E8F0] shadow-[0px_4px_10px_rgba(0,0,0,0.06)] rounded-2xl p-[25px] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[#1F2937] tracking-[-0.45px]">진도율</h2>
                  <span className="text-2xl font-bold text-[#2F5DAA] tracking-[0.07px]">{overallRate}%</span>
                </div>
                <div className="w-full h-3 bg-[#E2E8F0] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2F5DAA] rounded-full transition-[width] duration-300"
                    style={{ width: `${overallRate}%` }}
                  />
                </div>
                <p className="text-sm text-[#4B5563] tracking-[-0.15px]">
                  완료: {completedCount} / {totalCount}개
                </p>
              </div>

              {/* ── 섹션 목록 ── */}
              {totalCount === 0 ? (
                <div className="bg-white border border-[#E2E8F0] shadow-[0px_4px_10px_rgba(0,0,0,0.06)] rounded-2xl flex flex-col items-center justify-center py-20 gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icons/emptyStateIcon.svg" width={64} height={64} alt="" />
                  <p className="text-lg font-bold text-[#1F2937]">등록된 강의가 없습니다.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {sections.map((section) => {
                    const secDone = section.lessons.filter((l) => l.completed).length;
                    const secRate = section.lessons.length
                      ? Math.round((secDone / section.lessons.length) * 100)
                      : 0;
                    return (
                      <div
                        key={section.title}
                        className="bg-white border border-[#E2E8F0] shadow-[0px_4px_10px_rgba(0,0,0,0.06)] rounded-2xl p-[25px]"
                      >
                        {/* 섹션 헤더 */}
                        <div className="flex items-center justify-between mb-[13px]">
                          <h3 className="text-xl font-bold text-[#1F2937] tracking-[-0.45px]">{section.title}</h3>
                          <span className="text-sm font-semibold text-[#4B5563] tracking-[-0.15px]">
                            {secDone} / {section.lessons.length}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden mb-6">
                          <div className="h-full bg-[#2F5DAA] rounded-full" style={{ width: `${secRate}%` }} />
                        </div>

                        {/* 강의 row */}
                        <div className="flex flex-col gap-3">
                          {section.lessons.map((lesson) => {
                            const rate = Math.round(rateOf(lesson));
                            const inProgress = !lesson.completed && rate > 0;
                            return (
                              <Link
                                key={lesson.videoId}
                                href={`/learning/videos/${lesson.videoId}`}
                                className="block border-2 border-[#E2E8F0] rounded-[20px] p-[18px] hover:bg-[#F8FAFC] transition-colors"
                              >
                                <div className="flex items-center gap-4">
                                  {/* 상태 아이콘 (48px 원) */}
                                  <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                                      lesson.completed ? 'bg-[rgba(22,163,74,0.1)]' : 'bg-[rgba(47,93,170,0.1)]'
                                    }`}
                                  >
                                    {lesson.completed ? <CompletedIcon /> : <PlayCircleIcon />}
                                  </div>

                                  {/* 본문: 제목 + (시간·배지) */}
                                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                                    <p className="text-base font-semibold text-[#1F2937] tracking-[-0.31px] truncate">
                                      {lesson.title}
                                    </p>
                                    <div className="flex items-center gap-4">
                                      <span className="flex items-center gap-1 flex-shrink-0">
                                        <ClockIcon />
                                        <span className="text-sm font-medium text-[#4B5563] tracking-[-0.15px]">
                                          {formatDuration(lesson.durationSeconds)}
                                        </span>
                                      </span>
                                      {lesson.isPreview && (
                                        <span className="flex-shrink-0 px-2 py-0.5 bg-[rgba(47,93,170,0.1)] text-[#2F5DAA] text-xs font-semibold rounded">
                                          미리보기
                                        </span>
                                      )}
                                      {lesson.completed && (
                                        <span className="flex-shrink-0 px-2 py-0.5 bg-[rgba(22,163,74,0.1)] text-[#16A34A] text-xs font-semibold rounded">
                                          완료
                                        </span>
                                      )}
                                      {inProgress && (
                                        <span className="flex-shrink-0 px-2 py-0.5 bg-[rgba(245,158,11,0.1)] text-[#F59E0B] text-xs font-semibold rounded">
                                          진행 중 ({rate}%)
                                        </span>
                                      )}
                                    </div>
                                    {/* 진행 중: 카드 하단 전체폭 진행바 */}
                                    {inProgress && (
                                      <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden mt-2">
                                        <div
                                          className="h-full bg-[#2F5DAA] rounded-full"
                                          style={{ width: `${rate < 1 ? 3 : rate}%` }}
                                        />
                                      </div>
                                    )}
                                  </div>

                                  {/* 액션 텍스트 */}
                                  <span className="flex-shrink-0 self-start text-sm font-semibold text-[#2F5DAA] tracking-[-0.15px]">
                                    {inProgress ? '이어보기 →' : '학습하기 →'}
                                  </span>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-[144px] bg-[#E2E8F0] rounded-[20px] animate-pulse" />
      <div className="h-[138px] bg-[#E2E8F0] rounded-2xl animate-pulse" />
      <div className="h-[300px] bg-[#E2E8F0] rounded-2xl animate-pulse" />
    </div>
  );
}

function ErrorState({ status }: { status: number }) {
  const message =
    status === 403
      ? '수강 중인 강의가 아닙니다.'
      : status === 404
        ? '강의를 찾을 수 없습니다.'
        : '강의 정보를 불러오지 못했습니다.';
  return (
    <div className="bg-white border border-[#E2E8F0] shadow-[0px_4px_10px_rgba(0,0,0,0.06)] rounded-2xl flex flex-col items-center justify-center py-20 gap-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icons/emptyStateIcon.svg" width={80} height={80} alt="" />
      <p className="text-xl font-bold text-[#1F2937]">{message}</p>
      <Link
        href="/mypage"
        className="mt-2 h-10 px-5 bg-[#2F5DAA] rounded-[10px] flex items-center justify-center text-white text-base font-semibold hover:bg-[#1D3E75] transition-colors"
      >
        내 학습으로 돌아가기
      </Link>
    </div>
  );
}
