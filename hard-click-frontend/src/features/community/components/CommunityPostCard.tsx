// 게시글 카드 — 표시 전용 Server Component (상호작용 없음)
import Image from 'next/image';
import Link from 'next/link';

interface CommunityPostCardProps {
  id: number;
  category: string;
  subjectName?: string;
  title: string;
  author: string;
  time: string;
  views: number;
  comments: number;
  status?: string;
  recruit?: string;
  hrefPrefix?: string;
}

export default function CommunityPostCard({
  id,
  category,
  subjectName,
  title,
  author,
  time,
  views,
  comments,
  status,
  hrefPrefix = '/community',
}: CommunityPostCardProps) {
  const isQuestion = category === '질문게시판';

  return (
    <Link
      href={`${hrefPrefix}/${id}`}
      className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm block"
    >
      {/* top badges */}
      <div className="mb-4 flex items-center gap-2">
        {/* category */}

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            category === '질문게시판'
              ? 'bg-[#F59E0B]/10 text-[#F59E0B]'
              : 'bg-[#EEF2FF] text-[#2F5DAA]'
          }`}
        >
          {category}
        </span>

        {subjectName && (
          <span className="rounded-full bg-[#EEF2FF] px-3 py-1 text-xs font-semibold text-[#2F5DAA]">
            {subjectName}
          </span>
        )}

        {isQuestion && status && (
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              status === '채택 완료'
                ? 'bg-[#16A34A]/10 text-[#16A34A]'
                : 'bg-[#F59E0B]/10 text-[#F59E0B]'
            }`}
          >
            {status}
          </span>
        )}
      </div>

      {/* title */}
      <h3 className="mb-5 text-xl font-bold text-[#1E293B]">{title}</h3>

      {/* info */}
      <div className="flex items-center gap-4 text-sm text-[#64748B]">
        <p>{author}</p>

        <div className="flex items-center gap-1">
          <Image
            src="/icons/clockGrayIcon.svg"
            alt="time"
            width={14}
            height={14}
          />
          <p>{time}</p>
        </div>

        <div className="flex items-center gap-1">
          <Image src="/icons/commuEye.svg" alt="views" width={14} height={14} />
          <p>{views}</p>
        </div>

        <div className="flex items-center gap-1">
          <Image
            src="/icons/commuComment.svg"
            alt="comments"
            width={14}
            height={14}
          />
          <p>{comments}</p>
        </div>
      </div>
    </Link>
  );
}
