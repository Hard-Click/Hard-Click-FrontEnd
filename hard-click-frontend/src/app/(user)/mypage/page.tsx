'use client';

import Link from 'next/link';
import UserHeader from '@/components/layout/headers/UserHeader';

/* ─────────────────────────── 목 데이터 (API 연동 전 화면 확인용) ─────────────────────────── */

const MOCK_PROFILE = {
  name: '안현',
  email: 'hyun030514@naver.com',
  inProgressCount: 3,
  completedCount: 5,
  todayStudyTime: '2시간 30분',
  streakDays: 7,
};

const MOCK_RANKING = {
  studyTime: { rank: 42, topPercent: 12 },
  lesson: { rank: 38, topPercent: 10 },
  acceptedComment: { rank: 15, topPercent: 5 },
};

const MOCK_IN_PROGRESS = [
  { courseId: 1, title: 'React 완벽 가이드', instructor: '신노을', progress: 65, lastStudied: '2026.05.10' },
  { courseId: 2, title: 'TypeScript 심화 학습', instructor: '신노을', progress: 40, lastStudied: '2026.05.09' },
  { courseId: 3, title: 'Node.js 백엔드 개발', instructor: '신노을', progress: 25, lastStudied: '2026.05.08' },
];

const MOCK_COMPLETED = [
  { courseId: 11, title: 'JavaScript 기초', completedAt: '2026.04.15' },
  { courseId: 12, title: 'HTML & CSS 완벽 가이드', completedAt: '2026.03.28' },
];

const MOCK_PAYMENTS = [
  { orderId: 'ORD-20260510-001', date: '2026.05.10 14:30', amount: 49000, status: 'PAID', item: 'React 완벽 가이드' },
  { orderId: 'SUB-20260501-001', date: '2026.05.01 09:00', amount: 19900, status: 'PAID', item: '프리미엄 월간 플랜' },
  { orderId: 'ORD-20260425-002', date: '2026.04.25 09:15', amount: 99000, status: 'PAID', item: 'TypeScript 심화 학습\nNode.js 백엔드 개발' },
  { orderId: 'ORD-20260320-003', date: '2026.03.20 16:45', amount: 39000, status: 'REFUNDED', item: 'Python 기초' },
];

