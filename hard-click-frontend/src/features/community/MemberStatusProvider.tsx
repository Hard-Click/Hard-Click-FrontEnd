'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useAuth } from '@/features/auth/AuthProvider';

const MAX_RECONNECTS = 5;

interface MemberStatusEvent {
  memberId: number;
  status: 'ACTIVE' | 'SUSPENDED' | 'WITHDRAWN';
  message?: string;
}

interface MemberStatusValue {
  isSuspended: boolean;
  suspendedMessage: string | null;
}

const MemberStatusContext = createContext<MemberStatusValue>({
  isSuspended: false,
  suspendedMessage: null,
});

/**
 * 회원 커뮤니티 정지 상태를 SSE로 실시간 추적한다.
 *
 * - 연결 직후 MEMBER_STATUS_SYNC → 현재 정지 여부 초기화
 * - MEMBER_STATUS_CHANGED → SUSPENDED/ACTIVE 실시간 반영
 * - heartbeat(data:ping) → 무시
 */
export function MemberStatusProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoggedIn } = useAuth();
  const [isSuspended, setIsSuspended] = useState(false);
  const [suspendedMessage, setSuspendedMessage] = useState<string | null>(null);

  // 로그아웃 시 상태 초기화
  const [prevLoggedIn, setPrevLoggedIn] = useState(isLoggedIn);
  if (prevLoggedIn !== isLoggedIn) {
    setPrevLoggedIn(isLoggedIn);
    if (!isLoggedIn) {
      setIsSuspended(false);
      setSuspendedMessage(null);
    }
  }

  const applyStatus = useCallback((data: MemberStatusEvent) => {
    const suspended = data.status === 'SUSPENDED';
    setIsSuspended(suspended);
    setSuspendedMessage(suspended ? (data.message ?? '커뮤니티 작성이 제한된 상태입니다.') : null);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    let es: EventSource | null = null;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    let stopped = false;

    const connect = () => {
      if (stopped) return;
      es = new EventSource('/api/members/me/status-stream');

      es.onopen = () => {
        attempts = 0;
      };

      // 연결 직후 현재 상태
      es.addEventListener('MEMBER_STATUS_SYNC', (e: MessageEvent) => {
        try {
          applyStatus(JSON.parse(e.data) as MemberStatusEvent);
        } catch { /* ignore malformed */ }
      });

      // 실시간 상태 변경
      es.addEventListener('MEMBER_STATUS_CHANGED', (e: MessageEvent) => {
        try {
          applyStatus(JSON.parse(e.data) as MemberStatusEvent);
        } catch { /* ignore malformed */ }
      });

      // heartbeat 무시 (data:ping)
      es.onmessage = () => {};

      es.onerror = () => {
        if (!es || es.readyState !== EventSource.CLOSED) return;
        es.close();
        if (stopped || attempts >= MAX_RECONNECTS) return;
        const delay = Math.min(30_000, 1_000 * 2 ** attempts++);
        retry = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      stopped = true;
      if (retry) clearTimeout(retry);
      es?.close();
    };
  }, [isLoggedIn, applyStatus]);

  return (
    <MemberStatusContext.Provider value={{ isSuspended, suspendedMessage }}>
      {children}
    </MemberStatusContext.Provider>
  );
}

export function useMemberStatus(): MemberStatusValue {
  return useContext(MemberStatusContext);
}
