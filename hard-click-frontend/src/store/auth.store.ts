/**
 * 인증 정보(토큰, memberId, role) 저장/조회/삭제 헬퍼
 * 추후 zustand 등으로 마이그레이션 가능
 */

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const MEMBER_ID_KEY = 'memberId';
const ROLE_KEY = 'role';

interface AuthData {
  accessToken: string;
  refreshToken: string;
  memberId: number;
  role: string;
}

export const authStore = {
  setAuth(data: AuthData) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    localStorage.setItem(MEMBER_ID_KEY, String(data.memberId));
    localStorage.setItem(ROLE_KEY, data.role);
  },

  /** @deprecated setAuth() 사용 권장 */
  setTokens(accessToken: string, refreshToken: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  getMemberId(): number | null {
    if (typeof window === 'undefined') return null;
    const id = localStorage.getItem(MEMBER_ID_KEY);
    return id ? Number(id) : null;
  },

  getRole(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ROLE_KEY);
  },

  clear() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(MEMBER_ID_KEY);
    localStorage.removeItem(ROLE_KEY);
  },

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  },
};
