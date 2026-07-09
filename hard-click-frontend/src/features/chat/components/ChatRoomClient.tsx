'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/toast';
import { maskName } from '@/lib/formatter';
import ConfirmModal from '@/components/ui/confirmModal';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ParticipantSidebar from './ParticipantSidebar';
import { useChatSocket } from '../hooks/useChatSocket';
import {
  kickMemberAction,
  dissolveRoomAction,
  leaveStudyChatAction,
  loadOlderMessagesAction,
} from '../actions';
import type {
  ChatRoomDetail,
  ChatHistoryPage,
  ChatMessage,
  ChatParticipant,
} from '../types';

/**
 * 채팅방 client 오케스트레이터 — 메시지·참여자·타이핑 상태 + 소켓·나가기·강퇴·폭파.
 * 실시간 송수신은 useChatSocket(현재 mock, STOMP seam)로 위임.
 * 참여자는 state → SYSTEM_JOIN/LEAVE·PRESENCE_UPDATE·SYSTEM_KICK 이벤트로 실시간 갱신(연동 시).
 */
export default function ChatRoomClient({
  room,
  initialHistory,
  myMemberId,
  returnUrl,
}: {
  room: ChatRoomDetail;
  initialHistory: ChatHistoryPage;
  myMemberId: number;
  /** 이탈(나가기·삭제·강퇴·해산) 시 돌아갈 곳 — 진입 출처에 따라 page가 결정. */
  returnUrl: string;
}) {
  const router = useRouter();
  const viewerIsHost = room.hostId !== null && myMemberId === room.hostId;

  const myName = useMemo(
    () =>
      room.participants.find((p) => p.memberId === myMemberId)?.name ?? '나',
    [room.participants, myMemberId],
  );

  // BE는 최신순(desc)으로 주므로 오래된→최신으로 뒤집어 표시한다.
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    [...initialHistory.messages].reverse(),
  );
  const [participants, setParticipants] = useState<ChatParticipant[]>(
    room.participants,
  );
  const [participantCount, setParticipantCount] = useState(
    room.participantCount,
  );
  const [typingNames, setTypingNames] = useState<string[]>([]);
  const [leaving, setLeaving] = useState(false);
  const [kickTarget, setKickTarget] = useState<ChatParticipant | null>(null);
  const [dissolving, setDissolving] = useState(false);

  // 무한스크롤(옛 메시지). BE는 최신순 커서 페이지네이션 → 위로 올리면 nextCursorId로 더 로드.
  const [hasMore, setHasMore] = useState(initialHistory.hasNext);
  const [cursor, setCursor] = useState<number | null>(
    initialHistory.nextCursorId,
  );
  const [loadingOlder, setLoadingOlder] = useState(false);

  // 안정 참조로 넘겨야 소켓이 매 렌더 재연결되지 않는다(useChatSocket 계약).
  const handleIncoming = useCallback((m: ChatMessage) => {
    setMessages((prev) =>
      prev.some((x) => x.messageId === m.messageId) ? prev : [...prev, m],
    );
  }, []);
  const handleParticipants = useCallback(
    (next: ChatParticipant[], count?: number) => {
      setParticipants(next);
      if (typeof count === 'number') setParticipantCount(count);
    },
    [],
  );
  // 본인이 강퇴/해산으로 튕겨나감(소켓 SYSTEM_KICK/SYSTEM_CLOSED) → 안내 후 스터디 게시판으로.
  const handleEject = useCallback(
    (reason: '강퇴' | '해산') => {
      toast.error(
        reason === '강퇴'
          ? '채팅방에서 내보내졌습니다.'
          : '채팅방이 삭제되었습니다.',
      );
      router.push(returnUrl);
    },
    [router, returnUrl],
  );

  const { sendMessage, sendTyping } = useChatSocket({
    chatRoomId: room.chatRoomId,
    myMemberId,
    myName,
    onMessage: handleIncoming,
    onParticipants: handleParticipants,
    onTypingChange: setTypingNames,
    onEject: handleEject,
  });

  const isClosed = room.status === 'CLOSED';

  // 위로 스크롤 → 옛 메시지 한 페이지 더. 커서 없거나 로딩 중이면 무시(중복 호출 가드).
  const loadOlder = useCallback(async () => {
    if (!hasMore || loadingOlder || cursor == null) return;
    setLoadingOlder(true);
    try {
      const page = await loadOlderMessagesAction(room.chatRoomId, cursor);
      // page.messages는 최신순(desc) → 오래된→최신으로 뒤집어 기존 앞에 붙인다.
      const older = [...page.messages].reverse();
      setMessages((prev) => {
        const seen = new Set(prev.map((m) => m.messageId));
        const fresh = older.filter((m) => !seen.has(m.messageId));
        return fresh.length ? [...fresh, ...prev] : prev;
      });
      setHasMore(page.hasNext);
      setCursor(page.nextCursorId);
    } catch {
      toast.error('이전 메시지를 불러오지 못했어요.');
    } finally {
      setLoadingOlder(false);
    }
  }, [hasMore, loadingOlder, cursor, room.chatRoomId]);

  const handleLeave = async () => {
    setLeaving(false);
    const res = await leaveStudyChatAction(room.groupId);
    if (res.success) {
      toast.success(res.message);
      router.push(returnUrl);
    } else {
      toast.error(res.message);
    }
  };

  const confirmKick = async () => {
    if (!kickTarget) return;
    const target = kickTarget;
    setKickTarget(null);
    const res = await kickMemberAction(room.groupId, target.memberId);
    if (!res.success) {
      toast.error(res.message);
      return;
    }
    // mock 낙관: 참여자 제거 + 시스템 메시지. 실제는 소켓 SYSTEM_KICK(kickedMemberId)으로 갱신.
    setParticipants((prev) =>
      prev.filter((p) => p.memberId !== target.memberId),
    );
    setParticipantCount((c) => Math.max(0, c - 1));
    handleIncoming({
      messageId: Date.now(),
      type: 'SYSTEM_KICK',
      senderId: null,
      senderName: null,
      content: `${maskName(target.name)}님을 내보냈습니다`,
      sentAt: new Date().toISOString(),
    });
    toast.success(res.message);
  };

  const confirmDissolve = async () => {
    setDissolving(false);
    const res = await dissolveRoomAction(room.groupId);
    if (res.success) {
      toast.success(res.message);
      router.push(returnUrl);
    } else {
      toast.error(res.message);
    }
  };

  const handleDissolveClick = () => {
    // 규칙 ①: 방장 혼자 남았을 때만 삭제. 참여자 있으면 안내(먼저 강퇴해야 함).
    if (participants.length > 1) {
      toast.error('아직 참여자가 있어요. 모두 내보낸 뒤에 삭제할 수 있어요.');
      return;
    }
    setDissolving(true);
  };

  return (
    <div className="flex h-full min-h-0 gap-4">
      {/* 좌: 채팅 영역 (화면 높이 고정, 내부만 스크롤) */}
      <section className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_4px_10px_rgba(0,0,0,0.05)]">
        <ChatHeader
          room={room}
          participantCount={participantCount}
          isHost={viewerIsHost}
          onBack={() => router.push(returnUrl)}
          onDissolveClick={handleDissolveClick}
          onLeaveClick={() => setLeaving(true)}
        />
        <MessageList
          messages={messages}
          myMemberId={myMemberId}
          hostId={room.hostId}
          typingNames={typingNames}
          hasMore={hasMore}
          loadingOlder={loadingOlder}
          onLoadOlder={loadOlder}
        />
        <MessageInput
          disabled={isClosed}
          onSend={sendMessage}
          onTyping={sendTyping}
        />
      </section>

      {/* 우: 참여자 */}
      <ParticipantSidebar
        participants={participants}
        myMemberId={myMemberId}
        hostId={room.hostId}
        viewerIsHost={viewerIsHost}
        onKick={(p) => setKickTarget(p)}
      />

      {/* 나가기 확인 */}
      {leaving && (
        <ConfirmModal
          title="채팅방에서 나가시겠습니까?"
          description="나가면 이 방의 대화를 더 이상 볼 수 없어요."
          cancelText="취소"
          confirmText="나가기"
          confirmVariant="danger"
          onCancel={() => setLeaving(false)}
          onConfirm={handleLeave}
        />
      )}

      {/* 강퇴 확인 (방장) */}
      {kickTarget && (
        <ConfirmModal
          title={`${maskName(kickTarget.name)}님을 내보내시겠습니까?`}
          description="내보낸 참여자는 이 방에 다시 들어올 수 없어요."
          cancelText="취소"
          confirmText="내보내기"
          confirmVariant="danger"
          onCancel={() => setKickTarget(null)}
          onConfirm={confirmKick}
        />
      )}

      {/* 채팅방 삭제 확인 (방장) */}
      {dissolving && (
        <ConfirmModal
          title="채팅방을 삭제할까요?"
          description="채팅방과 대화가 모두 삭제되고 되돌릴 수 없어요."
          cancelText="취소"
          confirmText="삭제"
          confirmVariant="danger"
          onCancel={() => setDissolving(false)}
          onConfirm={confirmDissolve}
        />
      )}
    </div>
  );
}
