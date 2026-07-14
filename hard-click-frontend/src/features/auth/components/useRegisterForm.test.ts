import { act, renderHook } from '@testing-library/react';

import { useRegisterForm } from './useRegisterForm';
import {
  checkEmailAction,
  checkUsernameAction,
  registerAction,
  sendEmailVerificationAction,
  verifyEmailCodeAction,
} from '../actions';

// 외부 의존(server action 모듈)을 stub — 원하는 결과 반환
jest.mock('../actions', () => ({
  checkUsernameAction: jest.fn(),
  checkEmailAction: jest.fn(),
  sendEmailVerificationAction: jest.fn(),
  verifyEmailCodeAction: jest.fn(),
  registerAction: jest.fn(),
}));

// toast(sonner) stub
jest.mock('@/lib/toast', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

// 쿨다운 타이머 훅 stub (실제 setInterval 회피)
jest.mock('@/hooks/useResendCooldown', () => ({
  useResendCooldown: () => ({
    cooldown: 0,
    isCoolingDown: false,
    startCooldown: jest.fn(),
  }),
}));

const mockCheckUsername = checkUsernameAction as jest.Mock;
const mockCheckEmail = checkEmailAction as jest.Mock;
const mockSendEmail = sendEmailVerificationAction as jest.Mock;
const mockVerifyEmail = verifyEmailCodeAction as jest.Mock;
const mockRegister = registerAction as jest.Mock;

// 비밀번호 규칙(8~16자·영문·숫자·특수문자@$!%#?&) 모두 만족하는 유효 값
const VALID_PASSWORD = 'abcd1234!';

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});

afterEach(() => {
  // focusInput 등 setTimeout(0) 잔여 타이머 정리
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

describe('useRegisterForm — 초기 상태', () => {
  it('1단계에서 시작하고 진행/제출 플래그가 모두 false다', () => {
    const { result } = renderHook(() => useRegisterForm());

    expect(result.current.step).toBe(1);
    expect(result.current.canGoStepOne).toBe(false);
    expect(result.current.canGoStepTwo).toBe(false);
    expect(result.current.canSubmit).toBe(false);
    expect(result.current.isEmailVerified).toBe(false);
  });

  it('남은 시간 포맷이 3:00으로 초기화된다 (BE code-ttl 3분과 일치)', () => {
    const { result } = renderHook(() => useRegisterForm());

    expect(result.current.formattedRemainingTime).toBe('3:00');
  });
});

describe('useRegisterForm — 카운트다운 리셋 경로 (전부 3:00 = TTL 3분)', () => {
  // 초기값이 이미 3:00이라, 리셋을 검증하려면 먼저 카운트다운을 진행시켜(2:55) '리셋됐다'를 증명해야 한다.
  // 진행 후에도 3:00이면 리셋값이 180초(3분)임이 확정된다 — 옛 300초였다면 4:55/5:00으로 남는다.
  async function startCountdown(result: {
    current: ReturnType<typeof useRegisterForm>;
  }) {
    mockCheckEmail.mockResolvedValue({ success: true, data: { exists: false } });
    mockSendEmail.mockResolvedValue({ success: true });
    act(() => result.current.updateValue('emailId', 'tester'));
    await act(async () => {
      await result.current.handleCheckEmail();
    });
    await act(async () => {
      await result.current.handleSendEmailCode();
    });
    // 5초 경과 → 2:55 (카운트다운이 실제로 도는지 확인)
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(result.current.formattedRemainingTime).toBe('2:55');
  }

  it('이메일을 변경하면 카운트다운이 3:00으로 리셋된다', async () => {
    const { result } = renderHook(() => useRegisterForm());
    await startCountdown(result);

    act(() => result.current.updateValue('emailId', 'other'));

    expect(result.current.formattedRemainingTime).toBe('3:00');
  });

  it('인증번호를 재발송하면 카운트다운이 3:00으로 리셋된다', async () => {
    const { result } = renderHook(() => useRegisterForm());
    await startCountdown(result);

    await act(async () => {
      await result.current.handleSendEmailCode(true);
    });

    expect(result.current.formattedRemainingTime).toBe('3:00');
  });
});

describe('useRegisterForm — updateValue 비밀번호 검증', () => {
  it('규칙을 만족하는 비밀번호는 success 상태가 된다', () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => result.current.updateValue('password', VALID_PASSWORD));

    expect(result.current.passwordStatus?.type).toBe('success');
    expect(result.current.passwordStatus?.text).toBe('사용 가능한 비밀번호입니다');
  });

  it('너무 짧은 비밀번호는 error 상태가 된다', () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => result.current.updateValue('password', 'a1!'));

    expect(result.current.passwordStatus?.type).toBe('error');
    expect(result.current.passwordStatus?.text).toBe(
      '비밀번호는 8자 이상 16자 이하로 입력해주세요',
    );
  });

  it('특수문자가 없는 비밀번호는 특수문자 안내 error를 준다', () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => result.current.updateValue('password', 'abcd1234'));

    expect(result.current.passwordStatus?.type).toBe('error');
    expect(result.current.passwordStatus?.text).toBe(
      '비밀번호는 특수문자(@$!%#?&)를 포함해야 합니다',
    );
  });

  it('빈 비밀번호로 바꾸면 상태가 null로 초기화된다', () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => result.current.updateValue('password', VALID_PASSWORD));
    act(() => result.current.updateValue('password', ''));

    expect(result.current.passwordStatus).toBeNull();
  });
});

