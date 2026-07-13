import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getChurnStudentDetailServer } from '@/features/churn/server';
import ChurnDetailHeaderCard from '@/features/churn/components/ChurnDetailHeaderCard';
import ChurnRiskFactors from '@/features/churn/components/ChurnRiskFactors';
import ChurnLearningStatus from '@/features/churn/components/ChurnLearningStatus';
import ChurnDetailActions from '@/features/churn/components/ChurnDetailActions';
import { ScrollToTop } from '@/features/churn/components/ScrollToTop';

interface Props {
  params: Promise<{ studentId: string }>;
}

export default async function AdminChurnStudentDetailPage({ params }: Props) {
  const { studentId } = await params;
  const id = Number(studentId);
  if (Number.isNaN(id)) notFound();

  const student = await getChurnStudentDetailServer(id);
  if (!student) notFound();

  return (
    <div className="min-h-screen bg-[#F5F7FB] px-8 py-10">
      <div className="mx-auto w-full max-w-[880px]">
        <ScrollToTop />
        {/* 브레드크럼 */}
        <Link
          href="/admin/churn"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[#2F5DAA] hover:text-[#1D4ED8]"
        >
          <Image src="/icons/back.svg" alt="" width={16} height={16} />
          이탈관리 <span className="text-[#94A3B8]">/ 학생 위험 상세</span>
        </Link>

        {/* 헤더 카드 */}
        <ChurnDetailHeaderCard student={student} />

        {/* 기여 요인 · 학습 현황 */}
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <ChurnRiskFactors factors={student.factors} />
          <ChurnLearningStatus status={student.learning} />
        </div>

        {/* 액션 */}
        <ChurnDetailActions studentName={student.name} />
      </div>
    </div>
  );
}
