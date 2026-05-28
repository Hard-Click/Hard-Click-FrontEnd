'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import StudyTimerPanel from '@/features/studyTimers/components/StudyTimerPanel';
import UserHeader from '@/components/layout/headers/UserHeader';
import InstructorHeader from '@/components/layout/headers/InstructorHeader';
import { authStore } from '@/store/auth.store';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth') ?? false;
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(authStore.getRole());
  }, []);

  return (
    <>
      {!isAuthPage &&
        (role === 'INSTRUCTOR' ? <InstructorHeader /> : <UserHeader />)}
      {children}
      {!isAuthPage && <StudyTimerPanel />}
    </>
  );
}
