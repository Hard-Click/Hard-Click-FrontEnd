import {
  checkEmail,
  checkUsername,
  login,
  register,
  sendEmailVerification,
  verifyEmailCode,
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

  if (!values.emailVerificationToken) {
    return {
      success: false,
      httpStatus: 400,
      data: undefined,
      message: '이메일 인증이 필요합니다',
    };
  }

  const payload: RegisterRequest = {
    username: values.username.trim(),
    email: getEmail(values),
    password: values.password,
    passwordConfirm: values.passwordConfirm,
    name: values.name.trim(),
    gender: values.gender,
    birthDate: values.birthDate,
    phoneNumber: values.phoneNumber.trim(),
    emailVerificationToken: values.emailVerificationToken,
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