describe('useRegisterForm — 비밀번호 확인 일치 검증', () => {
  it('비밀번호와 확인이 같으면 일치 success를 준다', () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => result.current.updateValue('password', VALID_PASSWORD));
    act(() => result.current.updateValue('passwordConfirm', VALID_PASSWORD));

    expect(result.current.passwordConfirmStatus?.type).toBe('success');
    expect(result.current.passwordConfirmStatus?.text).toBe('비밀번호가 일치합니다');
  });

  it('비밀번호와 확인이 다르면 불일치 error를 준다', () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => result.current.updateValue('password', VALID_PASSWORD));
    act(() => result.current.updateValue('passwordConfirm', 'different1!'));

    expect(result.current.passwordConfirmStatus?.type).toBe('error');
    expect(result.current.passwordConfirmStatus?.text).toBe(
      '비밀번호가 일치하지 않습니다',
    );
  });

  it('확인 값을 비우면 확인 상태가 null이 된다', () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => result.current.updateValue('passwordConfirm', VALID_PASSWORD));
    act(() => result.current.updateValue('passwordConfirm', ''));

    expect(result.current.passwordConfirmStatus).toBeNull();
  });
});

describe('useRegisterForm — canGoStepOne 파생값', () => {
  it('아이디·이메일·유효한 비밀번호·일치 확인이 모두 채워지면 true다', () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => result.current.updateValue('username', 'tester'));
    act(() => result.current.updateValue('emailId', 'tester'));
    act(() => result.current.updateValue('password', VALID_PASSWORD));
    act(() => result.current.updateValue('passwordConfirm', VALID_PASSWORD));

    expect(result.current.canGoStepOne).toBe(true);
  });

  it('비밀번호 확인이 다르면 false다', () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => result.current.updateValue('username', 'tester'));
    act(() => result.current.updateValue('emailId', 'tester'));
    act(() => result.current.updateValue('password', VALID_PASSWORD));
    act(() => result.current.updateValue('passwordConfirm', 'mismatch1!'));

    expect(result.current.canGoStepOne).toBe(false);
  });
});

describe('useRegisterForm — canGoStepTwo 파생값', () => {
  it('이름·성별·생년월일·전화번호가 모두 채워지면 true다', () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => result.current.updateValue('name', '홍길동'));
    act(() => result.current.updateValue('gender', 'MALE'));
    act(() => result.current.updateValue('birthDate', '2000-01-01'));
    act(() => result.current.updateValue('phoneNumber', '010-1234-5678'));

    expect(result.current.canGoStepTwo).toBe(true);
  });

  it('전화번호가 비어 있으면 false다', () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => result.current.updateValue('name', '홍길동'));
    act(() => result.current.updateValue('gender', 'MALE'));
    act(() => result.current.updateValue('birthDate', '2000-01-01'));

    expect(result.current.canGoStepTwo).toBe(false);
  });
});

