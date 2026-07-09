'use client';

/**
 * 채팅 실시간 소켓 훅 — STOMP 연결 seam (BE 확정 명세 docs §7 기준).
 *
 * ⚠️ 현재는 BE 미배포라 **실제 STOMP 연결이 없다.**
 *   - mock 모드: 디자인 확인용 choreography(입력중→수신 메시지)만 재생. 내 메시지는 로컬 낙관 반영.
 *     "되는 척"이 아니라 명시적 mock(§0.1). 실서버 붙기 전까지 진짜 송수신 아님.
 *   - 실연결(live): 아래 순서로 활성화(연결 URL·티켓은 확정됨, 배포 후 client.activate()만 켜면 됨).
 *       1) POST /api/chat/socket-tickets (BFF 경유·응답 body의 ticket)
 *       2) new Client({ brokerURL: `${WS_BASE}/ws-chat`, connectHeaders:{Authorization:`Bearer ${ticket}`} })
 *       3) subscribe(`/sub/chat-rooms/${id}`) → 이벤트 type 5분기(handleEvent)
 *
 * 계약: onMessage·onParticipants·onTypingChange는 **안정 참조**(useCallback/setState)로 넘긴다.
 *       매 렌더 새 함수면 effect가 재실행되어 소켓이 재연결된다.
 */

import { useCallback, useEffect } from 'react';
import { isMock } from '@/mocks/config';
import type { ChatMessage, ChatParticipant } from '../types';

interface UseChatSocketArgs {
  chatRoomId: number;
  myMemberId: number;
  myName: string;
  /** 리스트에 추가할 메시지(CHAT·SYSTEM_JOIN/LEAVE) */
  onMessage: (message: ChatMessage) => void;
  /** 참여자 목록/카운트 갱신(SYSTEM_JOIN/LEAVE·PRESENCE_UPDATE) */
  onParticipants: (participants: ChatParticipant[], count?: number) => void;
  /** 현재 입력 중인 사람 이름 목록(나 제외) */
  onTypingChange: (typingNames: string[]) => void;
  /** 본인이 강퇴/방 해산으로 방에서 튕겨나감 → 이탈 처리(토스트+스터디 게시판) */
  onEject: (reason: '강퇴' | '해산') => void;
}

interface UseChatSocketReturn {
  /** /pub/chat-rooms/{id} 발행 — body는 {content}만. live는 echo로 돌아와 렌더(낙관 X) */
  sendMessage: (content: string) => void;
  /** /pub/chat-rooms/{id}/typing 빈 프레임 발행. 입력 중 throttle은 호출부(MessageInput) */
  sendTyping: () => void;
}

/** 3초 무이벤트면 입력중 표시를 끈다(BE는 "입력 중지" 이벤트 없음, §7). */
const TYPING_TTL_MS = 3000;

