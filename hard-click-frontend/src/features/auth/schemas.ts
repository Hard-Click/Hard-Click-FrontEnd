import type { RegisterFormValues } from './types';

export const getEmail = (
  values: Pick<RegisterFormValues, 'emailId' | 'emailDomain'>,
) => {
  return `${values.emailId}@${values.emailDomain}`;
};

export const getUsernameError = (username: string): string => {
  const trimmed = username.trim();
  if (!trimmed) {
    return '아이디를 입력해주세요';
  }

  // BE SignupRequest.username @Pattern("^[a-zA-Z0-9]{4,20}$")와 동일 규칙으로 사전 검증.
  //   FE가 형식을 안 막으면 한글·특수문자·4자미만 아이디가 중복확인(형식 미검증)까지 통과한 뒤
  //   마지막 가입에서만 BE 400으로 거부돼, 사용자는 원인 안내 없이 "가입이 안 된다"만 겪는다.
  if (!/^[a-zA-Z0-9]{4,20}$/.test(trimmed)) {
    return '아이디는 영문, 숫자 조합으로 4자 이상 20자 이하여야 합니다';
  }

  return '';
};

export const getEmailIdError = (emailId: string) => {
  if (!emailId.trim()) {
    return '이메일 아이디를 입력해주세요';
  }

  if (!/^[A-Za-z0-9._%+-]+$/.test(emailId)) {
    return '이메일 아이디 형식이 올바르지 않습니다';
  }

  return '';
};

export const getPasswordError = (password: string) => {
  if (!password) {
    return '비밀번호를 입력해주세요';
  }

  if (password.length < 8 || password.length > 16) {
    return '비밀번호는 8자 이상 16자 이하로 입력해주세요';
  }

  if (!/[A-Za-z]/.test(password)) {
    return '비밀번호는 영문을 포함해야 합니다';
  }

  if (!/[0-9]/.test(password)) {
    return '비밀번호는 숫자를 포함해야 합니다';
  }

  if (!/[@$!%#?&]/.test(password)) {
    return '비밀번호는 특수문자(@$!%#?&)를 포함해야 합니다';
  }

  return '';
};

export const validatePassword = (password: string) => {
  return (
    password.length >= 8 &&
    password.length <= 16 &&
    /[A-Za-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[@$!%#?&]/.test(password)
  );
};

export const getNameError = (name: string) => {
  if (!name.trim()) {
    return '이름을 입력해주세요';
  }

  if (name.trim().length < 2) {
    return '이름은 2자 이상 입력해주세요';
  }

  return '';
};

export const isFutureDate = (date: string) => {
  if (!date) return false;

  const selectedDate = new Date(date);
  const today = new Date();

  selectedDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return selectedDate > today;
};

export const formatPhoneNumber = (value: string) => {
  const onlyNumbers = value.replace(/\D/g, '').slice(0, 11);

  if (onlyNumbers.length <= 3) {
    return onlyNumbers;
  }

  if (onlyNumbers.length <= 7) {
    return `${onlyNumbers.slice(0, 3)}-${onlyNumbers.slice(3)}`;
  }

  return `${onlyNumbers.slice(0, 3)}-${onlyNumbers.slice(
    3,
    7,
  )}-${onlyNumbers.slice(7)}`;
};

export const validateStepOne = (
  values: RegisterFormValues,
  isUsernameChecked: boolean,
  isEmailChecked: boolean,
) => {
  const usernameError = getUsernameError(values.username);

  if (usernameError) {
    return usernameError;
  }

  if (!isUsernameChecked) {
    return '아이디 중복 확인이 필요합니다';
  }

  const emailError = getEmailIdError(values.emailId);

  if (emailError) {
    return emailError;
  }

  if (!isEmailChecked) {
    return '이메일 중복 확인이 필요합니다';
  }

  const passwordError = getPasswordError(values.password);

  if (passwordError) {
    return passwordError;
  }

  if (!values.passwordConfirm) {
    return '비밀번호 확인을 입력해주세요';
  }

  if (values.password !== values.passwordConfirm) {
    return '비밀번호가 일치하지 않습니다';
  }

  return '';
};

export const validateStepTwo = (values: RegisterFormValues) => {
  const nameError = getNameError(values.name);

  if (nameError) {
    return nameError;
  }

  if (!values.gender) {
    return '성별을 선택해주세요';
  }

  if (!values.birthDate) {
    return '생년월일을 선택해주세요';
  }

  if (isFutureDate(values.birthDate)) {
    return '생년월일은 미래 날짜를 선택할 수 없습니다';
  }

  if (!values.phoneNumber.trim()) {
    return '전화번호를 입력해주세요';
  }

  if (!/^010-\d{4}-\d{4}$/.test(values.phoneNumber)) {
    return '전화번호는 010-0000-0000 형식으로 입력해주세요';
  }

  return '';
};

export const validateStepThree = (
  values: RegisterFormValues,
  isEmailVerified: boolean,
) => {
  if (!values.agreeTerms || !values.agreePrivacy) {
    return '모든 약관에 동의해주세요';
  }

  if (!isEmailVerified) {
    return '이메일 인증을 진행해주세요';
  }

  return '';
};
