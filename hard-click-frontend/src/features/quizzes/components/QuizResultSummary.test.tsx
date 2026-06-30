/**
 * QuizResultSummary 테스트 — §0.1② 회귀.
 * BE가 직전 주차 점수를 안 줘 비교불가(improvement=null)일 때 "+0점↑"으로 위조하지 않고
 * "—"로 표시하는지, 그리고 실제 값(0/양수)은 그대로 표시하는지 검증.
 */
import { render, screen } from '@testing-library/react';
import QuizResultSummary from './QuizResultSummary';

describe('QuizResultSummary — 향상도 위조 차단(§0.1②)', () => {
  it('비교불가(improvement=null)면 "+0점"이 아니라 "—"를 표시한다', () => {
    render(
      <QuizResultSummary
        score={80}
        correctCount={4}
        totalCount={5}
        previousScore={null}
        improvement={null}
      />,
    );

    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.queryByText('+0점')).not.toBeInTheDocument();
    expect(screen.getByText('비교할 이전 데이터가 없습니다')).toBeInTheDocument();
  });

  it('실제 향상(improvement>0)이면 "+N점"을 표시한다', () => {
    render(
      <QuizResultSummary
        score={90}
        correctCount={5}
        totalCount={5}
        previousScore={80}
        improvement={10}
      />,
    );

    expect(screen.getByText('+10점')).toBeInTheDocument();
    expect(screen.queryByText('—')).not.toBeInTheDocument();
  });

  it('실제 동일(improvement=0, 직전 점수 있음)이면 "+0점"을 표시한다(null과 구분)', () => {
    render(
      <QuizResultSummary
        score={80}
        correctCount={4}
        totalCount={5}
        previousScore={80}
        improvement={0}
      />,
    );

    expect(screen.getByText('+0점')).toBeInTheDocument();
    expect(screen.queryByText('—')).not.toBeInTheDocument();
  });
});
