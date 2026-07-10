import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuizFormModal from './QuizFormModal';
import { getQuizFormMetaAction } from '../actions';
import type { QuizFormPayload } from '../types';

// next/navigation — router stub
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn(), back: jest.fn() }),
  usePathname: () => '/',
}));

// sonner — toast stub
jest.mock('@/lib/toast', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

// next/image — 단순 img 렌더 (테스트에서 alt 노이즈 줄이려 그대로 둠)
jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  default: (props: { src: string; alt: string }) => <img {...props} />,
}));

// server actions 모듈 stub — 컴포넌트 기본 import 경로 차단(실 네트워크 방지).
// 실제 호출 검증은 props(createAction/updateAction)로 주입한 mock으로 한다.
jest.mock('../actions', () => ({
  createQuizAction: jest.fn(async () => ({ success: true })),
  updateQuizAction: jest.fn(async () => ({ success: true })),
  // ② 등록폼이 강의 선택 시 실제 섹션(주차)을 로드 — 기본은 1~12주 전부 비어있음.
  getQuizFormMetaAction: jest.fn(async () => ({
    weeks: Array.from({ length: 12 }, (_, i) => i + 1),
    takenWeeks: [] as number[],
  })),
}));

// SelectDropdown → 네이티브 <select>로 치환(상호작용 단순화).
jest.mock('@/components/ui/SelectDropdown', () => ({
  __esModule: true,
  default: ({
    placeholder,
    value,
    options,
    onChange,
    disabled,
  }: {
    placeholder: string;
    value: string;
    options: { label: string; value: string }[];
    onChange: (v: string) => void;
    disabled?: boolean;
  }) => (
    <select
      aria-label={placeholder}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  ),
}));

// ConfirmModal → title/desc + 취소·확인 버튼만 (콜백 그대로).
jest.mock('@/components/ui/confirmModal', () => ({
  __esModule: true,
  default: ({
    title,
    description,
    cancelText,
    confirmText,
    onCancel,
    onConfirm,
  }: {
    title: string;
    description: string;
    cancelText: string;
    confirmText: string;
    onCancel: () => void;
    onConfirm: () => void;
  }) => (
    <div role="dialog" aria-label={title}>
      <p>{description}</p>
      <button type="button" onClick={onCancel}>
        {cancelText}
      </button>
      <button type="button" onClick={onConfirm}>
        {confirmText}
      </button>
    </div>
  ),
}));

// LoadingModal → title만 노출.
jest.mock('@/components/ui/loadingModal', () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => <div role="status">{title}</div>,
}));

// jsdom 미구현 — handleSubmit이 첫 에러로 scrollIntoView 호출하므로 no-op 스텁.
beforeAll(() => {
  Element.prototype.scrollIntoView = jest.fn();
});

const COURSES = [
  { courseId: 1, title: '수능 국어', instructor: '김강사' },
  { courseId: 2, title: '수능 수학', instructor: '이강사' },
];

// 한 문제(문제·보기4·정답·해설)를 정상 입력하는 헬퍼.
async function fillQuestion(
  user: ReturnType<typeof userEvent.setup>,
  blockIndex: number,
) {
  const block = document.getElementById(`quiz-field-q${blockIndex}`)!;
  const scope = within(block as HTMLElement);
  await user.type(scope.getByLabelText('문제'), `문제 내용 ${blockIndex}`);
  for (let i = 1; i <= 4; i++) {
    await user.type(scope.getByLabelText(`보기 ${i}`), `보기${i}`);
  }
  await user.click(scope.getByRole('button', { name: '정답: 보기 1' }));
  await user.type(scope.getByLabelText('해설'), '해설 내용');
}

// 상단 공통 필드(제목·강의·주차) 정상 입력.
async function fillTopFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText('퀴즈 제목을 입력하세요'), '1주차 퀴즈');
  await user.selectOptions(screen.getByLabelText('강의 선택'), '1');
  // ② 주차 옵션은 getQuizFormMetaAction(비동기)로 채워짐 → 옵션 뜰 때까지 대기
  await screen.findByRole('option', { name: '1주' });
  await user.selectOptions(screen.getByLabelText('주차 선택'), '1');
}

function renderCreate(
  overrides?: Partial<{
    createAction: (p: QuizFormPayload) => Promise<{ success: boolean; message?: string }>;
    takenWeeksByCourse: Record<number, number[]>;
    onSuccess: () => void;
    onClose: () => void;
  }>,
) {
  const onClose = overrides?.onClose ?? jest.fn();
  const onSuccess = overrides?.onSuccess ?? jest.fn();
  const createAction =
    overrides?.createAction ?? jest.fn(async () => ({ success: true }));
  render(
    <QuizFormModal
      mode="create"
      courses={COURSES}
      takenWeeksByCourse={overrides?.takenWeeksByCourse ?? {}}
      onClose={onClose}
      onSuccess={onSuccess}
      createAction={createAction}
    />,
  );
  return { onClose, onSuccess, createAction };
}

