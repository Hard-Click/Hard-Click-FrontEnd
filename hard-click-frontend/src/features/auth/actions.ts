import {
  checkEmail,
  checkUsername,
  register,
  sendEmailVerification,
  verifyEmailCode,
} from './services';
import { getEmail } from './schemas';
import type { RegisterFormValues, RegisterRequest } from './types';

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
      message: '성별을 선택해주세요',
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
    role: 'STUDENT',
    marketingAgreed: values.agreeMarketing,
  };

  return register(payload);
}
