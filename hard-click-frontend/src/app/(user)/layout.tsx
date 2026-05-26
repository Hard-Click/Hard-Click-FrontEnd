import StudyTimerPanel from '@/features/studyTimers/components/StudyTimerPanel';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <StudyTimerPanel />
    </>
  );
}