const MOCK_QUIZZES = [
  { quizId: 1, courseTitle: 'React 완벽 가이드', name: 'React 기초 개념 퀴즈', date: '2026.05.12', score: 80 },
  { quizId: 2, courseTitle: 'TypeScript 심화 학습', name: 'TypeScript 타입 시스템 퀴즈', date: '2026.05.10', score: 92 },
  { quizId: 3, courseTitle: 'Node.js 백엔드 개발', name: 'Node.js 중간 점검 퀴즈', date: '2026.05.08', score: 75 },
];

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

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-2xl font-bold text-[#1F2937] leading-8">{title}</h2>
      {action}
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

/* 잔디 더미 셀 생성 — 진할수록 가중치 높음 (5단계: 빈, 1=연함, 4=진함) */
function generateHeatmapCells(type: 'green' | 'orange') {
  const cells: string[] = [];
  const levels =
    type === 'green'
      ? ['bg-[#E2E8F0]', 'bg-[#86EFAC]', 'bg-[#4ADE80]', 'bg-[#22C55E]', 'bg-[#16A34A]']
      : ['bg-[#E2E8F0]', 'bg-[#FED7AA]', 'bg-[#FDBA74]', 'bg-[#FB923C]', 'bg-[#F97316]'];

  for (let i = 0; i < 35; i++) {
    cells.push(levels[Math.floor(Math.random() * 5)]);
  }
  return cells;
}

function Heatmap({ type, monthLabel }: { type: 'green' | 'orange'; monthLabel: string }) {
  const cells = generateHeatmapCells(type);
  const legendColors =
    type === 'green'
      ? ['bg-[#E2E8F0]', 'bg-[#86EFAC]', 'bg-[#4ADE80]', 'bg-[#22C55E]', 'bg-[#16A34A]']
      : ['bg-[#E2E8F0]', 'bg-[#FED7AA]', 'bg-[#FDBA74]', 'bg-[#FB923C]', 'bg-[#F97316]'];

  return (
    <div className="border border-[#E5E7EB] rounded-lg bg-white p-6">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-base font-medium text-[#1F2937]">
          {type === 'green' ? '강의 수' : '학습 시간'}
        </h4>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-[#1F2937]">{monthLabel}</span>
          <button className="text-sm font-medium text-[#3A66E6]">전체보기</button>
        </div>
      </div>

      <div className="flex flex-col items-center">
        {/* 요일 */}
        <div className="grid gap-1 mb-2" style={{ gridTemplateColumns: 'repeat(7, 14px)' }}>
          {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
            <span key={d} className="text-[10px] leading-[15px] text-center text-[#6B7280]">
              {d}
            </span>
          ))}
        </div>

        {/* 셀 */}
        <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(7, 14px)' }}>
          {cells.map((c, i) => (
            <div key={i} className={`w-[14px] h-[14px] rounded ${c}`} />
          ))}
        </div>

        {/* 범례 */}
        <div className="mt-4 flex items-center gap-2 text-xs text-[#6B7280]">
          <span>적음</span>
          <div className="flex gap-1">
            {legendColors.map((c, i) => (
              <div key={i} className={`w-2.5 h-2.5 rounded ${c}`} />
            ))}
          </div>
          <span>많음</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── 메인 페이지 ─────────────────────────── */

export default function MyPage() {
  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <UserHeader />

      {/* 페이지 히어로 */}
      <div className="w-full bg-white border-b border-[#E2E8F0]" style={{ padding: '24px 0 24px 62px' }}>
        <div className="flex items-center gap-3 h-12">
          <div className="w-12 h-12 bg-[#2F5DAA] rounded-[20px] flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/lectureIcon.svg"
              width={24}
              height={24}
              alt=""
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </div>
          <span className="text-[30px] font-bold leading-9 text-[#1F2937] tracking-[0.4px]">FLOWN</span>
        </div>
        <h1 className="mt-3 text-2xl font-bold leading-8 text-[#1F2937]">마이페이지</h1>
        <p className="mt-1 text-base text-[#4B5563] tracking-[-0.31px]">
          내 학습 정보와 활동 기록을 한 곳에서 확인하세요.
        </p>
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
                  {/* TODO: 프로필 수정 모달 — features/users/components/ProfileEditModal.tsx 완성 후 연결 */}
                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 h-12 border border-[#E2E8F0] rounded-[10px] text-base font-semibold text-[#4B5563] hover:bg-[#F8FAFC] transition-colors"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/icons/editIcon.svg" width={16} height={16} alt="" />
                    프로필 수정
                  </button>
                </div>

                {/* 사용자 정보 + 통계 카드 */}
                <div className="flex items-start gap-8">
                  {/* 좌측: 아바타 + 이름 + 이메일 */}
                  <div className="flex items-center gap-6 w-[400px] flex-shrink-0">
                    <div className="w-28 h-28 rounded-full bg-[rgba(47,93,170,0.1)] flex items-center justify-center flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/icons/profileAvatarIcon.svg" width={56} height={56} alt="" />
                    </div>
                    <div className="flex flex-col">
                      <p className="text-2xl font-bold text-[#1F2937] leading-8 mb-1">{MOCK_PROFILE.name}</p>
                      <p className="text-base text-[#4B5563]">{MOCK_PROFILE.email}</p>
                    </div>
                  </div>

                  {/* 우측: 통계 카드 2x2 그리드 */}
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div className="bg-[#F8FAFC] rounded-[20px] p-5">
                      <p className="text-sm text-[#4B5563] mb-2">수강 중인 강의</p>
                      <p className="text-[30px] font-bold leading-9 text-[#2F5DAA]">
                        {MOCK_PROFILE.inProgressCount}개
                      </p>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-[20px] p-5">
                      <p className="text-sm text-[#4B5563] mb-2">수강 완료</p>
                      <p className="text-[30px] font-bold leading-9 text-[#16A34A]">
                        {MOCK_PROFILE.completedCount}개
                      </p>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-[20px] p-5">
                      <p className="text-sm text-[#4B5563] mb-2">오늘 순공시간</p>
                      <p className="text-[30px] font-bold leading-9 text-[#F59E0B]">
                        {MOCK_PROFILE.todayStudyTime}
                      </p>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-[20px] p-5">
                      <p className="text-sm text-[#4B5563] mb-2">현재 연속 학습일</p>
                      <p className="text-[30px] font-bold leading-9 text-[#EF4444]">{MOCK_PROFILE.streakDays}일</p>
                    </div>
                  </div>
                </div>

                {/* 구분선 + 랭킹 */}
                <div className="border-t border-[#E2E8F0] pt-8">
                  <h3 className="text-xl font-semibold text-[#1F2937] mb-5">랭킹 요약</h3>
                  <div className="grid grid-cols-3 gap-5">
                    {[
                      { label: '순공시간 순위', rank: MOCK_RANKING.studyTime.rank, pct: MOCK_RANKING.studyTime.topPercent },
                      { label: '수강량 순위', rank: MOCK_RANKING.lesson.rank, pct: MOCK_RANKING.lesson.topPercent },
                      { label: '채택 순위', rank: MOCK_RANKING.acceptedComment.rank, pct: MOCK_RANKING.acceptedComment.topPercent },
                    ].map((r) => (
                      <div key={r.label} className="bg-[rgba(47,93,170,0.05)] rounded-[20px] text-center pt-6 pb-6">
                        <p className="text-sm font-medium text-[#4B5563] mb-2">{r.label}</p>
                        <p className="text-4xl font-bold text-[#2F5DAA] leading-10 mb-2">{r.rank}위</p>
                        <p className="text-sm text-[#4B5563]">상위 {r.pct}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* ── 학습 기록 ── */}
            <div className="flex flex-col gap-3">
              <div>
                <h2 className="text-2xl font-bold text-[#1F2937] leading-8">학습 기록</h2>
                <p className="mt-1 text-base text-[#4B5563]">날짜별 수강량과 순공시간을 확인하세요.</p>
              </div>

              <SectionCard>
                <div className="p-8">
                  <div className="grid grid-cols-2 gap-[84px]">
                    <Heatmap type="green" monthLabel="2026년 5월" />
                    <Heatmap type="orange" monthLabel="2026년 5월" />
                  </div>
                </div>
              </SectionCard>
            </div>

            {/* ── 수강 중인 강의 ── */}
            <div className="flex flex-col">
              <SectionHeader title="수강 중인 강의" action={<ViewAllLink href="/mypage/courses/in-progress" />} />
              <SectionCard>
                <div className="p-[33px] flex flex-col gap-5">
                  {MOCK_IN_PROGRESS.map((c) => (
                    <div key={c.courseId} className="border border-[#E2E8F0] rounded-[20px] p-5 flex gap-5">
                      <div className="w-40 h-24 bg-[#F8FAFC] rounded-2xl flex items-center justify-center flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/icons/courseThumbnailIcon.svg" width={48} height={48} alt="" />
                      </div>
                      <div className="flex-1 flex flex-col gap-3">
                        <div>
                          <p className="text-lg font-semibold leading-7 text-[#1F2937]">{c.title}</p>
                          <p className="text-sm text-[#4B5563] mt-0.5">{c.instructor}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-[#4B5563]">진도율</span>
                            <span className="text-base font-bold text-[#2F5DAA]">{c.progress}%</span>
                          </div>
                          <div className="w-full h-2.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                            <div className="h-full bg-[#2F5DAA] rounded-full" style={{ width: `${c.progress}%` }} />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#4B5563]">최근 학습: {c.lastStudied}</span>
                          <Link
                            href={`/learning/videos/${c.courseId}`}
                            className="w-[95px] h-10 bg-[#2F5DAA] rounded-[10px] flex items-center justify-center text-white text-base font-semibold hover:bg-[#1D3E75] transition-colors"
                          >
                            이어보기
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>

            {/* ── 수강 완료 ── */}
            <div className="flex flex-col">
              <SectionHeader title="수강 완료" action={<ViewAllLink href="/mypage/courses/completed" />} />
              <SectionCard>
                <div className="p-[33px] flex flex-col gap-5">
                  {MOCK_COMPLETED.map((c) => (
                    <div key={c.courseId} className="border border-[#E2E8F0] rounded-[20px] p-5 flex gap-5 items-center">
                      <div className="w-40 h-24 bg-[#F8FAFC] rounded-2xl flex items-center justify-center flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/icons/trophyIcon.svg" width={48} height={48} alt="" />
                      </div>
                      <div className="flex-1 flex flex-col gap-3">
                        <p className="text-lg font-semibold leading-7 text-[#1F2937]">{c.title}</p>
                        <div className="w-full h-2.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                          <div className="h-full bg-[#16A34A] rounded-full" style={{ width: '100%' }} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#4B5563]">완료일: {c.completedAt}</span>
                          <span className="px-4 py-2 bg-[rgba(22,163,74,0.1)] text-[#16A34A] text-sm font-semibold rounded-2xl">
                            수강 완료
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>

            {/* ── 결제 내역 ── */}
            <div className="flex flex-col">
              <SectionHeader title="결제 내역" action={<ViewAllLink href="/mypage/payments" />} />
              <SectionCard>
                <div className="p-[33px]">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                        <th className="h-[52px] px-5 text-left text-sm font-bold text-[#1F2937]">주문번호</th>
                        <th className="h-[52px] px-5 text-left text-sm font-bold text-[#1F2937]">결제일시</th>
                        <th className="h-[52px] px-5 text-left text-sm font-bold text-[#1F2937]">결제금액</th>
                        <th className="h-[52px] px-5 text-left text-sm font-bold text-[#1F2937]">상태</th>
                        <th className="h-[52px] px-5 text-left text-sm font-bold text-[#1F2937]">구매 내역</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_PAYMENTS.map((p) => (
                        <tr key={p.orderId} className="border-b border-[#E2E8F0]">
                          <td className="py-5 px-5 text-base font-semibold text-[#1F2937]">{p.orderId}</td>
                          <td className="py-5 px-5 text-base text-[#4B5563]">{p.date}</td>
                          <td className="py-5 px-5 text-lg font-bold text-[#1F2937]">
                            {p.amount.toLocaleString()}원
                          </td>
                          <td className="py-5 px-5">
                            <span
                              className={`inline-flex items-center justify-center min-w-[56px] h-8 px-3 rounded-2xl text-sm font-semibold ${
                                p.status === 'PAID'
                                  ? 'bg-[rgba(22,163,74,0.1)] text-[#16A34A]'
                                  : 'bg-[rgba(75,85,99,0.1)] text-[#4B5563]'
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="py-5 px-5 text-base text-[#4B5563] whitespace-pre-line">{p.item}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
            </div>

            {/* ── 내 퀴즈 ── */}
            <div className="flex flex-col">
              <SectionHeader title="내 퀴즈" />
              <SectionCard>
                <div className="p-[33px]">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                        <th className="h-[52px] px-5 text-left text-sm font-bold text-[#1F2937]">강의명</th>
                        <th className="h-[52px] px-5 text-left text-sm font-bold text-[#1F2937]">퀴즈명</th>
                        <th className="h-[52px] px-5 text-left text-sm font-bold text-[#1F2937]">응시일</th>
                        <th className="h-[52px] px-5 text-left text-sm font-bold text-[#1F2937]">점수</th>
                        <th className="h-[52px] px-5 text-left text-sm font-bold text-[#1F2937]">결과 보기</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_QUIZZES.map((q) => (
                        <tr key={q.quizId} className="border-b border-[#E2E8F0]">
                          <td className="py-5 px-5 text-base font-semibold text-[#1F2937]">{q.courseTitle}</td>
                          <td className="py-5 px-5 text-base text-[#4B5563]">{q.name}</td>
                          <td className="py-5 px-5 text-base text-[#4B5563]">{q.date}</td>
                          <td className="py-5 px-5">
                            <span
                              className={`text-xl font-bold ${
                                q.score >= 80 ? 'text-[#16A34A]' : 'text-[#F59E0B]'
                              }`}
                            >
                              {q.score}점
                            </span>
                          </td>
                          <td className="py-5 px-5">
                            <button className="w-[95px] h-10 bg-[#2F5DAA] rounded-[10px] text-white text-base font-semibold hover:bg-[#1D3E75] transition-colors">
                              확인하기
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
    </div>
  );
}