describe('useRegisterForm — 약관 동의 파생값', () => {
  it('필수 약관(이용약관+개인정보)만 체크하면 requiredTermsChecked만 true다', () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => result.current.updateValue('agreeTerms', true));
    act(() => result.current.updateValue('agreePrivacy', true));

    expect(result.current.requiredTermsChecked).toBe(true);
    expect(result.current.allTermsChecked).toBe(false);
  });

  it('마케팅까지 체크하면 allTermsChecked가 true다', () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => result.current.updateValue('agreeTerms', true));
    act(() => result.current.updateValue('agreePrivacy', true));
    act(() => result.current.updateValue('agreeMarketing', true));

    expect(result.current.allTermsChecked).toBe(true);
  });
});

describe('useRegisterForm — handleCheckUsername (중복 확인)', () => {
  it('아이디가 비어 있으면 액션 호출 없이 error 상태가 된다', async () => {
    const { result } = renderHook(() => useRegisterForm());

    await act(async () => {
      await result.current.handleCheckUsername();
    });

    expect(mockCheckUsername).not.toHaveBeenCalled();
    expect(result.current.usernameStatus?.type).toBe('error');
    expect(result.current.usernameStatus?.text).toBe('아이디를 입력해주세요');
  });

  it('사용 가능한 아이디면 success + 체크 통과 상태가 된다', async () => {
    mockCheckUsername.mockResolvedValue({
      success: true,
      data: { exists: false },
    });
    const { result } = renderHook(() => useRegisterForm());

    act(() => result.current.updateValue('username', 'newuser'));
    await act(async () => {
      await result.current.handleCheckUsername();
    });

    expect(mockCheckUsername).toHaveBeenCalledWith('newuser');
    expect(result.current.usernameStatus?.type).toBe('success');
    expect(result.current.usernameStatus?.text).toBe('사용 가능한 아이디입니다');
  });

  it('이미 사용 중인 아이디면 error 상태가 된다', async () => {
    mockCheckUsername.mockResolvedValue({
      success: true,
      data: { exists: true },
    });
    const { result } = renderHook(() => useRegisterForm());

    act(() => result.current.updateValue('username', 'dupuser'));
    await act(async () => {
      await result.current.handleCheckUsername();
    });

    expect(result.current.usernameStatus?.type).toBe('error');
    expect(result.current.usernameStatus?.text).toBe('이미 사용 중인 아이디입니다');
  });

  it('액션 실패면 warning 상태가 된다', async () => {
    mockCheckUsername.mockResolvedValue({
      success: false,
      message: '서버 오류',
    });
    const { result } = renderHook(() => useRegisterForm());

    act(() => result.current.updateValue('username', 'user'));
    await act(async () => {
      await result.current.handleCheckUsername();
    });

    expect(result.current.usernameStatus?.type).toBe('warning');
    expect(result.current.usernameStatus?.text).toBe('서버 오류');
  });
});

describe('useRegisterForm — handleCheckEmail (중복 확인)', () => {
  it('이메일 형식이 올바르지 않으면 액션 호출 없이 error가 된다', async () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => result.current.updateValue('emailId', 'bad email!'));
    await act(async () => {
      await result.current.handleCheckEmail();
    });

    expect(mockCheckEmail).not.toHaveBeenCalled();
    expect(result.current.emailStatus?.type).toBe('error');
    expect(result.current.emailStatus?.text).toBe(
      '이메일 아이디 형식이 올바르지 않습니다',
    );
  });

  it('사용 가능한 이메일이면 success가 된다', async () => {
    mockCheckEmail.mockResolvedValue({ success: true, data: { exists: false } });
    const { result } = renderHook(() => useRegisterForm());

    act(() => result.current.updateValue('emailId', 'tester'));
    await act(async () => {
      await result.current.handleCheckEmail();
    });

    expect(result.current.emailStatus?.type).toBe('success');
    expect(result.current.emailStatus?.text).toBe('사용 가능한 이메일입니다');
  });

  it('이미 사용 중인 이메일이면 error가 된다', async () => {
    mockCheckEmail.mockResolvedValue({ success: true, data: { exists: true } });
    const { result } = renderHook(() => useRegisterForm());

    act(() => result.current.updateValue('emailId', 'tester'));
    await act(async () => {
      await result.current.handleCheckEmail();
    });

    expect(result.current.emailStatus?.type).toBe('error');
    expect(result.current.emailStatus?.text).toBe('이미 사용 중인 이메일입니다');
  });
});