export function useChatSocket({
  chatRoomId,
  myMemberId,
  myName,
  onMessage,
  onParticipants,
  onTypingChange,
  onEject,
}: UseChatSocketArgs): UseChatSocketReturn {
  useEffect(() => {
    // memberId별 입력중 타이머/이름 관리(effect 스코프 로컬). TYPING 수신마다 리셋, TTL 후 제거.
    const typingTimers = new Map<number, ReturnType<typeof setTimeout>>();
    const typingNames = new Map<number, string>();
    const emitTyping = () => onTypingChange([...typingNames.values()]);

    /** TYPING 수신 처리(본인 무시·TTL 리셋). CHAT/PRESENCE_UPDATE 등 실이벤트에서 재사용. */
    const bumpTyping = (memberId: number, name: string) => {
      if (memberId === myMemberId) return;
      typingNames.set(memberId, name);
      emitTyping();
      const prev = typingTimers.get(memberId);
      if (prev) clearTimeout(prev);
      typingTimers.set(
        memberId,
        setTimeout(() => {
          typingNames.delete(memberId);
          typingTimers.delete(memberId);
          emitTyping();
        }, TYPING_TTL_MS),
      );
    };

    if (isMock('chat')) {
      // ── mock choreography(명시적 mock): 입력중(1.5s) → 표시 끄고 수신 메시지(3.8s) ──
      const t1 = setTimeout(() => bumpTyping(2, '이클릭'), 1500);
      const t2 = setTimeout(() => {
        const timer = typingTimers.get(2);
        if (timer) clearTimeout(timer);
        typingNames.delete(2);
        emitTyping();
        onMessage({
          messageId: 106,
          type: 'CHAT',
          senderId: 2,
          senderName: '이클릭',
          content: '좋아요, 그때 봬요! 😊',
          sentAt: new Date().toISOString(),
        });
      }, 3800);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        typingTimers.forEach((t) => clearTimeout(t));
      };
    }

    // ── live: STOMP 실연결 seam (BE 배포 후 활성화, docs §7 확정) ──
    // const { ticket } = (await clientApi.post('/api/chat/socket-tickets')).data; // 30초 1회용, BFF가 인증 주입
    // const WS_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/^http/, 'ws'); // http→ws / https→wss
    // const client = new Client({
    //   brokerURL: `${WS_BASE}/ws-chat`,
    //   connectHeaders: { Authorization: `Bearer ${ticket}` },   // 재연결 시 새 티켓 재발급
    //   onConnect: () => client.subscribe(`/sub/chat-rooms/${chatRoomId}`, (f) => handleEvent(JSON.parse(f.body))),
    // });
    // function handleEvent(e: ChatSocketEvent) {
    //   switch (e.type) {
    //     case 'CHAT': onMessage(e); return;                                  // echo 대기(낙관 X). senderId===myMemberId → 우측
    //     case 'SYSTEM_JOIN':
    //     case 'SYSTEM_LEAVE':
    //     case 'SYSTEM_KICK':
    //       onMessage({ messageId: Date.now(), type: e.type, senderId: null, senderName: null, content: e.message, sentAt: new Date().toISOString() });
    //       onParticipants(e.participants, e.participantCount);
    //       if (e.type === 'SYSTEM_KICK' && e.kickedMemberId === myMemberId) onEject('강퇴'); // 본인이 강퇴됨 → 방 이탈
    //       return;
    //     case 'SYSTEM_CLOSED': onEject('해산'); return;                       // 방 종료 → 전원 이탈
    //     case 'TYPING': bumpTyping(e.memberId, e.name); return;              // 본인 것은 bumpTyping이 무시
    //     case 'PRESENCE_UPDATE': onParticipants(e.participants); return;
    //   }
    // }
    // client.activate();
    // return () => { client.deactivate(); typingTimers.forEach((t) => clearTimeout(t)); };
    // (활성화 시 onEject 콜백 추가 → ChatRoomClient가 토스트+router.push(스터디 게시판))
    console.warn(
      '[chat] STOMP 실연결 미구현 — 방',
      chatRoomId,
      ': BE 배포 후 seam 활성화. mock 동작 중.',
    );
    void onParticipants; // live seam에서 사용(현재 mock 경로 미사용)
    void onEject; //        live seam에서 사용(강퇴/해산 당함 → 방 이탈)
    return () => {
      typingTimers.forEach((t) => clearTimeout(t));
    };
  }, [
    chatRoomId,
    myMemberId,
    onMessage,
    onParticipants,
    onTypingChange,
    onEject,
  ]);

  const sendMessage = useCallback(
    (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;

      if (isMock('chat')) {
        // mock: 낙관적 로컬 반영. live는 아래 발행 → /sub echo로 돌아온 걸 그린다(낙관 X).
        onMessage({
          messageId: Date.now(),
          type: 'CHAT',
          senderId: myMemberId,
          senderName: myName,
          content: trimmed,
          sentAt: new Date().toISOString(),
        });
        return;
      }
      // live seam: client.publish({ destination: `/pub/chat-rooms/${chatRoomId}`, body: JSON.stringify({ content: trimmed }) });
      console.warn('[chat] 메시지 발행 미구현(seam) — 방', chatRoomId, trimmed);
    },
    [chatRoomId, myMemberId, myName, onMessage],
  );

  const sendTyping = useCallback(() => {
    if (isMock('chat')) return; // mock: 발행 대상 없음
    // live seam: client.publish({ destination: `/pub/chat-rooms/${chatRoomId}/typing`, body: '' }); // 빈 프레임
    console.warn('[chat] 타이핑 발행 미구현(seam) — 방', chatRoomId);
  }, [chatRoomId]);

  return { sendMessage, sendTyping };
}
