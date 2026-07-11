'use client';

/**
 * 채팅 실시간 소켓 훅 — STOMP 연결 (근거: docs §7 명세 + 라이브 검증. BE 소스 직접대조는 불가 —
 * 로컬 BE 클론이 chat 머지 전 스냅샷이라 chat 도메인 코드가 없음. 계약은 배포서버 라이브 호출로 확인).
 *
 * ⚠️ isMock('chat')=false(MOCK_OVERRIDE.chat) → **live 분기가 실행된다.**
 *   - live: 아래 STOMP 실배선. 라이브 검증됨(2026-07-10 세션): REST 방정보/히스토리/목록 200,
 *     socket-ticket 201, CONNECT 성공, 메시지 송수신 라운드트립 — **단 로컬(http) 프리뷰 기준.**
 *   - mock 모드(isMock true일 때만): 디자인 확인용 choreography(입력중→수신)만 재생. 명시적 mock(§0.1).
 *
 * ⚠️ prod 배포 한계: WS_URL이 ws://(평문)인데 페이지가 https면 브라우저가 혼합콘텐츠로 차단한다.
 *   NEXT_PUBLIC_API_BASE_URL이 prod에서 http(예: 13.125.94.217)면 실시간은 prod에서 안 된다(REST는 BFF라 정상).
 *   → 아래 진입 가드가 그 조합을 감지해 STOMP를 아예 시도하지 않고 실시간만 비활성한다(무한재연결·조용한 실패 방지).
 *   prod가 BE를 wss로 노출하면 가드는 발동 안 하고 실시간 정상. (prod env 실제 값은 확인 필요.)
 *
 * live 인증 흐름(2-step, httpOnly 쿠키를 WS에 못 실어서 티켓 우회):
 *   1) issueSocketTicketAction()  → BFF가 쿠키로 인증 · 30초 1회용 티켓(매 재연결마다 재발급)
 *   2) CONNECT `Authorization: Bearer <ticket>` → BE가 consume·memberId 확정(ChatPrincipal)
 *   3) subscribe `/sub/chat-rooms/{id}` → 이벤트 type 분기(handleEvent) + `/user/queue/errors`(발행 실패)
 *   발행: `/pub/chat-rooms/{id}` {content} · `/pub/chat-rooms/{id}/typing` 빈 프레임.
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

/** WS 핸드셰이크 URL — http→ws / https→wss (docs §7: raw WebSocket, SockJS 아님). */
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

    // ── live 진입 가드: https 페이지 + 평문 ws:// = 혼합콘텐츠 차단 → 시도 자체를 막는다 ──
    // (막지 않으면 핸드셰이크가 매번 실패하고 5초마다 재연결하며 1회용 티켓만 무한 소모한다.)
    // WS_URL 미구성(env 누락)도 동일 처리. prod가 wss면 이 가드는 통과. §0.1 #4(안 되는데 되는 척 금지).
    const wsUnusable =
      !/^wss?:\/\//.test(WS_URL) ||
      (typeof window !== 'undefined' &&
        window.location.protocol === 'https:' &&
        WS_URL.startsWith('ws://'));
    if (wsUnusable) {
      console.warn(
        '[chat] 실시간 채팅 비활성 — WS 미구성 또는 https 페이지의 ws:// 혼합콘텐츠 차단(BE wss 필요). REST 조회는 정상.',
      );
      toast('실시간 채팅은 현재 배포 환경에서 미지원이에요. (메시지 조회는 정상)');
      return; // STOMP 미시도 → 티켓 낭비·무한재연결 없음
    }

    // ── live: STOMP 실연결 (docs §7 계약 + 라이브 검증[로컬 http]) ──
    let stompFailCount = 0; // 연속 실패 카운터(onConnect 성공 시 0으로 리셋)
    let stompErrorToasted = false;
    let bailed = false; // 재연결 영구 포기 후 중복 bail 방지
    let tornDown = false; // effect cleanup(언마운트)로 우리가 끊은 정상 종료 표시

    // 재시도 소진/영구실패 → 재연결(=매 티켓 재발급) 중단 + 1회 안내. onStompError·onWebSocketClose 공용.
    const bail = (permanent: boolean) => {
      if (bailed) return;
      bailed = true;
      void client.deactivate();
      if (!stompErrorToasted) {
        stompErrorToasted = true;
        toast.error(
          permanent
            ? '이 채팅방에 접근할 수 없어요.'
            : '실시간 연결에 실패했어요. 새로고침 해주세요.',
        );
      }
    };

    const handleEvent = (e: ChatSocketEvent) => {
      switch (e.type) {
        case 'CHAT':
          // 본인 것도 echo(senderId===myMemberId → ChatRoomClient가 우측 렌더).
          // ⚠️ senderName·content는 BE가 마스킹한다고 가정(on-wire 미검증, §0.1). REST와 달리 BFF 매퍼를
          //    안 거치므로 마스킹은 전적으로 BE 책임 — 라이브 on-wire 확인 시 이 가정 검증 필요.
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
            content: e.message, // ⚠️ BE가 마스킹했다고 가정한 문장(예: "홍*동님이 입장했습니다") — on-wire 미검증
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
        default: {
          // 미지의 type(신 버전 BE 등)은 조용히 무시. never 할당으로 union 누락도 컴파일에서 잡는다.
          const _exhaustive: never = e;
          console.warn('[chat] 미지 이벤트 무시:', _exhaustive);
        }
      }
    };

    // 소켓 페이로드는 신뢰 불가(BE·네트워크). 최소 shape 검증(§0.1 추측 방지) — 실패면 무시.
    const parseEvent = (body: string): ChatSocketEvent | null => {
      let raw: unknown;
      try {
        raw = JSON.parse(body);
      } catch {
        return null;
      }
      if (
        typeof raw !== 'object' ||
        raw === null ||
        typeof (raw as { type?: unknown }).type !== 'string'
      ) {
        return null;
      }
      return raw as ChatSocketEvent;
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
          const event = parseEvent(frame.body);
          if (!event) {
            console.error('[chat] 이벤트 파싱/shape 실패, 무시:', frame.body);
            return;
          }
          handleEvent(event);
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
        // 참여자 아님/방 없음 = 영구 실패(재시도 무의미). ⚠️ 한글 부분문자열 매칭은 BE on-wire 메시지 가정(미검증) —
        // 어긋나도 아래 카운트 상한(MAX_STOMP_RETRIES)으로 폴백해 무한재연결은 막힌다.
        const permanent =
          reason.includes('참여자') || reason.includes('존재하지 않는');
        if (permanent || stompFailCount >= MAX_STOMP_RETRIES) bail(permanent);
      },
      // 전송계층 실패(서버 다운·핸드셰이크 거부·혼합콘텐츠·소켓 조기 종료)는 STOMP ERROR 프레임이 아니라
      // close/error로 온다. onStompError만 카운트하면 이 경로에선 stompFailCount가 안 올라 5초마다 무한 재연결
      // (=매 티켓 재발급)한다(리뷰 confirmed #1). → 미연결 close도 실패로 세어 상한에서 재연결을 끊는다.
      // (연결 성공 시 onConnect가 카운터를 리셋 → 정상 세션의 일시 끊김은 재연결 허용.)
      onWebSocketClose: (evt: CloseEvent) => {
        if (bailed || tornDown) return; // 우리가 deactivate한 정상 종료(포기·언마운트)는 제외
        stompFailCount += 1;
        console.error('[chat] WebSocket 종료(미연결):', evt?.code);
        if (stompFailCount >= MAX_STOMP_RETRIES) bail(false);
      },
      onWebSocketError: (evt) => {
        // 실제 재시도 중단은 onWebSocketClose가 담당(error 뒤 close가 항상 뒤따름).
        console.error('[chat] WebSocket 오류:', evt);
      },
    });

    clientRef.current = client;
    client.activate();

    return () => {
      tornDown = true; // onWebSocketClose가 이 정상 종료를 실패로 세지 않게
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
