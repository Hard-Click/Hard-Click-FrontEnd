import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import ReportModal from './ReportModal';
import { submitReportAction } from '@/features/reports/actions';
import type { ReportActionResult, SubmitReportInput } from '@/features/reports/types';

// sonner toast mock
jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

// server action mock — 원하는 결과를 반환하도록 stub
jest.mock('@/features/reports/actions', () => ({
  submitReportAction: jest.fn(),
}));

const mockSubmit = submitReportAction as jest.MockedFunction<
  typeof submitReportAction
>;
const mockToastSuccess = toast.success as jest.Mock;
const mockToastError = toast.error as jest.Mock;

const SUCCESS: ReportActionResult = {
  success: true,
  message: '신고가 접수되었습니다.',
};
const FAILURE: ReportActionResult = {
  success: false,
  message: '신고에 실패했어요. 잠시 후 다시 시도해주세요.',
};

const target = { targetType: 'POST' as const, targetId: 889 };

beforeEach(() => {
  jest.clearAllMocks();
  mockSubmit.mockResolvedValue(SUCCESS);
});

describe('ReportModal — 신고 모달 통합', () => {
  describe('초기 렌더', () => {
    it('대상 라벨(게시글)을 제목·안내에 반영한다', () => {
      render(<ReportModal target={target} onClose={jest.fn()} />);
      expect(
        screen.getByRole('heading', { name: '게시글 신고' }),
      ).toBeInTheDocument();
      expect(
        screen.getByText('신고 사유를 선택해주세요.', { exact: false }),
      ).toBeInTheDocument();
    });

    it('댓글 대상이면 라벨이 댓글로 바뀐다', () => {
      render(
        <ReportModal
          target={{ targetType: 'COMMENT', targetId: 1 }}
          onClose={jest.fn()}
        />,
      );
      expect(
        screen.getByRole('heading', { name: '댓글 신고' }),
      ).toBeInTheDocument();
    });

    it('7개 신고 사유 체크박스를 모두 노출한다', () => {
      render(<ReportModal target={target} onClose={jest.fn()} />);
      expect(screen.getAllByRole('checkbox')).toHaveLength(7);
      expect(screen.getByText('욕설/비속어')).toBeInTheDocument();
      expect(screen.getByText('기타')).toBeInTheDocument();
    });
  });

  describe('사유 미선택 검증', () => {
    it('사유 없이 신고하기를 누르면 에러 문구가 뜨고 확인 모달로 넘어가지 않는다', async () => {
      const user = userEvent.setup();
      render(<ReportModal target={target} onClose={jest.fn()} />);

      await user.click(screen.getByRole('button', { name: '신고하기' }));

      expect(
        screen.getByText('신고 사유를 하나 이상 선택해주세요.'),
      ).toBeInTheDocument();
      // 확인 모달(확인 버튼)로 진입하지 않음
      expect(
        screen.queryByRole('button', { name: '확인' }),
      ).not.toBeInTheDocument();
      expect(mockSubmit).not.toHaveBeenCalled();
    });

    it('사유를 선택하면 이전 에러 문구가 사라진다', async () => {
      const user = userEvent.setup();
      render(<ReportModal target={target} onClose={jest.fn()} />);

      await user.click(screen.getByRole('button', { name: '신고하기' }));
      expect(
        screen.getByText('신고 사유를 하나 이상 선택해주세요.'),
      ).toBeInTheDocument();

      await user.click(screen.getByRole('checkbox', { name: /음란물/ }));
      expect(
        screen.queryByText('신고 사유를 하나 이상 선택해주세요.'),
      ).not.toBeInTheDocument();
    });
  });

  describe('사유 선택 → 신고하기 → 확인 모달', () => {
    it('사유 선택 후 신고하기를 누르면 확인 모달이 노출된다', async () => {
      const user = userEvent.setup();
      render(<ReportModal target={target} onClose={jest.fn()} />);

      await user.click(screen.getByRole('checkbox', { name: /스팸\/도배/ }));
      await user.click(screen.getByRole('button', { name: '신고하기' }));

      expect(
        screen.getByText('해당 게시글을 신고 하시겠습니까?'),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '확인' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
      // 아직 제출 전
      expect(mockSubmit).not.toHaveBeenCalled();
    });
  });

  describe('확인 모달에서 확인 → 제출', () => {
    it('확인을 누르면 submit action을 선택 사유·대상으로 호출한다', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      render(<ReportModal target={target} onClose={onClose} />);

      await user.click(screen.getByRole('checkbox', { name: /욕설\/비속어/ }));
      await user.click(screen.getByRole('checkbox', { name: /스팸\/도배/ }));
      await user.click(screen.getByRole('button', { name: '신고하기' }));
      await user.click(screen.getByRole('button', { name: '확인' }));

      await waitFor(() => expect(mockSubmit).toHaveBeenCalledTimes(1));
      const arg = mockSubmit.mock.calls[0][0] as SubmitReportInput;
      expect(arg.targetType).toBe('POST');
      expect(arg.targetId).toBe(889);
      expect(arg.reasons).toEqual(['욕설/비속어', '스팸/도배']);
    });

    it('추가 설명을 입력하면 detail로 전달한다(trim 적용)', async () => {
      const user = userEvent.setup();
      render(<ReportModal target={target} onClose={jest.fn()} />);

      await user.click(screen.getByRole('checkbox', { name: /기타/ }));
      await user.type(
        screen.getByPlaceholderText('추가로 전달하실 내용이 있다면 작성해주세요.'),
        '  도배가 심해요  ',
      );
      await user.click(screen.getByRole('button', { name: '신고하기' }));
      await user.click(screen.getByRole('button', { name: '확인' }));

      await waitFor(() => expect(mockSubmit).toHaveBeenCalledTimes(1));
      const arg = mockSubmit.mock.calls[0][0] as SubmitReportInput;
      expect(arg.detail).toBe('도배가 심해요');
    });

    it('추가 설명이 비면 detail은 undefined로 전달한다', async () => {
      const user = userEvent.setup();
      render(<ReportModal target={target} onClose={jest.fn()} />);

      await user.click(screen.getByRole('checkbox', { name: /기타/ }));
      await user.click(screen.getByRole('button', { name: '신고하기' }));
      await user.click(screen.getByRole('button', { name: '확인' }));

      await waitFor(() => expect(mockSubmit).toHaveBeenCalledTimes(1));
      const arg = mockSubmit.mock.calls[0][0] as SubmitReportInput;
      expect(arg.detail).toBeUndefined();
    });

    it('제출 성공 시 성공 토스트 노출 후 onClose를 호출한다', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      render(<ReportModal target={target} onClose={onClose} />);

      await user.click(screen.getByRole('checkbox', { name: /음란물/ }));
      await user.click(screen.getByRole('button', { name: '신고하기' }));
      await user.click(screen.getByRole('button', { name: '확인' }));

      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
      expect(mockToastSuccess).toHaveBeenCalledWith('신고가 접수되었습니다.');
      expect(mockToastError).not.toHaveBeenCalled();
    });

    it('제출 실패 시 에러 토스트 노출하고 사유 폼으로 복귀한다', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      mockSubmit.mockResolvedValue(FAILURE);
      render(<ReportModal target={target} onClose={onClose} />);

      await user.click(screen.getByRole('checkbox', { name: /음란물/ }));
      await user.click(screen.getByRole('button', { name: '신고하기' }));
      await user.click(screen.getByRole('button', { name: '확인' }));

      await waitFor(() => expect(mockToastError).toHaveBeenCalledWith(FAILURE.message));
      expect(onClose).not.toHaveBeenCalled();
      // 확인 모달이 닫히고 사유 폼(신고하기 버튼)으로 복귀
      expect(
        screen.getByRole('button', { name: '신고하기' }),
      ).toBeInTheDocument();
    });
  });

  describe('확인 모달에서 취소 → 사유 유지', () => {
    it('취소를 누르면 제출하지 않고 선택한 사유가 유지된다', async () => {
      const user = userEvent.setup();
      render(<ReportModal target={target} onClose={jest.fn()} />);

      await user.click(screen.getByRole('checkbox', { name: /스팸\/도배/ }));
      await user.click(screen.getByRole('button', { name: '신고하기' }));
      // 확인 모달 진입
      expect(
        screen.getByText('해당 게시글을 신고 하시겠습니까?'),
      ).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: '취소' }));

      // 사유 폼으로 복귀 + 선택 유지 (체크박스 checked)
      const checkbox = screen.getByRole('checkbox', { name: /스팸\/도배/ });
      expect(checkbox).toBeChecked();
      expect(mockSubmit).not.toHaveBeenCalled();

      // 다시 신고하기 → 확인 → 제출 가능 (유지된 사유로)
      await user.click(screen.getByRole('button', { name: '신고하기' }));
      await user.click(screen.getByRole('button', { name: '확인' }));
      await waitFor(() => expect(mockSubmit).toHaveBeenCalledTimes(1));
      const arg = mockSubmit.mock.calls[0][0] as SubmitReportInput;
      expect(arg.reasons).toEqual(['스팸/도배']);
    });
  });

  describe('닫기 버튼', () => {
    it('헤더 닫기(✕)를 누르면 onClose를 호출한다', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      render(<ReportModal target={target} onClose={onClose} />);

      await user.click(screen.getByRole('button', { name: '✕' }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('하단 취소 버튼을 누르면 onClose를 호출한다', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      render(<ReportModal target={target} onClose={onClose} />);

      // 사유 폼 단계의 취소 버튼
      await user.click(screen.getByRole('button', { name: '취소' }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('중복 제출 방지', () => {
    it('느린 제출 중 확인을 여러 번 눌러도 submit은 한 번만 호출된다', async () => {
      const user = userEvent.setup();
      let resolve!: (v: ReportActionResult) => void;
      mockSubmit.mockReturnValue(
        new Promise<ReportActionResult>((r) => {
          resolve = r;
        }),
      );
      render(<ReportModal target={target} onClose={jest.fn()} />);

      await user.click(screen.getByRole('checkbox', { name: /기타/ }));
      await user.click(screen.getByRole('button', { name: '신고하기' }));

      const confirmBtn = screen.getByRole('button', { name: '확인' });
      await user.click(confirmBtn);
      await user.click(confirmBtn);
      await user.click(confirmBtn);

      expect(mockSubmit).toHaveBeenCalledTimes(1);
      resolve(SUCCESS);
      await waitFor(() => expect(mockToastSuccess).toHaveBeenCalled());
    });
  });

  describe('사유 토글', () => {
    it('같은 사유를 두 번 누르면 선택 해제되어 검증에 걸린다', async () => {
      const user = userEvent.setup();
      render(<ReportModal target={target} onClose={jest.fn()} />);

      const checkbox = screen.getByRole('checkbox', { name: /기타/ });
      await user.click(checkbox);
      expect(checkbox).toBeChecked();
      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();

      await user.click(screen.getByRole('button', { name: '신고하기' }));
      expect(
        screen.getByText('신고 사유를 하나 이상 선택해주세요.'),
      ).toBeInTheDocument();
    });
  });
});
