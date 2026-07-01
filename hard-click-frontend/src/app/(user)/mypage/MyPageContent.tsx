'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';

import ProfileEditModal from '@/features/users/components/ProfileEditModal';
import GrassYearlyModal from '@/features/grass/components/GrassYearlyModal';
import ReviewFormModal from '@/features/reviews/components/ReviewFormModal';
import { createReview } from '@/features/reviews/services';
import type { MyProfile, MyCourse, CompletedCourse } from '@/features/users/types';
import type { StudyTimeGrassCell, LessonsGrassCell } from '@/features/grass/types';
import type { MyRankingSummary } from '@/features/rankings/types';
import { SectionHeader } from '@/components/common/SectionHeader';

/* ─────────────────────────── 목 데이터 (UI 표시용 — 채팅은 모듈 5 결정 전까지 mock 유지) ─────────────────────────── */

const MOCK_CHATS = [
  { chatId: 1, name: 'React 스터디 그룹', lastMessage: '다음 주 일정 확인 부탁드립니다', lastMessageAt: '2026.05.11 10:30', unread: 3 },
  { chatId: 2, name: 'TypeScript 질문방', lastMessage: '제네릭 관련 자료 공유합니다', lastMessageAt: '2026.05.10 18:45', unread: 0 },
  { chatId: 3, name: 'Node.js 개발자 모임', lastMessage: '프로젝트 진행 상황 공유', lastMessageAt: '2026.05.09 14:20', unread: 5 },
];

/* ─────────────────────────── 보조 컴포넌트 ─────────────────────────── */

function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_4px_10px_rgba(0,0,0,0.06)] ${className}`}>
      {children}
    </div>
  );
}

function ViewAllLink({ href = '#' }: { href?: string }) {
  return (
    <Link href={href} className="text-[#2F5DAA] text-base font-semibold flex items-center gap-1">
      전체보기 →
    </Link>
  );
}

/* 잔디 셀 표시용 — API 응답을 화면용으로 변환한 결과를 받음
 * level은 서버에서 0~5단계로 계산해 내려옴 (Math.min으로 4까지 클램프) */
type HeatmapCell = { level: number; date: string; value: string };

/** 잔디 셀 SVG 경로 (5단계: 0=Empty, 1~4=색상 강도) */
function cellIconSrc(type: 'green' | 'orange', level: number) {
  if (level === 0) return '/icons/grassEmpty.svg';
  return type === 'green' ? `/icons/grassGreen${level}.svg` : `/icons/grassOrange${level}.svg`;
}

/** 한 달치 API 응답을 7×N 그리드 셀로 변환 (월~일 시작, 빈 셀은 level 0) */
function buildMonthHeatmap(
  type: 'green' | 'orange',
  year: number,
  month: number,
  apiData: (StudyTimeGrassCell | LessonsGrassCell)[],
): HeatmapCell[] {
  const lookup = new Map<string, StudyTimeGrassCell | LessonsGrassCell>();
  apiData.forEach((c) => lookup.set(c.date, c));
  const cells: HeatmapCell[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let i = 0; i < daysInMonth; i++) {
    const d = new Date(year, month - 1, i + 1);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const apiCell = lookup.get(dateStr);
    const level = Math.min(4, apiCell?.level ?? 0);
    const value = formatHeatmapValue(type, apiCell);
    cells.push({ level, date: dateStr, value });
  }
  return cells;
}

function formatHeatmapValue(
  type: 'green' | 'orange',
  apiCell?: StudyTimeGrassCell | LessonsGrassCell,
): string {
  if (!apiCell) return type === 'green' ? '0개 강의' : '0분';
  if (type === 'green') {
    const count = (apiCell as LessonsGrassCell).watchedLessonCount ?? 0;
    return `${count}개 강의`;
  }
  const secs = (apiCell as StudyTimeGrassCell).studySeconds ?? 0;
  if (secs <= 0) return '0분';
  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor((secs % 3600) / 60);
  return hours > 0 ? `${hours}시간 ${String(minutes).padStart(2, '0')}분` : `${minutes}분`;
}

function Heatmap({
  type,
  monthLabel,
  cells,
  onViewAll,
}: {
  type: 'green' | 'orange';
  monthLabel: string;
  cells: HeatmapCell[];
  onViewAll: () => void;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const valueLabel = type === 'green' ? '수강량' : '순공시간';

  return (
    <div className="border border-[#E5E7EB] rounded-lg bg-white p-6">
      <div className="grid grid-cols-3 items-center mb-6">
        <h4 className="justify-self-start text-lg font-medium text-[#1F2937] leading-7">
          {type === 'green' ? '강의 수' : '학습 시간'}
        </h4>
        <span className="justify-self-center text-sm font-medium text-[#1F2937]">{monthLabel}</span>
        <button
          type="button"
          onClick={onViewAll}
          className="justify-self-end text-sm font-medium text-[#2F5DAA] hover:underline"
        >
          전체보기
        </button>
      </div>

      <div className="flex flex-col items-center">
        {/* 요일: 월~일 */}
        <div className="grid gap-1 mb-2" style={{ gridTemplateColumns: 'repeat(7, 14px)' }}>
          {['월', '화', '수', '목', '금', '토', '일'].map((d) => (
            <span key={d} className="text-[10px] leading-[15px] text-center text-[#6B7280]">
              {d}
            </span>
          ))}
        </div>

        {/* 셀 (hover 시 툴팁 + 회색 테두리) */}
        <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(7, 14px)' }}>
          {cells.map((c, i) => (
            <div
              key={i}
              className={`relative w-[14px] h-[14px] rounded cursor-pointer transition-shadow ${
                hoveredIdx === i ? 'shadow-[0_0_0_2px_#1F2937CC] z-10' : ''
              }`}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cellIconSrc(type, c.level)}
                width={14}
                height={14}
                alt=""
                className="block w-full h-full"
              />
              {hoveredIdx === i && (
                <div className="absolute bottom-[26px] left-1/2 -translate-x-1/2 z-20 bg-[#1F2937CC] text-white px-4 py-2.5 rounded-xl whitespace-nowrap text-center shadow-lg pointer-events-none">
                  <div className="text-sm font-bold leading-tight">{c.date}</div>
                  <div className="text-xs font-medium leading-tight mt-1">{valueLabel} : {c.value}</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 범례 */}
        <div className="mt-4 flex items-center gap-2 text-xs text-[#6B7280]">
          <span>적음</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((lv) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={lv}
                src={cellIconSrc(type, lv)}
                width={10}
                height={10}
                alt=""
                className="block w-2.5 h-2.5"
              />
            ))}
          </div>
          <span>많음</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── 메인 페이지 ─────────────────────────── */

/** ISO 날짜 → YYYY.MM.DD 표시용 */
function formatDisplayDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

/** 초 → "N시간 N분" / "N분" */
function formatStudyTime(seconds: number): string {
  if (!seconds || seconds <= 0) return '0분';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}시간 ${m}분` : `${m}분`;
}

