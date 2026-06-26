'use client';

import { createContext, useContext } from 'react';

export interface AuthValue {
  isLoggedIn: boolean;
  role: string | null;
  memberId: number | null;
}

const AuthContext = createContext<AuthValue>({
  isLoggedIn: false,
  role: null,
  memberId: null,
});

/** 서버(루트 layout)가 쿠키로 계산한 인증 정보를 클라이언트 트리에 내려준다. */
export function AuthProvider({
  value,
  children,
}: {
  value: AuthValue;
  children: React.ReactNode;
}) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** 클라이언트 컴포넌트에서 인증 상태 사용 (localStorage 직접 읽기 대체) */
export function useAuth(): AuthValue {
  return useContext(AuthContext);
}
