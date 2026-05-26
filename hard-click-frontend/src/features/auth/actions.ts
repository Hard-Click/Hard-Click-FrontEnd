import {
  checkEmail,
  checkUsername,
  login,
  register,
  sendEmailVerification,
  verifyEmailCode,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  resetPassword,
  verifyAccountLockCode,
  changeLockedAccountPassword,
  changePassword,
} from './services';
import { getEmail } from './schemas';
import type { LoginRequest, RegisterFormValues, RegisterRequest } from './types';

export async function checkUsernameAction(username: string) {
  return checkUsername(username.trim());
}

export async function checkEmailAction(values: Pick<RegisterFormValues, 'emailId' | 'emailDomain'>) {
  return checkEmail(getEmail(values));
}

export async function sendEmailVerificationAction(
  values: Pick<RegisterFormValues, 'emailId' | 'emailDomain'>
) {
  return sendEmailVerification(getEmail(values));
}

export async function verifyEmailCodeAction(
  values: Pick<RegisterFormValues, 'emailId' | 'emailDomain' | 'verificationCode'>
) {
  return verifyEmailCode(getEmail(values), values.verificationCode.trim());
}

export async function registerAction(values: RegisterFormValues) {
  if (!values.gender) {
    return {
      success: false,
      httpStatus: 400,
      data: undefined,
      message: '성별을 선택해주세요',
    };
  }

  // 이메일 인증 완료 여부는 프론트에서만 확인 (백엔드 payload에는 포함 안 함)
  if (!values.emailVerificationToken) {
    return {
      success: false,
      httpStatus: 400,
      data: undefined,
      message: '이메일 인증이 필요합니다',
    };
  }

  // 비밀번호 일치 검증도 프론트에서만 수행
  if (values.password !== values.passwordConfirm) {
    return {
      success: false,
      httpStatus: 400,
      data: undefined,
      message: '비밀번호가 일치하지 않습니다',
    };
  }

  const payload: RegisterRequest = {
    username: values.username.trim(),
    email: getEmail(values),
    password: values.password,
    name: values.name.trim(),
    gender: values.gender,
    birthDate: values.birthDate,
    phoneNumber: values.phoneNumber.trim(),
    requiredTermsAgreed: values.agreeTerms && values.agreePrivacy,
    optionalTermsAgreed: values.agreeMarketing,
  };

  return register(payload);
}

export async function loginAction(payload: LoginRequest) {
  if (!payload.username.trim() || !payload.password.trim()) {
    return {
      success: false,
      message: '아이디와 비밀번호를 모두 입력해주세요',
    };
  }

  return login({
    username: payload.username.trim(),
    password: payload.password,
  });
}

/* ─────────────── 비밀번호 찾기 흐름 ─────────────── */

export async function sendPasswordResetEmailAction(email: string) {
  if (!email.trim()) {
    return { success: false, message: '이메일을 입력해주세요' };
  }
  return sendPasswordResetEmail(email.trim());
}

export async function verifyPasswordResetCodeAction(email: string, code: string) {
  if (!email.trim() || !code.trim()) {
    return { success: false, message: '이메일과 인증번호를 모두 입력해주세요' };
  }
  return verifyPasswordResetCode(email.trim(), code.trim());
}

export async function resetPasswordAction(payload: {
  email: string;
  passwordChangeToken: string;
  newPassword: string;
  newPasswordConfirm: string;
}) {
  if (payload.newPassword !== payload.newPasswordConfirm) {
    return { success: false, message: '비밀번호가 일치하지 않습니다' };
  }
  return resetPassword(payload);
}

/* ─────────────── 잠긴 계정 흐름 ─────────────── */

export async function verifyAccountLockCodeAction(email: string, code: string) {
  if (!email.trim() || !code.trim()) {
    return { success: false, message: '이메일과 인증번호를 모두 입력해주세요' };
  }
  return verifyAccountLockCode(email.trim(), code.trim());
}

export async function changeLockedAccountPasswordAction(payload: {
  passwordChangeToken: string;
  newPassword: string;
  newPasswordConfirm: string;
}) {
  if (payload.newPassword !== payload.newPasswordConfirm) {
    return { success: false, message: '비밀번호가 일치하지 않습니다' };
  }
  return changeLockedAccountPassword(payload);
}

/* ─────────────── 비밀번호 변경 (로그인 상태) ─────────────── */

export async function changePasswordAction(payload: {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
}) {
  if (!payload.currentPassword.trim()) {
    return { success: false, message: '현재 비밀번호를 입력해주세요' };
  }
  if (payload.newPassword !== payload.newPasswordConfirm) {
    return { success: false, message: '새 비밀번호가 일치하지 않습니다' };
  }
  return changePassword(payload);
}
