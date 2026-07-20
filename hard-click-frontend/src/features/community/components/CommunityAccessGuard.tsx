'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/toast';
import { useMemberStatus } from '@/features/community/MemberStatusProvider';

/**
 * 이용제한(SUSPENDED) 계정의 커뮤니티 전체(목록/상세/작성/수정) 접근을 차단한다.
 * SSE 상태가 SUSPENDED면 커뮤니티 밖으로 리다이렉트하고 토스트로 안내한다.
 * (연결 직후 상태 동기화 전 짧은 프레임은 렌더될 수 있음 — BE에 동기 상태 소스가 없어 SSE 동기화에 의존)
 */
export default function CommunityAccessGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSuspended, suspendedMessage } = useMemberStatus();
  const router = useRouter();

  useEffect(() => {
    if (isSuspended) {
      toast.error(suspendedMessage ?? '커뮤니티 이용이 제한된 계정입니다.');
      router.replace('/courses');
    }
  }, [isSuspended, suspendedMessage, router]);

  if (isSuspended) return null;

  return <>{children}</>;
}
