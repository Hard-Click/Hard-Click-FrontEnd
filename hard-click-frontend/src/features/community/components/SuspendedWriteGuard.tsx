'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/toast';
import { useMemberStatus } from '@/features/community/MemberStatusProvider';

/**
 * 정지 계정의 글쓰기/수정 페이지 직접 접근을 차단한다.
 * SSE 상태가 SUSPENDED면 커뮤니티 목록으로 리다이렉트하고 토스트로 안내한다.
 */
export default function SuspendedWriteGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSuspended, suspendedMessage } = useMemberStatus();
  const router = useRouter();

  useEffect(() => {
    if (isSuspended) {
      toast.error(suspendedMessage ?? '커뮤니티 작성이 제한된 계정입니다.');
      router.replace('/community');
    }
  }, [isSuspended, suspendedMessage, router]);

  if (isSuspended) return null;

  return <>{children}</>;
}
