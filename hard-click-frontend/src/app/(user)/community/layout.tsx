import CommunityAccessGuard from '@/features/community/components/CommunityAccessGuard';

// Server layout — 실제 접근 차단 로직은 client 섬(CommunityAccessGuard)에 위임, 페이지 트리는 그대로 children으로.
export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CommunityAccessGuard>{children}</CommunityAccessGuard>;
}
