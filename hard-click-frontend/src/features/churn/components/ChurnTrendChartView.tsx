'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ChurnTrendPoint } from '../types';

/** 이탈 위험 학생 추이 — Recharts AreaChart(SVG). dynamic import로만 로드됨. */
export default function ChurnTrendChartView({
  data,
}: {
  data: ChurnTrendPoint[];
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart
        data={data}
        margin={{ top: 8, right: 12, left: 4, bottom: 0 }}
        accessibilityLayer={false}
      >
        <defs>
          <linearGradient id="churnTrendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EF4444" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="1 3" stroke="#E2E8F0" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#94A3B8', fontSize: 12 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#94A3B8', fontSize: 12 }}
          allowDecimals={false}
          width={32}
        />
        <Tooltip
          formatter={(value) => [`${value}명`, '위험 학생']}
          contentStyle={{
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            fontSize: 12,
          }}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#EF4444"
          strokeWidth={2}
          fill="url(#churnTrendFill)"
          dot={{ r: 3, fill: '#EF4444' }}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
