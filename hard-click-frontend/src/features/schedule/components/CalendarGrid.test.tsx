/**
 * CalendarGrid — 날짜 칸(day cell) 단위로 학습 막대를 그리고, 넘치는 날만 그 칸이 내부 스크롤된다.
 * (주 단위 span 레이아웃에서 전환 #1055 — 일정이 많은 날만 스크롤, 달력 격자 높이는 유지)
 */
import { render, screen } from '@testing-library/react';
import { CalendarGrid } from './CalendarGrid';
import type { ScheduleBlock } from '../types';

function block(id: string, startDate: string, endDate = startDate): ScheduleBlock {
  return { id, category: 'MATH', startDate, endDate };
}

/** 특정 날짜 칸(버튼 기준)의 막대 스크롤 컨테이너를 찾는다. */
function barContainerFor(date: string): HTMLElement {
  const cell = screen.getByLabelText(`${date} 선택`).closest('.flex-none')?.parentElement;
  const container = cell?.querySelector('.scroll-hidden');
  if (!(container instanceof HTMLElement)) throw new Error(`bar container not found for ${date}`);
  return container;
}

describe('CalendarGrid — 날짜 칸별 막대/스크롤', () => {
  it('하루에 걸친 블록들은 해당 날짜 칸에만, 개수만큼 막대로 렌더된다', () => {
    render(
      <CalendarGrid
        year={2026}
        month={6} // 2026-07
        onSelectDate={() => {}}
        blocks={[
          block('a', '2026-07-15'),
          block('b', '2026-07-15'),
          block('c', '2026-07-15'),
        ]}
      />,
    );

    expect(barContainerFor('2026-07-15').children).toHaveLength(3);
    // 인접한 다른 날엔 막대가 없다(날짜 칸 단위로 정확히 배치)
    expect(barContainerFor('2026-07-16').children).toHaveLength(0);
  });

  it('막대 컨테이너는 칸마다 독립이며 넘칠 때만 스크롤되는 구조다(scroll-hidden + overflow-y-auto)', () => {
    const { container } = render(
      <CalendarGrid year={2026} month={6} onSelectDate={() => {}} blocks={[block('a', '2026-07-15')]} />,
    );

    // 각 날짜 칸이 자기만의 스크롤 컨테이너를 가진다 → 넘치는 날만 그 칸이 스크롤됨(주 단위 X)
    const containers = container.querySelectorAll('.scroll-hidden');
    expect(containers.length).toBeGreaterThanOrEqual(7); // 최소 한 주(7칸)

    const bar = barContainerFor('2026-07-15');
    expect(bar.className).toContain('overflow-y-auto');
    expect(bar.className).toContain('scroll-hidden');
  });

  it('여러 날에 걸친 블록은 걸친 날짜 칸마다 각각 막대로 나타난다', () => {
    render(
      <CalendarGrid
        year={2026}
        month={6}
        onSelectDate={() => {}}
        blocks={[block('span', '2026-07-06', '2026-07-08')]}
      />,
    );

    expect(barContainerFor('2026-07-06').children).toHaveLength(1);
    expect(barContainerFor('2026-07-07').children).toHaveLength(1);
    expect(barContainerFor('2026-07-08').children).toHaveLength(1);
    expect(barContainerFor('2026-07-09').children).toHaveLength(0);
  });
});
