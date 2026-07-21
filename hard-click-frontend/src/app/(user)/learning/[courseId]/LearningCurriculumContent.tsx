'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Tooltip from '@/components/ui/tooltip';
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

/**
 * 학습 커리큘럼 화면의 client 잎사귀 — 강의/진도 데이터는 서버 페이지에서 props로 받고,
 * localStorage 누적 시청시간 병합·스크롤 초기화만 client에서 처리한다.
 */
export default function LearningCurriculumContent({
  detail,
  progress,
  errorStatus,
}: {
  detail: CourseDetail | null;
  progress: CourseProgress | null;
  errorStatus: number | null;
}) {
  /* localStorage 누적 시청 시간 (백엔드 진도가 0이어도 로컬 재생 기록 반영) */
  const [storedWatched, setStoredWatched] = useState<Record<number, number>>({});

  /* 페이지 진입 시 항상 최상단부터 */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  const rateOf = (v: SidebarVideoItem): number => {
    if (v.completed) return 100;
    if (!v.durationSeconds) return 0;
    const positionRate = (v.lastPositionSeconds / v.durationSeconds) * 100;
    const localRate = ((storedWatched[v.videoId] || 0) / v.durationSeconds) * 100;
    return Math.min(100, Math.max(positionRate, localRate));
  };

  const sections = useMemo(() => groupBySection(lessons), [lessons]);

  // 진도율 미집계 레슨(예: OT)은 분모/분자에서 제외 — BE의 progress.totalLessonCount와 정합.
  const trackedLessons = lessons.filter((l) => l.tracked);
  const totalCount = trackedLessons.length;
  const completedCount = trackedLessons.filter((l) => l.completed).length;
  const overallRate = progress
    ? Math.round(progress.progressRate)
    : totalCount > 0
      ? Math.round((completedCount / totalCount) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <div className="bg-[#F8FAFC]">
        <div className="max-w-[1440px] mx-auto px-[61.5px] pt-12 pb-32 flex flex-col gap-8">
          {errorStatus ? (
            <ErrorState status={errorStatus} />
          ) : (
            <>
              {/* ── 강의 헤더 ── */}
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
                  <div className="relative w-64 h-36 rounded-[20px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] overflow-hidden flex-shrink-0 bg-white flex items-center justify-center">
                    {detail?.thumbnailUrl ? (
                      <Image src={detail.thumbnailUrl} alt="" fill sizes="256px" className="object-cover" />
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
                    // 진도율 미집계 레슨(예: OT)은 섹션 진도율에서도 제외 — 안 그러면 그 섹션은
                    // 영원히 100%에 도달 못 함(전체 진도율과 동일 원칙, 위 totalCount 참고).
                    const secTracked = section.lessons.filter((l) => l.tracked);
                    const secDone = secTracked.filter((l) => l.completed).length;
                    const secRate = secTracked.length
                      ? Math.round((secDone / secTracked.length) * 100)
                      : 0;
                    return (
                      <div
                        key={section.title}
                        className="bg-white border border-[#E2E8F0] shadow-[0px_4px_10px_rgba(0,0,0,0.06)] rounded-2xl p-[25px]"
                      >
                        <div className="flex items-center justify-between mb-[13px]">
                          <h3 className="text-xl font-bold text-[#1F2937] tracking-[-0.45px]">{section.title}</h3>
                          <span className="text-sm font-semibold text-[#4B5563] tracking-[-0.15px]">
                            {secDone} / {secTracked.length}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden mb-6">
                          <div className="h-full bg-[#2F5DAA] rounded-full" style={{ width: `${secRate}%` }} />
                        </div>

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
                                  <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                                      lesson.completed ? 'bg-[rgba(22,163,74,0.1)]' : 'bg-[rgba(47,93,170,0.1)]'
                                    }`}
                                  >
                                    {lesson.completed ? <CompletedIcon /> : <PlayCircleIcon />}
                                  </div>

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
                                      {!lesson.tracked ? (
                                        <Tooltip content="이 강의는 진도율에 포함되지 않습니다" className="flex-shrink-0">
                                          <span className="px-2 py-0.5 bg-[rgba(148,163,184,0.15)] text-[#64748B] text-xs font-semibold rounded">
                                            진도 미반영
                                          </span>
                                        </Tooltip>
                                      ) : (
                                        lesson.completed && (
                                          <span className="flex-shrink-0 px-2 py-0.5 bg-[rgba(22,163,74,0.1)] text-[#16A34A] text-xs font-semibold rounded">
                                            완료
                                          </span>
                                        )
                                      )}
                                      {inProgress && (
                                        <span className="flex-shrink-0 px-2 py-0.5 bg-[rgba(245,158,11,0.1)] text-[#F59E0B] text-xs font-semibold rounded">
                                          진행 중 ({rate}%)
                                        </span>
                                      )}
                                    </div>
                                    {inProgress && (
                                      <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden mt-2">
                                        <div
                                          className="h-full bg-[#2F5DAA] rounded-full"
                                          style={{ width: `${rate < 1 ? 3 : rate}%` }}
                                        />
                                      </div>
                                    )}
                                  </div>

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
