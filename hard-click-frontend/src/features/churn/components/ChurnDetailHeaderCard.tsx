import type { ChurnRiskLevel, ChurnStudentDetail } from '../types';

const RISK_LABEL: Record<ChurnRiskLevel, string> = {
  HIGH: '고위험',
  MID: '중위험',
};

const RISK_STYLE: Record<ChurnRiskLevel, string> = {
  HIGH: 'bg-[#FEE2E2] text-[#DC2626]',
  MID: 'bg-[#FEF3C7] text-[#D97706]',
};

// 점수 구간별 색: 35 미만 검정 / 35~70 노랑 / 70 이상 빨강
function scoreColor(score: number): string {
  if (score >= 70) return 'text-[#DC2626]';
  if (score >= 35) return 'text-[#D97706]';
  return 'text-[#1E293B]';
}

/** 학생 위험 상세 — 헤더 카드 (Server Component). */
export default function ChurnDetailHeaderCard({
  student,
}: {
  student: ChurnStudentDetail;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-lg font-bold text-[#2F5DAA]">
          {student.name.slice(0, 2)}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[#1E293B]">
              {student.name}
            </span>
            <span
              className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                RISK_STYLE[student.riskLevel]
              }`}
            >
              {RISK_LABEL[student.riskLevel]}
            </span>
          </div>
          <p className="mt-1 text-sm text-[#64748B]">
            {student.courseName} · 수강 {student.courseWeek}주차
          </p>
        </div>
      </div>

      <div className="text-right">
        <p className="text-sm text-[#64748B]">위험 점수</p>
        <p className="mt-0.5">
          <span className={`text-4xl font-bold ${scoreColor(student.riskScore)}`}>
            {student.riskScore}
          </span>
          <span className="text-base font-semibold text-[#94A3B8]">/100</span>
        </p>
      </div>
    </div>
  );
}