describe('useRegisterForm — handleSendEmailCode (인증번호 발송)', () => {
  it('이메일 중복 확인 전이면 error 안내를 주고 액션을 호출하지 않는다', async () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => result.current.updateValue('emailId', 'tester'));
    await act(async () => {
      await result.current.handleSendEmailCode();
    });

    expect(mockSendEmail).not.toHaveBeenCalled();
    expect(result.current.verificationStatus?.type).toBe('error');
    expect(result.current.verificationStatus?.text).toBe(
      '이메일 중복 확인을 먼저 진행해주세요',
    );
  });

  it('중복 확인 후 발송하면 isEmailSent가 true가 되고 success 안내를 준다', async () => {
    mockCheckEmail.mockResolvedValue({ success: true, data: { exists: false } });
    mockSendEmail.mockResolvedValue({ success: true });
    const { result } = renderHook(() => useRegisterForm());

    act(() => result.current.updateValue('emailId', 'tester'));
    await act(async () => {
      await result.current.handleCheckEmail();
    });
    await act(async () => {
      await result.current.handleSendEmailCode();
    });

    expect(mockSendEmail).toHaveBeenCalled();
    expect(result.current.isEmailSent).toBe(true);
    expect(result.current.verificationStatus?.type).toBe('success');
    expect(result.current.verificationStatus?.text).toBe(
      '인증번호가 발송되었습니다.',
    );
  });
});

describe('useRegisterForm — handleVerifyEmailCode (인증번호 검증)', () => {
  async function arrangeSentEmail(result: {
    current: ReturnType<typeof useRegisterForm>;
  }) {
    mockCheckEmail.mockResolvedValue({ success: true, data: { exists: false } });
    mockSendEmail.mockResolvedValue({ success: true });

    act(() => result.current.updateValue('emailId', 'tester'));
    await act(async () => {
      await result.current.handleCheckEmail();
    });
    await act(async () => {
      await result.current.handleSendEmailCode();
    });
  }

  it('인증번호가 비어 있으면 error를 주고 액션을 호출하지 않는다', async () => {
    const { result } = renderHook(() => useRegisterForm());
    await arrangeSentEmail(result);

    await act(async () => {
      await result.current.handleVerifyEmailCode();
    });

    expect(mockVerifyEmail).not.toHaveBeenCalled();
    expect(result.current.verificationStatus?.type).toBe('error');
    expect(result.current.verificationStatus?.text).toBe('인증번호를 입력해주세요');
  });

  it('숫자 6자리가 아니면 형식 error를 준다', async () => {
    const { result } = renderHook(() => useRegisterForm());
    await arrangeSentEmail(result);

    act(() => result.current.updateValue('verificationCode', '123'));
    await act(async () => {
      await result.current.handleVerifyEmailCode();
    });

    expect(mockVerifyEmail).not.toHaveBeenCalled();
    expect(result.current.verificationStatus?.text).toBe(
      '인증번호는 숫자 6자리로 입력해주세요',
    );
  });

  it('올바른 코드면 isEmailVerified가 true가 되고 토큰을 받는다', async () => {
    mockVerifyEmail.mockResolvedValue({
      success: true,
      data: { emailVerificationToken: 'token-123' },
    });
    const { result } = renderHook(() => useRegisterForm());
    await arrangeSentEmail(result);

    act(() => result.current.updateValue('verificationCode', '123456'));
    await act(async () => {
      await result.current.handleVerifyEmailCode();
    });

    expect(mockVerifyEmail).toHaveBeenCalled();
    expect(result.current.isEmailVerified).toBe(true);
    expect(result.current.verificationStatus?.type).toBe('success');
    expect(result.current.verificationStatus?.text).toBe(
      '이메일 인증이 완료되었습니다.',
    );
  });

  it('코드가 틀리면 error를 주고 인증되지 않는다', async () => {
    mockVerifyEmail.mockResolvedValue({
      success: false,
      message: '인증번호가 올바르지 않습니다',
    });
    const { result } = renderHook(() => useRegisterForm());
    await arrangeSentEmail(result);

    act(() => result.current.updateValue('verificationCode', '999999'));
    await act(async () => {
      await result.current.handleVerifyEmailCode();
    });

    expect(result.current.isEmailVerified).toBe(false);
    expect(result.current.verificationStatus?.type).toBe('error');
  });
});

