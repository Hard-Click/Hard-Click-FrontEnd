'use client';

/**
 * 채팅 실시간 소켓 훅 — STOMP 연결 (BE origin/main 코드검증 2026-07-10, docs §7).
 *
 * ⚠️ 현재 isMock('chat')=true(전역 USE_MOCK) → **live 분기는 실행되지 않는다.**
 *   - mock 모드: 디자인 확인용 choreography(입력중→수신 메시지)만 재생. 내 메시지는 로컬 낙관 반영.
 *     "되는 척"이 아니라 명시적 mock(§0.1). 실서버 붙기 전까지 진짜 송수신 아님.
 *   - live 모드(코드 완성·미검증): 아래가 실제 STOMP 배선. BE에 히스토리·목록 API가 main 머지되고
 *     로그인 200 검증이 끝나면 mocks/config MOCK_OVERRIDE에 chat:false 등록으로 활성화된다.
 *     ⚠️ 라이브 200·on-wire shape는 로그인 필요라 아직 미검증 — 검증 전 flip 금지.
 *
 * live 인증 흐름(2-step, httpOnly 쿠키를 WS에 못 실어서 티켓 우회):
 *   1) issueSocketTicketAction()  → BFF가 쿠키로 인증 · 30초 1회용 티켓(매 재연결마다 재발급)
 *   2) CONNECT `Authorization: Bearer <ticket>` → BE가 consume·memberId 확정(ChatPrincipal)
 *   3) subscribe `/sub/chat-rooms/{id}` → 이벤트 type 7분기(handleEvent)
 *      + subscribe `/user/queue/errors` → 발행 실패 per-user 에러(JSON {errorCode,message})
 *   발행: `/pub/chat-rooms/{id}` {content} · `/pub/chat-rooms/{id}/typing` 빈 프레임.
 *   ⚠️ prod(https)에서 BE가 http면 ws:// 혼합콘텐츠 차단 → 로컬(http)에서 먼저 검증, prod는 BE wss 필요.
 *
 * 계약: onMessage·onParticipants·onTypingChange는 **안정 참조**(useCallback/setState)로 넘긴다.
 *       매 렌더 새 함수면 effect가 재실행되어 소켓이 재연결된다.
 */

import { useCallback, useEffect, useRef } from 'react';
import { Client, type IMessage, type IFrame } from '@stomp/stompjs';
import { toast } from '@/lib/toast';
import { isMock } from '@/mocks/config';
import { issueSocketTicketAction } from '../actions';
import type { ChatMessage, ChatParticipant, ChatSocketEvent } from '../types';

