'use client';

import { useState } from 'react';
import RankingTabs, { type RankingTabType } from '@/features/rankings/components/RankingTabs';
import RankingPodium, { type RankingUser } from '@/features/rankings/components/RankingPodium';
import RankingTable from '@/features/rankings/components/RankingTable';

/* ───── 목 데이터 ───── */
const MOCK_DATA: Record<RankingTabType, RankingUser[]> = {
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

export default function RankingPage() {
  const [activeTab, setActiveTab] = useState<RankingTabType>('studyTime');

  const allUsers = MOCK_DATA[activeTab];
  const top3 = allUsers.slice(0, 3);
  const rest = allUsers.slice(3);

  return (
    <div className="mx-auto max-w-[720px] px-4 py-8">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1E293B]">랭킹</h1>
        <p className="mt-1 text-sm text-[#64748B]">이번 달 열공한 수험생들을 확인해보세요!</p>
      </div>

      {/* 탭 */}
      <RankingTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 포디움 */}
      <div className="mt-6">
        <RankingPodium top3={top3} />
      </div>

      {/* 4위~10위 리스트 */}
      <div className="mt-4">
        <RankingTable users={rest} />
      </div>
    </div>
  );
}