describe('useRegisterForm — goNext (단계 검증)', () => {
  it('1단계: 입력이 비어 있으면 단계 이동 없이 에러 상태를 채운다', () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => result.current.goNext());

    expect(result.current.step).toBe(1);
    expect(result.current.usernameStatus?.type).toBe('error');
    expect(result.current.passwordStatus?.type).toBe('error');
  });

  it('1단계: 형식은 맞지만 중복 확인을 안 했으면 warning을 주고 머문다', () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => result.current.updateValue('username', 'tester'));
    act(() => result.current.updateValue('emailId', 'tester'));
    act(() => result.current.updateValue('password', VALID_PASSWORD));
    act(() => result.current.updateValue('passwordConfirm', VALID_PASSWORD));
    act(() => result.current.goNext());

    expect(result.current.step).toBe(1);
    expect(result.current.usernameStatus?.type).toBe('warning');
    expect(result.current.usernameStatus?.text).toBe('아이디 중복 확인이 필요합니다');
    expect(result.current.emailStatus?.type).toBe('warning');
  });

  it('1단계: 모든 검증·중복 확인 통과 시 2단계로 이동한다', async () => {
    mockCheckUsername.mockResolvedValue({
      success: true,
      data: { exists: false },
    });
    mockCheckEmail.mockResolvedValue({ success: true, data: { exists: false } });
    const { result } = renderHook(() => useRegisterForm());

    act(() => result.current.updateValue('username', 'tester'));
    act(() => result.current.updateValue('emailId', 'tester'));
    act(() => result.current.updateValue('password', VALID_PASSWORD));
    act(() => result.current.updateValue('passwordConfirm', VALID_PASSWORD));
    await act(async () => {
      await result.current.handleCheckUsername();
    });
    await act(async () => {
      await result.current.handleCheckEmail();
    });
    act(() => result.current.goNext());

    expect(result.current.step).toBe(2);
  });

  it('2단계: 미래 생년월일이면 에러를 주고 3단계로 가지 않는다', async () => {
    const { result } = renderHook(() => useRegisterForm());

    // 1단계 통과 선행
    mockCheckUsername.mockResolvedValue({
      success: true,
      data: { exists: false },
    });
    mockCheckEmail.mockResolvedValue({ success: true, data: { exists: false } });
    act(() => result.current.updateValue('username', 'tester'));
    act(() => result.current.updateValue('emailId', 'tester'));
    act(() => result.current.updateValue('password', VALID_PASSWORD));
    act(() => result.current.updateValue('passwordConfirm', VALID_PASSWORD));
    await act(async () => {
      await result.current.handleCheckUsername();
    });
    await act(async () => {
      await result.current.handleCheckEmail();
    });
    act(() => result.current.goNext());
    expect(result.current.step).toBe(2);

    act(() => result.current.updateValue('name', '홍길동'));
    act(() => result.current.updateValue('gender', 'MALE'));
    act(() => result.current.updateValue('birthDate', '2999-12-31'));
    act(() => result.current.updateValue('phoneNumber', '010-1234-5678'));
    act(() => result.current.goNext());

    expect(result.current.step).toBe(2);
    expect(result.current.birthDateStatus?.type).toBe('error');
    expect(result.current.birthDateStatus?.text).toBe(
      '생년월일은 미래 날짜를 선택할 수 없습니다',
    );
  });

  it('2단계: 전화번호 형식이 틀리면 에러를 주고 머문다', async () => {
    const { result } = renderHook(() => useRegisterForm());

    mockCheckUsername.mockResolvedValue({
      success: true,
      data: { exists: false },
    });
    mockCheckEmail.mockResolvedValue({ success: true, data: { exists: false } });
    act(() => result.current.updateValue('username', 'tester'));
    act(() => result.current.updateValue('emailId', 'tester'));
    act(() => result.current.updateValue('password', VALID_PASSWORD));
    act(() => result.current.updateValue('passwordConfirm', VALID_PASSWORD));
    await act(async () => {
      await result.current.handleCheckUsername();
    });
    await act(async () => {
      await result.current.handleCheckEmail();
    });
    act(() => result.current.goNext());

    act(() => result.current.updateValue('name', '홍길동'));
    act(() => result.current.updateValue('gender', 'MALE'));
    act(() => result.current.updateValue('birthDate', '2000-01-01'));
    // formatPhoneNumber를 거치지 않고 잘못된 형식 직접 주입
    act(() => result.current.updateValue('phoneNumber', '02-123-4567'));
    act(() => result.current.goNext());

    expect(result.current.step).toBe(2);
    expect(result.current.phoneStatus?.type).toBe('error');
  });
});

