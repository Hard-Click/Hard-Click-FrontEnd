import Image from 'next/image';
import Link from 'next/link';

interface StudyPostCardProps {
  id: number;
  title: string;
  subjectName: string;
  description: string;
  currentCount: number;
  maxCount: number;
  author: string;
  time: string;
  variant?: 'list' | 'grid';
}

export default function StudyPostCard({
  id,
  title,
  subjectName,
  description,
  currentCount,
  maxCount,
  author,
  time,
  variant = 'grid',
}: StudyPostCardProps) {
  const isFull = currentCount >= maxCount;

  if (variant === 'list') {
    return (
      <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
        {/* 배지 */}
        <div className="mb-4 flex items-center gap-2">
          <span className="rounded-full bg-[#EEF2FF] px-3 py-1 text-xs font-semibold text-[#2F5DAA]">
            {subjectName}
          </span>
          <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${isFull ? 'bg-[#EF4444]/10 text-[#EF4444]' : 'bg-[#16A34A]/10 text-[#16A34A]'}`}>
            <Image src="/icons/commustudy.svg" alt="study" width={12} height={12} />
            {isFull ? '모집 마감' : '모집 중'}
          </span>
        </div>
  
        {/* 제목 */}
        <h3 className="mb-5 text-xl font-bold text-[#1E293B]">{title}</h3>
  
        {/* 하단 — CommunityPostCard 동일 구조 */}
        <div className="flex items-center justify-between text-sm text-[#64748B]">
          <div className="flex items-center gap-4">
            <span>{author}</span>
            <div className="flex items-center gap-1">
              <Image src="/icons/clockGrayIcon.svg" alt="time" width={14} height={14} />
              <span>{time}</span>
            </div>
            <div className="flex items-center gap-1">
              <Image src="/icons/commustudy.svg" alt="members" width={14} height={14} />
              <span>{currentCount}/{maxCount}</span>
            </div>
          </div>
          {isFull ? (
  <button type="button" disabled className="w-20 rounded-2xl bg-[#E2E8F0] py-3 text-sm font-semibold text-[#9CA3AF]">
    정원 마감
  </button>
) : (
  <Link href={`/community/${id}`} className="block w-20 rounded-2xl bg-[#2F5DAA] py-3 text-center text-sm font-semibold text-white transition hover:opacity-90">
    참여하기
  </Link>
)}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
      {/* 과목 태그 */}
      <span className="mb-3 inline-block rounded-full bg-[#EEF2FF] px-3 py-1 text-xs font-semibold text-[#2F5DAA]">
        {subjectName}
      </span>
      {/* 제목 + 인원 */}
      <div className="mb-3 flex items-start justify-between">
        <h3 className="text-lg font-bold text-[#1E293B]">{title}</h3>
        <span className={`flex items-center gap-1 text-sm font-semibold ${isFull ? 'text-[#EF4444]' : 'text-[#4B5563]'}`}>
          <Image src="/icons/commustudy.svg" alt="members" width={14} height={14} />
          {currentCount}/{maxCount}
        </span>
      </div>

      

      {/* 설명 */}
      <p className="mb-5 text-sm text-[#4B5563]">{description}</p>

      {/* 버튼 */}
      {isFull ? (
        <button type="button" disabled className="w-full rounded-2xl bg-[#E2E8F0] py-3 text-sm font-semibold text-[#9CA3AF]">
          정원 마감
        </button>
      ) : (
        <Link href={`/community/${id}`} className="block w-full rounded-2xl bg-[#2F5DAA] py-3 text-center text-sm font-semibold text-white transition hover:opacity-90">
          참여하기
        </Link>
      )}
    </div>
  );
}