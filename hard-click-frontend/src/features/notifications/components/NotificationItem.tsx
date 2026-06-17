import Link from 'next/link';
import Image from 'next/image';
import { relativeTime } from '@/lib/formatter';
import { NOTI_META, type NotificationItem as Noti } from '../types';

interface NotificationItemProps {
  item: Noti;
  /** 클릭 시 호출 — 드롭다운 팝오버를 닫는 용도 */
  onNavigate?: () => void;
}

export default function NotificationItem({
  item,
  onNavigate,
}: NotificationItemProps) {
  const meta = NOTI_META[item.type];

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-[#F8FAFC]"
    >
      {/* 종류 아이콘 */}
      <span
        className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: meta.iconBg }}
      >
        <Image src={meta.icon} alt="" aria-hidden width={18} height={18} />
      </span>

      {/* 본문 */}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#2F5DAA]">
            {meta.label}
          </span>
          {!item.isRead && (
            <span
              className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#EF4444]"
              aria-label="읽지 않음"
            />
          )}
        </span>
        <span
          className={`mt-1 block break-words text-sm leading-snug ${
            item.isRead ? 'text-[#6B7280]' : 'font-semibold text-[#1F2937]'
          }`}
        >
          {item.message}
        </span>
        <span className="mt-1.5 block text-xs text-[#9CA3AF]">
          {relativeTime(item.createdAt)}
        </span>
      </span>
    </Link>
  );
}