describe('QuizFormModal — 퀴즈 등록 모달 통합', () => {
  it('등록 모드 기본 렌더 — 제목·헤더·문제 1개·등록 완료 버튼', () => {
    renderCreate();
    expect(
      screen.getByRole('heading', { name: '퀴즈 등록' }),
    ).toBeInTheDocument();
    expect(screen.getByText('문제 1')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /등록 완료/ }),
    ).toBeInTheDocument();
  });

  describe('필수 빈칸 검증', () => {
    it('빈 폼 제출 시 상단·문제 필드 에러 메시지 표시', async () => {
      const user = userEvent.setup();
      const { createAction } = renderCreate();

      await user.click(screen.getByRole('button', { name: /등록 완료/ }));

      expect(screen.getByText('퀴즈 제목을 입력해주세요')).toBeInTheDocument();
      expect(screen.getByText('연결 강의를 선택해주세요')).toBeInTheDocument();
      expect(screen.getByText('연결 주차를 선택해주세요')).toBeInTheDocument();
      expect(screen.getByText('문제를 입력해주세요')).toBeInTheDocument();
      expect(screen.getAllByText('보기를 입력해주세요')).toHaveLength(4);
      expect(screen.getByText('정답을 선택해주세요')).toBeInTheDocument();
      expect(screen.getByText('해설을 입력해주세요')).toBeInTheDocument();
      // 검증 실패 → 확인 모달(고유 문구) 안 뜸 + 액션 미호출
      expect(
        screen.queryByText('해당 퀴즈를 등록하시겠습니까?'),
      ).not.toBeInTheDocument();
      expect(createAction).not.toHaveBeenCalled();
    });

    it('제목 입력하면 제목 에러만 해제(나머지는 유지)', async () => {
      const user = userEvent.setup();
      renderCreate();

      await user.click(screen.getByRole('button', { name: /등록 완료/ }));
      expect(screen.getByText('퀴즈 제목을 입력해주세요')).toBeInTheDocument();

      await user.type(
        screen.getByPlaceholderText('퀴즈 제목을 입력하세요'),
        '제목입력',
      );

      expect(
        screen.queryByText('퀴즈 제목을 입력해주세요'),
      ).not.toBeInTheDocument();
      // 다른 에러는 여전히 남아 있음
      expect(screen.getByText('연결 강의를 선택해주세요')).toBeInTheDocument();
    });

    it('정답 선택하면 정답 에러 해제', async () => {
      const user = userEvent.setup();
      renderCreate();

      await user.click(screen.getByRole('button', { name: /등록 완료/ }));
      expect(screen.getByText('정답을 선택해주세요')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: '정답: 보기 2' }));

      expect(screen.queryByText('정답을 선택해주세요')).not.toBeInTheDocument();
    });
  });

  describe('문제 추가/삭제', () => {
    it('문제 추가 버튼으로 문제 블록이 늘어남', async () => {
      const user = userEvent.setup();
      renderCreate();

      expect(screen.getByText('문제 1')).toBeInTheDocument();
      expect(screen.queryByText('문제 2')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /문제 추가/ }));

      expect(screen.getByText('문제 2')).toBeInTheDocument();
    });

    it('문제 1개일 땐 삭제 버튼 없음, 2개부터 삭제 가능', async () => {
      const user = userEvent.setup();
      renderCreate();

      // 1개일 때 삭제 버튼 미표시
      expect(
        screen.queryByRole('button', { name: '삭제' }),
      ).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /문제 추가/ }));
      expect(screen.getAllByRole('button', { name: '삭제' })).toHaveLength(2);
    });

    it('삭제 → 확인 모달 → 확인 시 해당 문제 제거', async () => {
      const user = userEvent.setup();
      renderCreate();

      await user.click(screen.getByRole('button', { name: /문제 추가/ }));
      expect(screen.getByText('문제 2')).toBeInTheDocument();

      // 두 번째 문제 삭제
      await user.click(screen.getAllByRole('button', { name: '삭제' })[1]);
      // 삭제 확인 모달
      const dialog = screen.getByRole('dialog', { name: '문제 삭제' });
      // ③ 삭제 확인은 폼을 '대체'하지 않고 그 '위에 겹쳐' 뜬다 — 모달 열린 동안에도
      //    폼(헤더·문제2)이 그대로 마운트돼 있어야 함. (early-return으로 폼 대체하던 옛 구현이면 실패)
      expect(
        screen.getByRole('heading', { name: '퀴즈 등록' }),
      ).toBeInTheDocument();
      expect(screen.getByText('문제 2')).toBeInTheDocument();

      await user.click(within(dialog).getByRole('button', { name: '삭제' }));

      expect(screen.queryByText('문제 2')).not.toBeInTheDocument();
      expect(screen.getByText('문제 1')).toBeInTheDocument();
    });

    it('삭제 확인 모달에서 취소하면 문제 유지', async () => {
      const user = userEvent.setup();
      renderCreate();

      await user.click(screen.getByRole('button', { name: /문제 추가/ }));
      await user.click(screen.getAllByRole('button', { name: '삭제' })[1]);

      const dialog = screen.getByRole('dialog', { name: '문제 삭제' });
      await user.click(within(dialog).getByRole('button', { name: '취소' }));

      expect(screen.getByText('문제 2')).toBeInTheDocument();
    });
  });

  describe('정상 제출 흐름', () => {
    it('전부 입력 후 제출 → 확인 모달 → 확인 시 createAction 호출(payload 정확)', async () => {
      const user = userEvent.setup();
      const createAction = jest.fn(async () => ({ success: true }));
      const { onSuccess, onClose } = renderCreate({ createAction });

      await fillTopFields(user);
      await fillQuestion(user, 0);

      await user.click(screen.getByRole('button', { name: /등록 완료/ }));

      // 확인 모달 표시 (아직 액션 미호출)
      const dialog = await screen.findByRole('dialog', { name: '퀴즈 등록' });
      expect(createAction).not.toHaveBeenCalled();

      await user.click(within(dialog).getByRole('button', { name: '확인' }));

      expect(createAction).toHaveBeenCalledTimes(1);
      const payload = (createAction.mock.calls[0] as unknown[])[0] as QuizFormPayload;
      expect(payload.title).toBe('1주차 퀴즈');
      expect(payload.courseId).toBe(1);
      expect(payload.week).toBe(1);
      expect(payload.questions).toHaveLength(1);
      expect(payload.questions[0]).toMatchObject({
        content: '문제 내용 0',
        options: ['보기1', '보기2', '보기3', '보기4'],
        answerIndex: 0,
        explanation: '해설 내용',
      });
      expect(onSuccess).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });

    it('확인 모달에서 취소하면 액션 미호출 + 폼 복귀(입력 유지)', async () => {
      const user = userEvent.setup();
      const createAction = jest.fn(async () => ({ success: true }));
      renderCreate({ createAction });

      await fillTopFields(user);
      await fillQuestion(user, 0);
      await user.click(screen.getByRole('button', { name: /등록 완료/ }));

      const dialog = await screen.findByRole('dialog', { name: '퀴즈 등록' });
      await user.click(within(dialog).getByRole('button', { name: '취소' }));

      expect(createAction).not.toHaveBeenCalled();
      // 폼이 다시 보이고 제목 입력값 유지
      expect(
        screen.getByDisplayValue('1주차 퀴즈'),
      ).toBeInTheDocument();
    });

    it('두 문제 모두 입력 후 제출 → questions 2개 전달', async () => {
      const user = userEvent.setup();
      const createAction = jest.fn(async () => ({ success: true }));
      renderCreate({ createAction });

      await fillTopFields(user);
      await fillQuestion(user, 0);
      await user.click(screen.getByRole('button', { name: /문제 추가/ }));
      await fillQuestion(user, 1);

      await user.click(screen.getByRole('button', { name: /등록 완료/ }));
      const dialog = await screen.findByRole('dialog', { name: '퀴즈 등록' });
      await user.click(within(dialog).getByRole('button', { name: '확인' }));

      const payload = (createAction.mock.calls[0] as unknown[])[0] as QuizFormPayload;
      expect(payload.questions).toHaveLength(2);
    });
  });

  describe('취소(닫기) 흐름', () => {
    it('취소 버튼 → 등록 취소 확인 모달 → 확인 시 onClose 호출', async () => {
      const user = userEvent.setup();
      const { onClose } = renderCreate();

      await user.click(screen.getByRole('button', { name: '취소' }));
      const dialog = screen.getByRole('dialog', { name: '퀴즈 등록 취소' });
      await user.click(within(dialog).getByRole('button', { name: '확인' }));

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('주차 소진 회귀 — noWeeksAvailable', () => {
    it('선택한 강의의 모든 주차가 차 있으면 안내 문구 표시', async () => {
      const user = userEvent.setup();
      // ② 주차는 getQuizFormMetaAction로 로드 → 이 강의는 1~12주 전부 점유로 응답
      (getQuizFormMetaAction as jest.Mock).mockResolvedValueOnce({
        weeks: Array.from({ length: 12 }, (_, i) => i + 1),
        takenWeeks: Array.from({ length: 12 }, (_, i) => i + 1),
      });
      renderCreate();

      await user.selectOptions(screen.getByLabelText('강의 선택'), '1');

      expect(
        await screen.findByText(/등록 가능한 주차가 없습니다/),
      ).toBeInTheDocument();
    });
  });
});