interface UseChatSocketArgs {
  chatRoomId: number;
  myMemberId: number;
  myName: string;
  /** 리스트에 추가할 메시지(CHAT·SYSTEM_JOIN/LEAVE/KICK) */
  onMessage: (message: ChatMessage) => void;
  /** 참여자 목록/카운트 갱신(SYSTEM_JOIN/LEAVE/KICK·PRESENCE_UPDATE) */
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

/** 연속 STOMP 실패 이 횟수 넘으면 자동 재연결 포기(1회용 티켓 무한 소모 방지). onConnect 성공 시 리셋. */
const MAX_STOMP_RETRIES = 3;

/** WS 핸드셰이크 URL — http→ws / https→wss (BE 코드검증: raw WebSocket, SockJS 아님). */
const WS_URL = `${(process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/^http/, 'ws')}/ws-chat`;

export function useChatSocket({
  chatRoomId,
  myMemberId,
  myName,
  onMessage,
  onParticipants,
  onTypingChange,
  onEject,
}: UseChatSocketArgs): UseChatSocketReturn {
  // sendMessage/sendTyping이 발행에 쓰는 활성 STOMP client(live). mock/미연결이면 null.
  const clientRef = useRef<Client | null>(null);
  // 시스템 메시지 합성 id(BE 브로드캐스트엔 messageId 없음). 음수=실 messageId(양수)와 충돌 방지.
  // useRef라 effect 재실행에도 유지 → dedup(ChatRoomClient) 충돌 방지(콜백 불안정해져도 안전).
  const sysSeqRef = useRef(-1);

  useEffect(() => {
    // memberId별 입력중 타이머/이름 관리(effect 스코프 로컬). TYPING 수신마다 리셋, TTL 후 제거.
    const typingTimers = new Map<number, ReturnType<typeof setTimeout>>();
    const typingNames = new Map<number, string>();
    const emitTyping = () => onTypingChange([...typingNames.values()]);

    /** TYPING 수신 처리(본인 무시·TTL 리셋). */
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

    // ── live: STOMP 실연결 (BE 코드검증 계약, 라이브 200 미검증) ──
    let stompFailCount = 0; // 연속 실패 카운터(onConnect 성공 시 0으로 리셋)
    let stompErrorToasted = false;

    const handleEvent = (e: ChatSocketEvent) => {
      switch (e.type) {
        case 'CHAT':
          // 본인 것도 echo로 돌아온다(senderId===myMemberId → ChatRoomClient가 우측 렌더). senderName은 BE가 마스킹.
          onMessage({
            messageId: e.messageId,
            type: 'CHAT',
            senderId: e.senderId,
            senderName: e.senderName,
            content: e.content,
            sentAt: e.sentAt,
          });
          return;
        case 'SYSTEM_JOIN':
        case 'SYSTEM_LEAVE':
          onMessage({
            messageId: sysSeqRef.current--,
            type: e.type,
            senderId: null,
            senderName: null,
            content: e.message, // BE가 이미 마스킹한 문장(예: "홍*동님이 입장했습니다")
            sentAt: new Date().toISOString(),
          });
          onParticipants(e.participants, e.participantCount);
          return;
        case 'SYSTEM_KICK':
          onMessage({
            messageId: sysSeqRef.current--,
            type: 'SYSTEM_KICK',
            senderId: null,
            senderName: null,
            content: e.message,
            sentAt: new Date().toISOString(),
          });
          onParticipants(e.participants, e.participantCount);
          if (e.kickedMemberId === myMemberId) onEject('강퇴'); // 본인이 강퇴됨 → 방 이탈
          return;
        case 'SYSTEM_CLOSED':
          onEject('해산'); // 방 종료 → 전원 이탈 (payload는 {type,message}만)
          return;
        case 'TYPING':
          bumpTyping(e.memberId, e.name); // 본인 것은 bumpTyping이 무시
          return;
        case 'PRESENCE_UPDATE':
          onParticipants(e.participants); // count 없음 → ChatRoomClient가 length로 보정
          return;
      }
    };

    const client = new Client({
      brokerURL: WS_URL,
      reconnectDelay: 5000,
      // 티켓은 30초·1회용(getAndDelete) → 매 (재)연결 직전 새로 발급. beforeConnect는 async 지원.
      beforeConnect: async () => {
        const t = await issueSocketTicketAction();
        // 발급 실패면 헤더 없이 진행 → BE가 "소켓 티켓이 없습니다"로 끊고 reconnectDelay 후 재시도(조용히 안 숨김).
        client.connectHeaders = t ? { Authorization: `Bearer ${t.ticket}` } : {};
        if (!t) console.error('[chat] 소켓 티켓 발급 실패 — 재연결 대기');
      },
      onConnect: () => {
        stompFailCount = 0; // 연결 성공 → 실패 카운터 리셋
        // 방 이벤트(7종 union)
        client.subscribe(`/sub/chat-rooms/${chatRoomId}`, (frame: IMessage) => {
          try {
            handleEvent(JSON.parse(frame.body) as ChatSocketEvent);
          } catch {
            console.error('[chat] 이벤트 파싱 실패:', frame.body);
          }
        });
        // 발행(전송) 실패는 per-user 큐로 온다(JSON {errorCode,message}). Spring user-destination 규칙.
        client.subscribe('/user/queue/errors', (frame: IMessage) => {
          try {
            const err = JSON.parse(frame.body) as { message?: string };
            toast.error(err.message || '메시지 전송에 실패했어요.');
          } catch {
            /* 파싱 실패는 무시 */
          }
        });
      },
      // 연결/구독 실패(티켓 만료·미인증·참여자 아님 등)는 raw STOMP ERROR 프레임으로 온다(헤더 message).
      onStompError: (frame: IFrame) => {
        const reason = frame.headers['message'] ?? '';
        console.error('[chat] STOMP 오류:', reason);
        stompFailCount += 1;
        // 참여자 아님/방 없음 = 영구 실패(재시도 무의미). 그 외도 연속 N회 넘으면 포기 →
        // deactivate로 5초 자동 재연결(=매번 1회용 티켓 재발급) 무한 루프 차단(리뷰 confirmed).
        const permanent =
          reason.includes('참여자') || reason.includes('존재하지 않는');
        if (permanent || stompFailCount >= MAX_STOMP_RETRIES) {
          void client.deactivate();
          if (!stompErrorToasted) {
            stompErrorToasted = true; // 토스트 1회만
            toast.error(
              permanent
                ? '이 채팅방에 접근할 수 없어요.'
                : '실시간 연결에 실패했어요. 새로고침 해주세요.',
            );
          }
        }
      },
      onWebSocketError: (evt) => {
        console.error('[chat] WebSocket 오류:', evt);
      },
    });

    clientRef.current = client;
    client.activate();

    return () => {
      clientRef.current = null;
      void client.deactivate(); // 구독 해제 + 소켓 종료
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
        // mock: 낙관적 로컬 반영. live는 발행 → /sub echo로 돌아온 걸 그린다(낙관 X).
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
      // live: 발행. 본인 메시지도 BE echo(/sub, AFTER_COMMIT)로 돌아와 렌더되므로 낙관 반영 안 함.
      const client = clientRef.current;
      if (!client || !client.connected) {
        toast.error('연결이 끊겨 메시지를 보내지 못했어요.');
        return;
      }
      client.publish({
        destination: `/pub/chat-rooms/${chatRoomId}`,
        body: JSON.stringify({ content: trimmed }),
      });
    },
    [chatRoomId, myMemberId, myName, onMessage],
  );

  const sendTyping = useCallback(() => {
    if (isMock('chat')) return; // mock: 발행 대상 없음
    const client = clientRef.current;
    if (!client || !client.connected) return;
    // BE 핸들러는 @Payload 없음 → 빈 프레임. 입력중 주체는 BE가 Principal에서 확정.
    client.publish({
      destination: `/pub/chat-rooms/${chatRoomId}/typing`,
      body: '',
    });
  }, [chatRoomId]);

  return { sendMessage, sendTyping };
}
