import MyPageContent from './MyPageContent';
import {
  getMyProfileServer,
  getMyCoursesServer,
  getMyCompletedCoursesServer,
} from '@/features/users/server';
import { getMyActivitiesServer } from '@/features/mypage/server';
import { getMyRankingSummaryServer } from '@/features/rankings/server';
import {
  getStreakServer,
  getStudyTimeGrassServer,
  getLessonsGrassServer,
} from '@/features/grass/server';
import { getDailyStudyStatsServer } from '@/features/studyTimers/server';

/** 잔디 히트맵 표시 기준 연·월 (MyPageContent의 buildMonthHeatmap과 동일하게 유지) */
const HEATMAP_YEAR = 2026;
const HEATMAP_MONTH = 5;

/**
 * 마이페이지 (Server Component, Server-First).
 * 데이터는 서버에서 조회해 client 섬(MyPageContent)에 props로 전달한다. (CLAUDE.md §0·§4)
 * - 라이브(실서버): 프로필·내 수강·완료 강의·활동(members/me) · 랭킹요약(rankings/me/summary) · 연속일·순공/수강량 잔디(grass) · 오늘 순공시간(study-timers/stats/daily)
 * - ⚠️ 라이브지만 BE 데이터가 비거나 출렁임: 랭킹 rank=null → MyPageContent가 "집계 전" 표시 / 잔디 lessons는 BE 200↔500 출렁이라 500이면 빈 셀 폴백
 * - 잔디 '전체보기'(월/연간) 모달도 라이브 — grass/services.ts가 isMock('grass')로 실 /api/grass/* 호출(2026-06-25 라이브 전환)
 * - mock 유지: 채팅(BE 없음) · 비번변경/회원탈퇴(accountDestructive — demo 보호)
 * BE 출렁 대비 모든 라이브 조회를 .catch 폴백(섹션만 비고 페이지는 정상) — error.tsx는 치명 오류만.
 */
export default async function MyPage() {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const [
    profile,
    courses,
    completed,
    activities,
    ranking,
    streak,
    dailyStats,
    studyTimeGrass,
    lessonsGrass,
  ] = await Promise.all([
    getMyProfileServer().catch(() => null),
    getMyCoursesServer().catch(() => []),
    getMyCompletedCoursesServer().catch(() => []),
    getMyActivitiesServer().catch(() => null),
    getMyRankingSummaryServer().catch(() => null), // 라이브 /api/rankings/me/summary 전체 요약 (rank=null이면 MyPageContent가 "집계 전")
    getStreakServer().catch(() => ({ streak: 0 })), // 라이브 /api/grass/streak
    getDailyStudyStatsServer({ startDate: todayStr, endDate: todayStr }).catch(
      () => [],
    ), // 라이브 /api/study-timers/stats/daily
    getStudyTimeGrassServer({
      year: HEATMAP_YEAR,
      month: HEATMAP_MONTH,
    }).catch(() => []), // 라이브 /api/grass/study-time
    getLessonsGrassServer({ year: HEATMAP_YEAR, month: HEATMAP_MONTH }).catch(
      () => [],
    ), // 라이브 /api/grass/lessons (BE 200↔500 출렁 → 500이면 빈 셀)
  ]);

  const inProgress = courses.filter((c) => c.progressRate < 100);
  const todayStudySeconds =
    dailyStats.find((x) => x.date === todayStr)?.studySeconds ?? 0;
  const initialReviewedIds = activities?.reviews.map((r) => r.courseId) ?? [];

  return (
    <MyPageContent
      profile={profile}
      ranking={ranking}
      inProgress={inProgress}
      completed={completed}
      streakDays={streak.streak}
      todayStudySeconds={todayStudySeconds}
      studyTimeGrass={studyTimeGrass}
      lessonsGrass={lessonsGrass}
      initialReviewedIds={initialReviewedIds}
    />
  );
}
