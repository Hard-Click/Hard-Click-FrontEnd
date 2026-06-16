/**
 * 랭킹 도메인 목 데이터 — 백엔드 명세(노션 API 목록) 그대로.
 * GET /api/rankings/me, GET /api/rankings/study-time?period=
 */

export interface RankInfo {
  rank: number;
  totalUsers: number;
  topPercent: number;
}

export interface MyRankingApiResponse {
  studyTimeRank: RankInfo;
  lessonRank: RankInfo;
  acceptedCommentRank: RankInfo;
}

export interface StudyTimeRankApiItem {
  rank: number;
  userId: number;
  nickname: string;
  studySeconds: number;
}

export const mockMyRanking: MyRankingApiResponse = {
  studyTimeRank: { rank: 42, totalUsers: 350, topPercent: 12.0 },
  lessonRank: { rank: 38, totalUsers: 380, topPercent: 10.0 },
  acceptedCommentRank: { rank: 15, totalUsers: 300, topPercent: 5.0 },
};

export const mockStudyTimeRanking: StudyTimeRankApiItem[] = [
  { rank: 1, userId: 7, nickname: '스*디', studySeconds: 12000 },
  { rank: 2, userId: 12, nickname: '공*신', studySeconds: 11500 },
  { rank: 3, userId: 5, nickname: '열*생', studySeconds: 10800 },
];

/* ── 랭킹 보드(탭별 top10) ──
 * ⚠️ BE 미구현(노션: study-time만 부분 명세, subtitle 없음). 현행 UI 기준 가정 shape.
 *    연동 시 GET /api/rankings/{metric}?period= 응답으로 교체.
 * name = 실명 원본(BE 가정). 표시 전 server.ts 매퍼(toRankingUser)가 마스킹(한*선) 처리.
 */
export interface RankingBoardApiItem {
  rank: number;
  name: string;
  subtitle: string;
  value: string;
}

export interface RankingBoardApiResponse {
  studyTime: RankingBoardApiItem[];
  lessonCount: RankingBoardApiItem[];
  acceptedCount: RankingBoardApiItem[];
}

export const mockRankingBoard: RankingBoardApiResponse = {
  studyTime: [
    { rank: 1, name: '김민준', subtitle: '수학Ⅱ · 3학년', value: '334시간' },
    { rank: 2, name: '이서연', subtitle: '국어 · 3학년', value: '304시간' },
    { rank: 3, name: '박지원', subtitle: '영어 · 2학년', value: '280시간' },
    { rank: 4, name: '최수아', subtitle: '생명과학Ⅰ · 3학년', value: '279시간' },
    { rank: 5, name: '정하은', subtitle: '화학Ⅰ · 3학년', value: '266시간' },
    { rank: 6, name: '한도윤', subtitle: '수학Ⅰ · 2학년', value: '260시간' },
    { rank: 7, name: '오지우', subtitle: '지구과학Ⅰ · 3학년', value: '294시간' },
    { rank: 8, name: '강시우', subtitle: '사회문화 · 2학년', value: '286시간' },
    { rank: 9, name: '윤아름', subtitle: '한국사 · 3학년', value: '294시간' },
    { rank: 10, name: '임채원', subtitle: '물리학Ⅰ · 3학년', value: '246시간' },
  ],
  lessonCount: [
    { rank: 1, name: '정하은', subtitle: '수학Ⅱ · 3학년', value: '330회' },
    { rank: 2, name: '이서연', subtitle: '국어 · 3학년', value: '276회' },
    { rank: 3, name: '김민준', subtitle: '영어 · 2학년', value: '254회' },
    { rank: 4, name: '박지원', subtitle: '생명과학Ⅰ · 3학년', value: '332회' },
    { rank: 5, name: '최수아', subtitle: '화학Ⅰ · 3학년', value: '318회' },
    { rank: 6, name: '한도윤', subtitle: '수학Ⅰ · 2학년', value: '295회' },
    { rank: 7, name: '오지우', subtitle: '지구과학Ⅰ · 3학년', value: '278회' },
    { rank: 8, name: '강시우', subtitle: '사회문화 · 2학년', value: '276회' },
    { rank: 9, name: '윤아름', subtitle: '한국사 · 3학년', value: '254회' },
    { rank: 10, name: '임채원', subtitle: '물리학Ⅰ · 3학년', value: '278회' },
  ],
  acceptedCount: [
    { rank: 1, name: '오지우', subtitle: '생명과학Ⅰ · 3학년', value: '67회' },
    { rank: 2, name: '박지원', subtitle: '수학Ⅱ · 3학년', value: '60회' },
    { rank: 3, name: '강시우', subtitle: '국어 · 2학년', value: '76회' },
    { rank: 4, name: '김민준', subtitle: '화학Ⅰ · 3학년', value: '60회' },
    { rank: 5, name: '이서연', subtitle: '수학Ⅰ · 3학년', value: '67회' },
    { rank: 6, name: '최수아', subtitle: '영어 · 2학년', value: '76회' },
    { rank: 7, name: '정하은', subtitle: '지구과학Ⅰ · 3학년', value: '59회' },
    { rank: 8, name: '한도윤', subtitle: '사회문화 · 3학년', value: '52회' },
    { rank: 9, name: '윤아름', subtitle: '한국사 · 2학년', value: '92회' },
    { rank: 10, name: '임채원', subtitle: '물리학Ⅰ · 3학년', value: '45회' },
  ],
};
