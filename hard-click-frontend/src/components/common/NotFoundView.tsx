'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import UserHeader from '@/components/layout/headers/UserHeader';

type ErrorCode = '404' | '403' | '401' | '500';

interface ErrorViewProps {
  code?: ErrorCode;
  title?: string;
  description?: string;
}

const ERROR_PRESETS: Record<ErrorCode, { title: string; description: string }> = {
  '404': {
    title: '페이지를 찾을 수 없습니다',
    description: '요청하신 페이지가 존재하지 않거나 삭제되었습니다.\n주소를 다시 확인해주세요.',
  },
  '403': {
    title: '접근 권한이 없습니다',
    description: '이 페이지에 접근할 권한이 없습니다.\n관리자에게 문의해주세요.',
  },
  '401': {
    title: '로그인이 필요합니다',
    description: '이 페이지는 로그인 후 이용 가능합니다.\n로그인 페이지로 이동해주세요.',
  },
  '500': {
    title: '서버 오류가 발생했습니다',
    description: '일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.',
  },
};

export default function NotFoundView({ code = '404', title, description }: ErrorViewProps) {
  const router = useRouter();

  const preset = ERROR_PRESETS[code];
  const displayTitle = title ?? preset.title;
  const displayDescription = description ?? preset.description;

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col">
      <UserHeader />

      <div className="flex-1 bg-[#F8FAFC] flex items-center justify-center px-4">
        <div className="w-[448px] flex flex-col items-center gap-8">

          {/* 아이콘 + 코드 + 제목 + 설명 */}
          <div className="flex flex-col items-center w-full">
            {/* 에러 코드별 아이콘 (파란 원) */}
            <div className="w-32 h-32 rounded-full bg-[rgba(47,93,170,0.1)] flex items-center justify-center">
              {code === '404' && (
                /* 돋보기 — 페이지 찾기 */
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src="/icons/searchIcon.svg" width={64} height={64} alt="" />
              )}
              {code === '403' && (
                /* 자물쇠 — 접근 권한 없음 */
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <rect x="13.33" y="29.33" width="37.33" height="29.33" rx="2.67" stroke="#2F5DAA" strokeWidth="5.33" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21.33 29.33V18.67a10.67 10.67 0 0121.33 0v10.67" stroke="#2F5DAA" strokeWidth="5.33" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              {code === '401' && (
                /* 사용자 — 로그인 필요 */
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <path d="M53.33 56v-5.33a10.67 10.67 0 00-10.66-10.67H21.33A10.67 10.67 0 0010.67 50.67V56" stroke="#2F5DAA" strokeWidth="5.33" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="32" cy="18.67" r="10.67" stroke="#2F5DAA" strokeWidth="5.33" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              {code === '500' && (
                /* 경고 — 서버 오류 */
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="26.67" stroke="#2F5DAA" strokeWidth="5.33" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M32 21.33V32" stroke="#2F5DAA" strokeWidth="5.33" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M32 42.67h.03" stroke="#2F5DAA" strokeWidth="5.33" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>

            {/* 에러 코드 */}
            <h1 className="text-[60px] font-bold leading-[60px] tracking-[0.26px] text-[#2F5DAA] mt-6">
              {code}
            </h1>

            {/* 제목 */}
            <h2 className="text-2xl font-bold leading-8 tracking-[0.07px] text-[#1F2937] mt-4">
              {displayTitle}
            </h2>

            {/* 설명 */}
            <p className="text-base leading-[26px] tracking-[-0.31px] text-[#4B5563] text-center whitespace-pre-line mt-3">
              {displayDescription}
            </p>
          </div>

          {/* 버튼 */}
          <div className="w-full flex flex-col gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full h-12 border border-[#E2E8F0] rounded-[10px] flex items-center justify-center gap-2 text-base font-semibold text-[#4B5563] hover:bg-[#F8FAFC] transition-colors"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/arrowLeftIcon.svg" width={20} height={20} alt="" />
              이전 페이지로
            </button>

            <Link
              href="/courses"
              className="w-full h-12 bg-[#2F5DAA] rounded-[10px] flex items-center justify-center gap-2 text-base font-semibold text-white hover:bg-[#264a87] transition-colors"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/homeWhiteIcon.svg" width={20} height={20} alt="" />
              홈으로 이동
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
