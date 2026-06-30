'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { SidebarVideoItem } from '@/features/learning/types';

interface LearningCurriculumSidebarProps {
  videos: SidebarVideoItem[];
  currentVideoId: number;
  routePrefix?: string;
  /** 재생 중 증가하는 틱 — 변할 때마다 localStorage 진행률을 재읽기해 실시간 갱신 */
  liveTick?: number;
}

function formatDuration(seconds?: number) {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function CheckIcon() {
  return (
    <Image
      src="/icons/checkCircleIcon.svg"
      alt=""
      width={20}
      height={20}
      className="flex-shrink-0 mt-1"
    />
  );
}

function PlayIcon() {
  return (
    <Image
      src="/icons/lessonItemPlayGray.svg"
      alt=""
      width={20}
      height={20}
      className="flex-shrink-0 mt-1"
    />
  );
}

export default function LearningCurriculumSidebar({
  videos,
  currentVideoId,
  routePrefix = '/learning/videos',
  liveTick,
}: LearningCurriculumSidebarProps) {
  /* localStorage 기반 누적 시청 시간 (watchedSeconds) — 백엔드 progressRate가 0이어도
   * 이전에 재생한 적 있으면 진행률 표시. lastPosition(드래그 영향) X, 실제 재생 시간만. */
  const [storedWatched, setStoredWatched] = useState<Record<number, number>>({});
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const map: Record<number, number> = {};
    videos.forEach((v) => {
      const stored = window.localStorage.getItem(`learning:watchedSeconds:${v.videoId}`);
      const sec = stored ? Number(stored) : 0;
      if (Number.isFinite(sec) && sec > 0) map[v.videoId] = sec;
    });
    setStoredWatched(map);
  }, [videos, currentVideoId, liveTick]);

  /* 섹션별 그룹화 */
  const sections = new Map<string, SidebarVideoItem[]>();
  videos.forEach((v) => {
    const key = v.sectionTitle ?? '강의 목록';
    if (!sections.has(key)) sections.set(key, []);
    sections.get(key)!.push(v);
  });

  return (
    <aside className="w-[384px] flex-shrink-0 bg-[#111827] border-l border-[#374151] overflow-y-auto">
      <div className="px-6 pt-6 pb-0 flex flex-col gap-6">
        {/* 헤더 */}
        <div className="flex items-center gap-2 h-7">
          <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="#FFFFFF" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round">
            <line x1="2.5" y1="5" x2="3.5" y2="5" />
            <line x1="2.5" y1="10" x2="3.5" y2="10" />
            <line x1="2.5" y1="15" x2="3.5" y2="15" />
            <line x1="6.67" y1="5" x2="17.5" y2="5" />
            <line x1="6.67" y1="10" x2="17.5" y2="10" />
            <line x1="6.67" y1="15" x2="17.5" y2="15" />
          </svg>
          <h2 className="text-lg font-semibold leading-7 text-white">강의 목록</h2>
        </div>

        {/* 섹션들 */}
        <div className="flex flex-col gap-4">
          {[...sections.entries()].map(([sectionTitle, items]) => (
            <section key={sectionTitle} className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold leading-[27px] text-white">{sectionTitle}</h3>
              <ul className="flex flex-col gap-2">
                {items.map((v) => {
                  const isActive = v.videoId === currentVideoId;
                  /* 진행률 = 누적 시청 시간 / durationSeconds. localStorage 또는 백엔드 lastPositionSeconds 기준 */
                  const watchedSec = storedWatched[v.videoId] || 0;
                  const positionRate = v.durationSeconds
                    ? Math.min(100, (v.lastPositionSeconds / v.durationSeconds) * 100)
                    : 0;
                  const localRate = v.durationSeconds
                    ? Math.min(100, (watchedSec / v.durationSeconds) * 100)
                    : 0;
                  const effectiveRate = v.completed ? 100 : Math.max(positionRate, localRate);
                  const isInProgress = !v.completed && effectiveRate > 0;
                  const cardBg = isActive ? 'bg-[#2F5DAA]' : 'bg-[#1F2937]';
                  const titleColor = isActive ? 'text-white' : 'text-[#9CA3AF]';
                  const timeColor = isActive ? 'text-white' : 'text-[#9CA3AF]';
                  return (
                    <li key={v.videoId}>
                      <Link
                        href={`${routePrefix}/${v.videoId}`}
                        className={`block rounded-[20px] p-4 transition-colors hover:opacity-90 ${cardBg}`}
                      >
                        <div className="flex items-start gap-3">
                          {v.completed ? <CheckIcon /> : <PlayIcon />}
                          <div className="flex-1 min-w-0 flex flex-col gap-1">
                            <div className={`text-base font-medium leading-6 truncate ${titleColor}`}>
                              {v.title}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium ${timeColor}`}>
                                {formatDuration(v.durationSeconds)}
                              </span>
                              {v.completed && (
                                <span className="px-2 py-0.5 rounded text-xs font-medium ml-auto" style={{ background: 'rgba(22,163,74,0.2)', color: '#16A34A' }}>
                                  완료
                                </span>
                              )}
                            </div>
                            {isInProgress && (
                              <div className="mt-1 flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                  <span className={`text-xs font-medium ${isActive ? 'text-white/80' : 'text-[#9CA3AF]'}`}>진행률</span>
                                  <span className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-[#2F5DAA]'}`}>
                                    {Math.round(effectiveRate)}%
                                  </span>
                                </div>
                                <div className={`h-1.5 w-full rounded-full overflow-hidden ${isActive ? 'bg-white/20' : 'bg-[#374151]'}`}>
                                  <div
                                    className={`h-full rounded-full ${isActive ? 'bg-white' : 'bg-[#2F5DAA]'}`}
                                    style={{
                                      width:
                                        effectiveRate >= 1
                                          ? `${effectiveRate}%`
                                          : effectiveRate > 0
                                            ? '3%'
                                            : '0%',
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </aside>
  );
}
