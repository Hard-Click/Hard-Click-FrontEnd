/**
 * RegisterForm 및 그 하위 컴포넌트들이 공유하는 타입·상수·헬퍼.
 * (RegisterForm.tsx에서 분리한 인라인 컴포넌트들이 함께 사용)
 */

export type StatusType = 'success' | 'warning' | 'error';

export type FieldStatus = {
  type: StatusType;
  text: string;
};

export type TermsModalType = 'terms' | 'privacy' | 'marketing' | null;

export const iconPath = {
  user: '/icons/userIcon.svg',
  mail: '/icons/mailIcon.svg',
  password: '/icons/passwordIcon.svg',
  openEye: '/icons/openEye.svg',
  closeEye: '/icons/closeEye.svg',
  check: '/icons/checkCircleIcon.svg',
  warning: '/icons/warningIcon.svg',
  error: '/icons/error.svg',
  calendar: '/icons/calendarIcon.svg',
  upload: '/icons/uploadIcon.svg',
  phone: '/icons/phoneIcon.svg',
};

export function getInputBorderClass(status?: FieldStatus | null) {
  if (status?.type === 'error') {
    return 'border-[#B91C1C] focus:border-[#B91C1C]';
  }

  if (status?.type === 'warning') {
    return 'border-[#F59E0B] focus:border-[#F59E0B]';
  }

  return 'border-[#E2E8F0] focus:border-[#2F5DAA]';
}