describe('useRegisterForm — handleSubmit (최종 제출 검증)', () => {
  it('약관 미동의·미인증이면 register 액션을 호출하지 않고 에러 안내를 준다', async () => {
    const { result } = renderHook(() => useRegisterForm());

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockRegister).not.toHaveBeenCalled();
    expect(result.current.termsStatus?.type).toBe('error');
    expect(result.current.verificationStatus?.type).toBe('error');
    expect(result.current.verificationStatus?.text).toBe(
      '이메일 인증을 진행해주세요',
    );
  });

  it('약관 동의+이메일 인증 완료면 register 액션을 호출하고 성공 시 4단계로 간다', async () => {
    mockCheckEmail.mockResolvedValue({ success: true, data: { exists: false } });
    mockSendEmail.mockResolvedValue({ success: true });
    mockVerifyEmail.mockResolvedValue({
      success: true,
      data: { emailVerificationToken: 'token-123' },
    });
    mockRegister.mockResolvedValue({ success: true });
    const { result } = renderHook(() => useRegisterForm());

    // 이메일 인증 완료까지 진행
    act(() => result.current.updateValue('emailId', 'tester'));
    await act(async () => {
      await result.current.handleCheckEmail();
    });
    await act(async () => {
      await result.current.handleSendEmailCode();
    });
    act(() => result.current.updateValue('verificationCode', '123456'));
    await act(async () => {
      await result.current.handleVerifyEmailCode();
    });

    // 필수 약관 동의
    act(() => result.current.updateValue('agreeTerms', true));
    act(() => result.current.updateValue('agreePrivacy', true));

    expect(result.current.canSubmit).toBe(true);

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockRegister).toHaveBeenCalled();
    expect(result.current.step).toBe(4);
  });

  it('register 액션이 실패하면 4단계로 가지 않고 formMessage에 에러를 남긴다', async () => {
    mockCheckEmail.mockResolvedValue({ success: true, data: { exists: false } });
    mockSendEmail.mockResolvedValue({ success: true });
    mockVerifyEmail.mockResolvedValue({
      success: true,
      data: { emailVerificationToken: 'token-123' },
    });
    mockRegister.mockResolvedValue({
      success: false,
      message: '회원가입에 실패했습니다',
    });
    const { result } = renderHook(() => useRegisterForm());

    act(() => result.current.updateValue('emailId', 'tester'));
    await act(async () => {
      await result.current.handleCheckEmail();
    });
    await act(async () => {
      await result.current.handleSendEmailCode();
    });
    act(() => result.current.updateValue('verificationCode', '123456'));
    await act(async () => {
      await result.current.handleVerifyEmailCode();
    });
    act(() => result.current.updateValue('agreeTerms', true));
    act(() => result.current.updateValue('agreePrivacy', true));

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.step).not.toBe(4);
    expect(result.current.formMessage?.type).toBe('error');
    expect(result.current.formMessage?.text).toBe('회원가입에 실패했습니다');
    // httpStatus 미지정(비401) 실패는 인증 상태를 건드리지 않는다(리셋은 401 전용).
    expect(result.current.isEmailVerified).toBe(true);
  });

  it('register가 401(이메일 인증 토큰 만료)로 실패하면 인증 상태를 리셋해 재인증을 유도한다', async () => {
    mockCheckEmail.mockResolvedValue({ success: true, data: { exists: false } });
    mockSendEmail.mockResolvedValue({ success: true });
    mockVerifyEmail.mockResolvedValue({
      success: true,
      data: { emailVerificationToken: 'token-123' },
    });
    // BE가 만료/무효 토큰을 401(ErrorCode C003)로 거부
    mockRegister.mockResolvedValue({
      success: false,
      httpStatus: 401,
      message: '인증이 필요합니다',
    });
    const { result } = renderHook(() => useRegisterForm());

    act(() => result.current.updateValue('emailId', 'tester'));
    await act(async () => {
      await result.current.handleCheckEmail();
    });
    await act(async () => {
      await result.current.handleSendEmailCode();
    });
    act(() => result.current.updateValue('verificationCode', '123456'));
    await act(async () => {
      await result.current.handleVerifyEmailCode();
    });
    act(() => result.current.updateValue('agreeTerms', true));
    act(() => result.current.updateValue('agreePrivacy', true));
    expect(result.current.isEmailVerified).toBe(true);

    await act(async () => {
      await result.current.handleSubmit();
    });

    // 초록 '인증 완료'가 stuck돼 401만 반복되지 않도록 인증 서브플로우를 초기 상태로 되돌린다.
    expect(result.current.step).not.toBe(4);
    expect(result.current.isEmailVerified).toBe(false);
    expect(result.current.isEmailSent).toBe(false); // 발송 상태까지 리셋(stale 카운트다운 방지)
    expect(result.current.isEmailSendLimitExceeded).toBe(false); // 발송 상한도 리셋(재인증 데드엔드 방지)
    expect(result.current.formattedRemainingTime).toBe('3:00'); // 카운트다운도 TTL(3분)로 리셋 — 옛 300초 회귀 방지
    expect(result.current.values.emailVerificationToken).toBe('');
    expect(result.current.values.verificationCode).toBe(''); // 코드 입력값도 리셋
    expect(result.current.verificationStatus).toBeNull(); // 초록 잔상 제거
    // 메시지는 설계된 formMessage 자리에, 애매한 BE 원문 대신 재인증 의도를 명확히.
    expect(result.current.formMessage?.type).toBe('error');
    expect(result.current.formMessage?.text).toBe(
      '이메일 인증이 만료되었거나 유효하지 않습니다. 아래에서 다시 인증해주세요.',
    );
  });

  it('register가 400(비-401 실패)이면 인증 상태를 그대로 유지한다 (리셋은 401 전용)', async () => {
    mockCheckEmail.mockResolvedValue({ success: true, data: { exists: false } });
    mockSendEmail.mockResolvedValue({ success: true });
    mockVerifyEmail.mockResolvedValue({
      success: true,
      data: { emailVerificationToken: 'token-123' },
    });
    // 이메일 인증과 무관한 400 실패(예: 아이디 형식/중복) — 초록 '인증 완료'는 유지돼야 한다.
    mockRegister.mockResolvedValue({
      success: false,
      httpStatus: 400,
      message: '회원가입에 실패했습니다',
    });
    const { result } = renderHook(() => useRegisterForm());

    act(() => result.current.updateValue('emailId', 'tester'));
    await act(async () => {
      await result.current.handleCheckEmail();
    });
    await act(async () => {
      await result.current.handleSendEmailCode();
    });
    act(() => result.current.updateValue('verificationCode', '123456'));
    await act(async () => {
      await result.current.handleVerifyEmailCode();
    });
    act(() => result.current.updateValue('agreeTerms', true));
    act(() => result.current.updateValue('agreePrivacy', true));
    expect(result.current.isEmailVerified).toBe(true);

    await act(async () => {
      await result.current.handleSubmit();
    });

    // 401이 아니므로 인증 상태·토큰이 보존되고, formMessage에만 에러가 남는다(리셋은 401 전용).
    expect(result.current.step).not.toBe(4);
    expect(result.current.isEmailVerified).toBe(true);
    expect(result.current.values.emailVerificationToken).toBe('token-123');
    expect(result.current.verificationStatus?.type).toBe('success'); // 초록 인증완료 유지
    expect(result.current.formMessage?.text).toBe('회원가입에 실패했습니다');
  });
});

describe('useRegisterForm — handlePhoneChange 포맷팅', () => {
  it('숫자 입력을 010-0000-0000 형식으로 포맷한다', () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => result.current.handlePhoneChange('01012345678'));

    expect(result.current.values.phoneNumber).toBe('010-1234-5678');
  });
});
