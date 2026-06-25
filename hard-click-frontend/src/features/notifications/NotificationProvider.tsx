'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  markNotificationReadAction,
  refreshNotificationsAction,
} from './actions';
import type { NotificationItem } from './types';
import type { NotificationsData } from './server';

/**
 * SSE 실시간 킬스위치. BE SSE 엔드포인트(`/api/notifications/subscribe`)는 이미 라이브라
 * `true`면 **BE가 알림 push를 시작하는 순간 자동으로** 종이 갱신된다(별도 조치 불필요).
 * 실시간이 노이즈를 내면 `false`로 끄면 조회+읽음(서버 fetch)만 남는다.
 */
const SSE_ENABLED = true;
const MAX_RECONNECTS = 5;

/** SSE keepalive로 흔한 페이로드 — 재조회 트리거에서 제외(불필요한 부하 방지). */
const KEEPALIVE = new Set(['', 'ping', 'keepalive', 'heartbeat']);

interface NotificationValue {
  notifications: NotificationItem[];
  unreadCount: number;
  /** 알림 읽음 처리 — 낙관적 갱신(즉시 배지/목록 반영) 후 서버 PATCH(실패 시 롤백). */
  markRead: (notiId: number) => void;
}

const NotificationContext = createContext<NotificationValue>({
  notifications: [],
  unreadCount: 0,
  markRead: () => {},
});

/**
 * 서버(루트 layout)가 조회한 알림을 클라이언트 트리에 내려준다 — AuthProvider와 동일 패턴.
 * §12 "useEffect 데이터 페칭 금지"를 지키며 헤더(종)가 client여도 서버 데이터를 쓰게 한다.
 * 읽음 처리는 낙관적으로 갱신(배지 즉시 감소)하고 Server Action으로 영속화(실패 시 롤백)한다.
 * 실시간(SSE)은 로그인 사용자에 한해 구독하고, 이벤트가 오면 검증된 GET으로 재조회한다.
 */
export function NotificationProvider({
  value,
  children,
}: {
  value: NotificationsData;
  children: React.ReactNode;
}) {
  const { isLoggedIn } = useAuth();
  const [notifications, setNotifications] = useState(value.notifications);
  const [unreadCount, setUnreadCount] = useState(value.unreadCount);

  // 서버가 새 값을 내려주면(로그인/계정전환/router.refresh) 동기화 — 이전 사용자 알림 잔존 방지.
  // (props로 파생된 state를 prop 변경 시 갱신하는 React 권장 패턴 — effect 아님)
  const [seed, setSeed] = useState(value);
  if (seed !== value) {
    setSeed(value);
    setNotifications(value.notifications);
    setUnreadCount(value.unreadCount);
  }

  /** 서버에서 목록·미읽음수를 다시 끌어와 동기화 (SSE 이벤트 트리거 + 토큰 회전 겸용). */
  const refresh = useCallback(async () => {
    try {
      const data = await refreshNotificationsAction();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      // 무시 — 다음 이벤트/페이지 로드 때 다시 동기화
    }
  }, []);

  const markRead = useCallback(
    (notiId: number) => {
      // 읽음 여부를 현재 상태에서 먼저 판단 — setState updater 내부 부수효과 제거(동시성 렌더 안전).
      const target = notifications.find((n) => n.notiId === notiId);
      if (!target || target.isRead) return; // 없거나 이미 읽음 → 배지/요청 생략
      setNotifications((prev) =>
        prev.map((n) => (n.notiId === notiId ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      // 실패 시 낙관적 갱신 롤백 (§0.1 — 가짜 성공으로 숨기지 않음)
      void markNotificationReadAction(notiId).then((res) => {
        if (!res.success) {
          setNotifications((prev) =>
            prev.map((n) => (n.notiId === notiId ? { ...n, isRead: false } : n)),
          );
          setUnreadCount((c) => c + 1);
        }
      });
    },
    [notifications],
  );

  // 실시간 푸시 (SSE). EventSource는 브라우저 전용 스트림 구독이고 '초기 데이터 페칭'이 아니라
  // '실시간 구독'이라 §12(useEffect 데이터 페칭 금지) 대상이 아니다 — 초기 데이터는 서버 props에서 옴.
  // 이벤트 payload를 파싱하지 않고 "이벤트 수신 = 재조회"로 처리해 BE push shape에 의존하지 않는다.
  useEffect(() => {
    if (!SSE_ENABLED || !isLoggedIn) return;

    let es: EventSource | null = null;
    let debounce: ReturnType<typeof setTimeout> | undefined;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    let stopped = false;

    const scheduleRefresh = () => {
      if (debounce) clearTimeout(debounce);
      debounce = setTimeout(() => void refresh(), 400); // 버스트 디바운스
    };

    // 무명 data 이벤트 — keepalive류는 무시, 그 외만 재조회. ('connect'는 named라 여기 안 옴)
    const onMessage = (e: MessageEvent) => {
      if (KEEPALIVE.has(String(e.data ?? '').trim().toLowerCase())) return;
      scheduleRefresh();
    };

    const connect = () => {
      if (stopped) return;
      es = new EventSource('/api/notifications/stream');
      es.onopen = () => {
        attempts = 0; // 연결 성공 → 백오프 리셋
      };
      es.onmessage = onMessage;
      // ⚠️ named 이벤트명은 BE M3(6/26) 전이라 미검증(가정) — 확정되면 이 줄만 조정.
      es.addEventListener('notification', scheduleRefresh);
      es.addEventListener('noti', scheduleRefresh);
      es.onerror = () => {
        // CLOSED = 영구종료(401/502 — EventSource는 재연결 안 함) → 직접 백오프 재연결.
        // CONNECTING = EventSource 자체 재연결 중 → 건드리지 않는다.
        if (!es || es.readyState !== EventSource.CLOSED) return;
        es.close();
        if (stopped || attempts >= MAX_RECONNECTS) return; // 폭주 방지(이후엔 네비/리로드로 복구)
        void refresh(); // serverApi 경유 → 만료 accessToken 회전 + 데이터 동기화
        const delay = Math.min(30_000, 1_000 * 2 ** attempts++); // 1s,2s,4s… 최대 30s
        retry = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      stopped = true;
      if (debounce) clearTimeout(debounce);
      if (retry) clearTimeout(retry);
      es?.close(); // 언마운트/로그아웃 시 연결 정리
    };
  }, [isLoggedIn, refresh]);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

/** 클라이언트 컴포넌트(헤더 종 등)에서 알림 상태 사용. */
export function useNotifications(): NotificationValue {
  return useContext(NotificationContext);
}
