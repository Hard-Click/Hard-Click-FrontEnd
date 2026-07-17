'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/toast';
import {
  enterStudyChatAction,
  joinStudyChatAction,
} from '@/features/study/actions';

interface StudyPostCardProps {
  id: number;
  title: string;
  subjectName: string;
  description: string;
  currentCount: number;
  maxCount: number;
  author: string;
  time: string;
  isMine?: boolean;
  isJoined?: boolean;
  variant?: 'list' | 'grid';
  hrefPrefix?: string;
  /** true면 소유자 수정/삭제 버튼 숨김 (관리자 조회용) */
  readOnly?: boolean;
  /** 제공되면 수정 버튼 없이 삭제 버튼만 표시 (관리자 삭제용) */
  onDelete?: (id: number) => void;
  /** 제공되면 입장/참여/마감 대신 이 라벨로 고정 표시 (관리자 조회용) */
  actionLabel?: string;
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
  isMine = false,
  isJoined = false,
  variant = 'grid',
  hrefPrefix = '/community',
  readOnly = false,
  onDelete,
  actionLabel,
}: StudyPostCardProps) {
  const isFull = currentCount >= maxCount;
  const router = useRouter();
  const [pending, setPending] = useState(false);

  // 입장/참여 → 액션으로 chatRoomId 얻어 채팅방으로. (목록엔 chatRoomId가 없어 클릭 시 조회/참여)
  const goChat = async (
    action: (
      groupId: number,
    ) => Promise<{ success: boolean; chatRoomId?: number; message: string }>,
  ) => {
    if (pending) return;
    setPending(true);
    const res = await action(id);
    if (res.success && res.chatRoomId) {
      if (res.message) toast.success(res.message);
      router.push(`/chat/${res.chatRoomId}`);
    } else {
      toast.error(res.message || '채팅방을 열지 못했어요.');
      setPending(false);
    }
  };

  // 소유자 액션 영역: 관리자(onDelete)면 삭제만, 본인 글이면 수정+삭제
  const renderOwnerActions = () => {
    if (onDelete) {
      return (
        <button
          type="button"
          onClick={() => onDelete(id)}
          className="text-[#EF4444]"
        >
          <Image src="/icons/trashIcon.svg" alt="delete" width={18} height={18} />
        </button>
      );
    }
    if (isMine && !readOnly) {
      return (
        <>
          <Link href={`${hrefPrefix}/${id}/edit`} className="text-[#2F5DAA]">
            <Image src="/icons/editIcon.svg" alt="edit" width={18} height={18} />
          </Link>
          <button type="button" className="text-[#EF4444]">
            <Image src="/icons/trashIcon.svg" alt="delete" width={18} height={18} />
          </button>
        </>
      );
    }
    return null;
  };

  // 함수를 한 번만 호출 (variant당 한 번 렌더)
  const ownerActions = renderOwnerActions();

  // 버튼 우선순위: 내 글 > 참여함 > 정원마감 > 참여하기
  const renderButton = (full: boolean) => {
    const widthClass = variant === 'list' ? 'w-24' : 'w-full';
    if (actionLabel) {
      return (
        <Link
          href={`${hrefPrefix}/${id}`}
          className={`block ${widthClass} rounded-2xl bg-[#2F5DAA] py-3 text-center text-sm font-semibold text-white transition hover:opacity-90`}
        >
          {actionLabel}
        </Link>
      );
    }
    if (isMine || isJoined) {
      // 참여 중/내 스터디 → 채팅방 입장
      return (
        <button
          type="button"
          disabled={pending}
          onClick={() => goChat(enterStudyChatAction)}
          className={`${widthClass} rounded-2xl bg-[#2F5DAA] py-3 text-center text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60`}
        >
          {pending ? '여는 중…' : '입장하기'}
        </button>
      );
    }
    if (full) {
      // ⚠️ 정원이 찼어도 **이미 참여 중이면 입장**할 수 있어야 한다(내가 만든 스터디도 모집이 차면 여기 걸림).
      //   목록이 isMine/isJoined를 안 줘서(BE StudyListResponse.StudyItem에 필드 없음) 참여 여부를 알 수 없으므로
      //   클릭을 막지 않고 **액션이 판별**하게 한다. BE join()은 SG005(이미 참여)를 SG006(정원 참)보다
      //   먼저 검사하므로(StudyCommandService.join) — 참여자: SG005 → 채팅방 입장 /
      //   비참여자: SG006 "정원이 가득 차 참여할 수 없습니다" 정직 안내(§0.1④).
      //   (BE가 목록에 isMine/isJoined를 주면 위 분기가 정확한 라벨을 그려 이 우회는 불필요해짐)
      return (
        <button
          type="button"
          disabled={pending}
          onClick={() => goChat(joinStudyChatAction)}
          title="이미 참여 중이면 채팅방으로 입장합니다"
          className={`${widthClass} rounded-2xl bg-[#E2E8F0] py-3 text-sm font-semibold text-[#4B5563] transition hover:bg-[#CBD5E1] disabled:opacity-60`}
        >
          {pending ? '여는 중…' : '정원 마감'}
        </button>
      );
    }
    // 미참여 → 참여 후 채팅방 입장
    return (
      <button
        type="button"
        disabled={pending}
        onClick={() => goChat(joinStudyChatAction)}
        className={`${widthClass} rounded-2xl bg-[#2F5DAA] py-3 text-center text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60`}
      >
        {pending ? '참여 중…' : '참여하기'}
      </button>
    );
  };

  if (variant === 'list') {
    return (
      <div className="relative rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
        {/* 우측 상단: 내 글 수정/삭제 (관리자는 삭제만) */}
        {ownerActions && (
          <div className="absolute right-6 top-6 flex items-center gap-2">
            {ownerActions}
          </div>
        )}

        {/* 우측 하단: 입장/참여 버튼 */}
        <div className="absolute bottom-6 right-6">{renderButton(isFull)}</div>

        {/* 배지 */}
        <div className="mb-4 flex items-center gap-2">
          <span className="rounded-full bg-[#EEF2FF] px-3 py-1 text-xs font-semibold text-[#2F5DAA]">
            {subjectName}
          </span>
          <span
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
              isFull
                ? 'bg-[#EF4444]/10 text-[#EF4444]'
                : 'bg-[#16A34A]/10 text-[#16A34A]'
            }`}
          >
            <Image
              src="/icons/commustudy.svg"
              alt="study"
              width={12}
              height={12}
            />
            {isFull ? '모집 마감' : '모집 중'}
          </span>
        </div>

        {/* 제목 */}
        <h3 className="mb-5 text-xl font-bold text-[#1E293B]">{title}</h3>

        {/* 하단 — 작성자/시간/인원 */}
        <div className="flex items-center gap-4 text-sm text-[#64748B]">
          <span>{author}</span>
          <div className="flex items-center gap-1">
            <Image
              src="/icons/clockGrayIcon.svg"
              alt="time"
              width={14}
              height={14}
            />
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-1">
            <Image
              src="/icons/commustudy.svg"
              alt="members"
              width={14}
              height={14}
            />
            <span>
              {currentCount}/{maxCount}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
      {/* 과목 태그 + 내 글 수정/삭제 */}
      <div className="mb-3 flex items-center justify-between">
        <span className="inline-block rounded-full bg-[#EEF2FF] px-3 py-1 text-xs font-semibold text-[#2F5DAA]">
          {subjectName}
        </span>
        {ownerActions && (
          <div className="flex items-center gap-2">{ownerActions}</div>
        )}
      </div>

      {/* 제목 + 인원 */}
      <div className="mb-3 flex items-start justify-between">
        <h3 className="text-lg font-bold text-[#1E293B]">{title}</h3>
        <span
          className={`flex items-center gap-1 text-sm font-semibold ${
            isFull ? 'text-[#EF4444]' : 'text-[#4B5563]'
          }`}
        >
          <Image
            src="/icons/commustudy.svg"
            alt="members"
            width={14}
            height={14}
          />
          {currentCount}/{maxCount}
        </span>
      </div>

      {/* 설명 */}
      <p className="mb-5 text-sm text-[#4B5563]">{description}</p>

      {/* 버튼 */}
      {renderButton(isFull)}
    </div>
  );
}
