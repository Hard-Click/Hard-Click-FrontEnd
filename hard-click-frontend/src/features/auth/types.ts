export type RegisterStep = 1 | 2 | 3 | 4;

export type Gender = 'MALE' | 'FEMALE' | '';

export interface RegisterFormValues {
  username: string;

  emailId: string;
  emailDomain: 'gmail.com';

  password: string;
  passwordConfirm: string;

  name: string;
  gender: Gender;
  birthDate: string;
  phoneNumber: string;
  profileImage: File | null;
  profileImagePreview: string;

  agreeTerms: boolean;
  agreePrivacy: boolean;
  agreeMarketing: boolean;

  verificationCode: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  name: string;
  gender: 'MALE' | 'FEMALE' | 'NONE';
  birthDate: string;
  phoneNumber: string;
  role: 'STUDENT';
  marketingAgreed: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errorCode?: string;
}

export interface DuplicateCheckResponse {
  exists: boolean;
}

export interface EmailVerificationResponse {
  verified: boolean;
}