const HEATMAP_YEAR = 2026;
const HEATMAP_MONTH = 5;

interface MyPageContentProps {
  profile: MyProfile | null;
  ranking: MyRankingSummary | null;
  inProgress: MyCourse[];
  completed: CompletedCourse[];
  streakDays: number;
  todayStudySeconds: number;
  studyTimeGrass: StudyTimeGrassCell[];
  lessonsGrass: LessonsGrassCell[];
  initialReviewedIds: number[];
}

export default function MyPageContent({
  profile,
  ranking,
  inProgress,
  completed,
  streakDays,
  todayStudySeconds,
  studyTimeGrass,
  lessonsGrass,
  initialReviewedIds,
}: MyPageContentProps) {
  const router = useRouter();
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const [yearlyModalType, setYearlyModalType] = useState<'green' | 'orange' | null>(null);
  const [reviewedIds, setReviewedIds] = useState<Set<number>>(
    () => new Set(initialReviewedIds),
  );
  const [reviewTargetId, setReviewTargetId] = useState<number | null>(null);

  // 서버에서 받은 잔디 원본 → 표시용 셀로 변환 (페칭 아님, 순수 변환이라 client 계산 OK)
  const studyTimeCells = buildMonthHeatmap('orange', HEATMAP_YEAR, HEATMAP_MONTH, studyTimeGrass);
  const lessonCells = buildMonthHeatmap('green', HEATMAP_YEAR, HEATMAP_MONTH, lessonsGrass);

  const reviewTarget = completed.find((c) => c.courseId === reviewTargetId);

  const handleReviewSubmit = async (rating: number, content: string) => {
    if (reviewTargetId === null) return;
    const res = await createReview(reviewTargetId, { rating, content });
    if (!res.success) {
      toast.error(res.message || '수강평 등록에 실패했습니다.');
      return;
    }
    setReviewedIds((prev) => new Set(prev).add(reviewTargetId));
    setReviewTargetId(null);
    toast.success(res.message || '수강평이 등록되었습니다.');
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5]">

      {/* 페이지 히어로 */}
      <div className="w-full bg-white border-b border-[#E2E8F0]">
        <div className="max-w-[1440px] mx-auto px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#2F5DAA] rounded-[20px] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icons/bookIcon.svg"
                width={24}
                height={24}
                alt=""
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>
            <h1 className="text-[30px] font-bold leading-9 text-[#1F2937] tracking-[0.4px]">마이페이지</h1>
          </div>
          <p className="mt-2 text-base text-[#4B5563] tracking-[-0.31px]">
            내 학습 정보와 활동 기록을 한 곳에서 확인하세요.
          </p>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="w-full bg-[#F8FAFC]">
        <div className="max-w-[1280px] mx-auto px-8 pt-8 pb-32">
          <div className="flex flex-col gap-8">
            {/* ── 프로필 요약 + 랭킹 ── */}
            <SectionCard>
              <div className="p-[33px] flex flex-col gap-8">
                {/* 상단: 제목 + 수정 버튼 */}
                <div className="flex items-start justify-between">
                  <h2 className="text-2xl font-bold text-[#1F2937] leading-8">프로필 요약</h2>
                  <button
                    type="button"
                    onClick={() => setIsProfileEditOpen(true)}
                    className="flex items-center gap-2 px-4 h-12 bg-[#2F5DAA] rounded-[10px] text-base font-semibold text-white hover:bg-[#1D3E75] transition-colors"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/icons/editIcon.svg"
                      width={16}
                      height={16}
                      alt=""
                      style={{ filter: 'brightness(0) invert(1)' }}
                    />
                    프로필 수정
                  </button>
                </div>

                {/* 사용자 정보 + 통계 카드 */}
                <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-8">
                  {/* 좌측: 아바타 + 이름 + 이메일 */}
                  <div className="flex flex-col items-center text-center gap-3 sm:flex-row sm:text-left sm:gap-6 w-full md:w-[400px] flex-shrink-0">
                    <div className="relative w-28 h-28 rounded-full bg-[rgba(47,93,170,0.1)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {profile?.profileImageUrl ? (
                        <Image
                          src={profile.profileImageUrl}
                          alt=""
                          fill
                          sizes="112px"
                          className="object-cover"
                        />
                      ) : (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src="/icons/profileAvatarIcon.svg" width={56} height={56} alt="" />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-2xl font-bold text-[#1F2937] leading-8 mb-1">{profile?.name ?? ''}</p>
                      <p className="text-base text-[#4B5563] break-all">{profile?.email ?? ''}</p>
                    </div>
                  </div>

                  {/* 우측: 통계 카드 2x2 그리드 */}
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div className="bg-[#F8FAFC] rounded-[20px] p-5">
                      <p className="text-sm text-[#4B5563] mb-2">수강 중인 강의</p>
                      <p className="text-[30px] font-bold leading-9 text-[#2F5DAA]">
                        {inProgress.length}개
                      </p>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-[20px] p-5">
                      <p className="text-sm text-[#4B5563] mb-2">수강 완료</p>
                      <p className="text-[30px] font-bold leading-9 text-[#16A34A]">
                        {completed.length}개
                      </p>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-[20px] p-5">
                      <p className="text-sm text-[#4B5563] mb-2">오늘 순공시간</p>
                      <p className="text-[30px] font-bold leading-9 text-[#F59E0B]">
                        {formatStudyTime(todayStudySeconds)}
                      </p>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-[20px] p-5">
                      <p className="text-sm text-[#4B5563] mb-2">현재 연속 학습일</p>
                      <p className="text-[30px] font-bold leading-9 text-[#EF4444]">{streakDays}일</p>
                    </div>
                  </div>
                </div>

                {/* 구분선 + 랭킹 */}
                <div className="border-t border-[#E2E8F0] pt-8">
                  <h3 className="text-xl font-semibold text-[#1F2937] mb-5">랭킹 요약</h3>
                  <div className="grid grid-cols-3 gap-2 sm:gap-5">
                    {[
                      { label: '순공시간 순위', rank: ranking?.studyTimeRank.rank ?? 0, pct: ranking?.studyTimeRank.topPercent ?? 0 },
                      { label: '수강량 순위', rank: ranking?.lessonRank.rank ?? 0, pct: ranking?.lessonRank.topPercent ?? 0 },
                      { label: '채택 순위', rank: ranking?.acceptedCommentRank.rank ?? 0, pct: ranking?.acceptedCommentRank.topPercent ?? 0 },
                    ].map((r) => (
                      <div key={r.label} className="bg-[rgba(47,93,170,0.05)] rounded-[20px] text-center pt-6 pb-6">
                        <p className="text-sm font-medium text-[#4B5563] mb-2">{r.label}</p>
                        {r.rank > 0 ? (
                          <>
                            <p className="text-3xl sm:text-4xl font-bold text-[#2F5DAA] leading-10 mb-2">{r.rank}위</p>
                            <p className="text-sm text-[#4B5563]">상위 {r.pct}%</p>
                          </>
                        ) : (
                          // BE가 아직 순위를 안 줌(rank=null) — "0위" 위조 대신 집계 전 안내 (CLAUDE.md §0.1 규칙②)
                          <>
                            <p className="text-2xl font-bold text-[#9CA3AF] leading-10 mb-2 mt-1">집계 전</p>
                            <p className="text-sm text-[#9CA3AF]">아직 순위가 없어요</p>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* ── 학습 기록 ── */}
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-2xl font-bold text-[#1F2937] leading-8">학습 기록</h2>
                <p className="mt-1 text-base text-[#4B5563]">날짜별 수강량과 순공시간을 확인하세요.</p>
              </div>

              <SectionCard>
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-[84px]">
                    <Heatmap
                      type="green"
                      monthLabel={`${HEATMAP_YEAR}년 ${HEATMAP_MONTH}월`}
                      cells={lessonCells}
                      onViewAll={() => setYearlyModalType('green')}
                    />
                    <Heatmap
                      type="orange"
                      monthLabel={`${HEATMAP_YEAR}년 ${HEATMAP_MONTH}월`}
                      cells={studyTimeCells}
                      onViewAll={() => setYearlyModalType('orange')}
                    />
                  </div>
                </div>
              </SectionCard>
            </div>

            {/* ── 수강 중인 강의 ── */}
            <div className="flex flex-col">
              <SectionHeader title="수강 중인 강의" action={<ViewAllLink href="/mypage/courses/in-progress" />} />
              <SectionCard>
                <div className="p-[33px] flex flex-col gap-5">
                  {inProgress.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/icons/emptyStateIcon.svg" width={80} height={80} alt="" />
                      <p className="text-xl font-bold text-[#1F2937]">수강 중인 강의가 없습니다.</p>
                      <p className="text-sm text-[#4B5563]">새로운 강의를 둘러보고 학습을 시작해보세요.</p>
                    </div>
                  ) : (inProgress.map((c) => (
                    <div key={c.courseId} className="border border-[#E2E8F0] rounded-[20px] p-5 flex flex-col sm:flex-row gap-3 sm:gap-5 sm:items-center">
                      <div className="w-24 h-20 sm:w-40 sm:h-24 bg-[#F8FAFC] rounded-2xl flex items-center justify-center flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/icons/courseThumbnailIcon.svg" width={48} height={48} alt="" />
                      </div>
                      <div className="flex-1 flex flex-col gap-3">
                        {/* 제목 + 커리큘럼 페이지 이동(>) */}
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-lg font-semibold leading-7 text-[#1F2937]">{c.courseTitle}</p>
                          <Link
                            href={`/learning/${c.courseId}`}
                            aria-label="강의 커리큘럼 보기"
                            className="w-6 h-6 flex items-center justify-center text-[#4B5563] hover:text-[#2F5DAA] transition-colors flex-shrink-0"
                          >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </Link>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-[#4B5563]">진도율</span>
                            <span className="text-base font-bold text-[#2F5DAA]">{Math.round(c.progressRate)}%</span>
                          </div>
                          <div className="w-full h-2.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                            <div className="h-full bg-[#2F5DAA] rounded-full" style={{ width: `${c.progressRate}%` }} />
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-sm text-[#4B5563]">최근 학습: {formatDisplayDate(c.lastStudiedAt)}</span>
                          <Link
                            href={c.lastVideoId ? `/learning/videos/${c.lastVideoId}` : '#'}
                            aria-disabled={!c.lastVideoId}
                            className={`w-[95px] h-10 rounded-[10px] flex items-center justify-center text-white text-base font-semibold transition-colors ${
                              c.lastVideoId ? 'bg-[#2F5DAA] hover:bg-[#1D3E75]' : 'bg-[#9CA3AF] pointer-events-none'
                            }`}
                          >
                            이어보기
                          </Link>
                        </div>
                      </div>
                    </div>
                  )))}
                </div>
              </SectionCard>
            </div>

            {/* ── 수강 완료 ── */}
            <div className="flex flex-col">
              <SectionHeader title="수강 완료" action={<ViewAllLink href="/mypage/courses/completed" />} />
              <SectionCard>
                <div className="p-[33px] flex flex-col gap-5">
                  {completed.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/icons/emptyStateIcon.svg" width={80} height={80} alt="" />
                      <p className="text-xl font-bold text-[#1F2937]">아직 완료한 강의가 없습니다.</p>
                      <p className="text-sm text-[#4B5563]">학습을 완료하고 리뷰를 작성해보세요.</p>
                    </div>
                  ) : (completed.map((c) => (
                    <div key={c.courseId} className="border border-[#E2E8F0] rounded-[20px] p-5 flex flex-col sm:flex-row gap-3 sm:gap-5 sm:items-center">
                      <Link
                        href={`/courses/${c.courseId}`}
                        className="w-24 h-20 sm:w-40 sm:h-24 bg-[#F8FAFC] rounded-2xl flex items-center justify-center flex-shrink-0 hover:bg-[#EEF2F7] transition-colors"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/icons/trophyIcon.svg" width={48} height={48} alt="" />
                      </Link>
                      <div className="flex-1 flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-3">
                          <Link href={`/courses/${c.courseId}`} className="text-lg font-semibold leading-7 text-[#1F2937] hover:text-[#2F5DAA] transition-colors">{c.courseTitle}</Link>
                          <span className="flex-shrink-0 px-4 py-2 bg-[rgba(22,163,74,0.1)] text-[#16A34A] text-sm font-semibold rounded-2xl">
                            수강 완료
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                          <div className="h-full bg-[#16A34A] rounded-full" style={{ width: '100%' }} />
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-sm text-[#4B5563]">완료일: {formatDisplayDate(c.completedAt)}</span>
                          {reviewedIds.has(c.courseId) ? (
                            <Link
                              href={`/courses/${c.courseId}#reviews`}
                              className="w-[115px] h-10 flex items-center justify-center bg-[#2F5DAA] rounded-[10px] text-base font-semibold text-white hover:bg-[#1D3E75] transition-colors"
                            >
                              내 리뷰 확인
                            </Link>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setReviewTargetId(c.courseId)}
                              className="w-[115px] h-10 border border-[#E2E8F0] rounded-[10px] text-base font-semibold text-[#4B5563] hover:bg-[#F8FAFC] transition-colors"
                            >
                              리뷰 작성하기
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )))}
                </div>
              </SectionCard>
            </div>

            {/* ── 내 채팅방 ── */}
            <div className="flex flex-col">
              <SectionHeader title="내 채팅방" action={<ViewAllLink href="/mypage/chats" />} />
              <SectionCard>
                <div className="p-[33px] flex flex-col gap-4">
                  {MOCK_CHATS.map((c) => (
                    <div
                      key={c.chatId}
                      className="border border-[#E2E8F0] rounded-[20px] p-5 cursor-pointer hover:bg-[#F8FAFC] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-semibold leading-7 text-[#1F2937]">{c.name}</p>
                        {c.unread > 0 && (
                          <span className="min-w-[28px] h-7 px-2.5 bg-[#EF4444] rounded-full text-white text-sm font-bold flex items-center justify-center">
                            {c.unread}
                          </span>
                        )}
                      </div>
                      <p className="mt-3 mb-2 text-base font-medium text-[#4B5563]">{c.lastMessage}</p>
                      <div className="flex items-center gap-2 text-sm font-medium text-[#4B5563]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/icons/clockGrayIcon.svg" width={14} height={14} alt="" />
                        <span>{c.lastMessageAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          </div>
        </div>
      </div>

      {/* 모달 */}
      {isProfileEditOpen && (
        <ProfileEditModal
          initialImageUrl={profile?.profileImageUrl || ''}
          onClose={() => setIsProfileEditOpen(false)}
          onSaved={() => router.refresh()}
        />
      )}
      {yearlyModalType && (
        <GrassYearlyModal type={yearlyModalType} onClose={() => setYearlyModalType(null)} />
      )}
      {reviewTarget && (
        <ReviewFormModal
          courseTitle={reviewTarget.courseTitle}
          onCancel={() => setReviewTargetId(null)}
          onSubmit={handleReviewSubmit}
        />
      )}

    </div>
  );
}
