'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { markNotificationReadAction } from './actions';
import type { NotificationItem } from './types';
import type { NotificationsData } from './server';

interface NotificationValue {
  notifications: NotificationItem[];
  unreadCount: number;
  /** 알림 읽음 처리 — 낙관적 갱신(즉시 배지/목록 반영) 후 서버 PATCH. */
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
 * 읽음 처리는 낙관적으로 로컬 상태를 갱신(배지 즉시 감소)하고 Server Action으로 영속화한다.
 */
export function NotificationProvider({
  value,
  children,
}: {
  value: NotificationsData;
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState(value.notifications);
  const [unreadCount, setUnreadCount] = useState(value.unreadCount);

  const markRead = useCallback((notiId: number) => {
    let changed = false;
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.notiId === notiId && !n.isRead) {
          changed = true;
          return { ...n, isRead: true };
        }
        return n;
      }),
    );
    // 이미 읽은 알림이면 배지/요청 생략 (중복 클릭 방어)
    if (!changed) return;
    setUnreadCount((c) => Math.max(0, c - 1));
    void markNotificationReadAction(notiId);
  }, []);

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
