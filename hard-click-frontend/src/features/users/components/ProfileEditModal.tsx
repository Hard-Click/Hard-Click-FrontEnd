'use client';

import { forwardRef, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import LoadingModal from '@/components/ui/loadingModal';
import WithdrawConfirmModal from './WithdrawConfirmModal';
import { updateMyProfile, withdrawAccount } from '@/features/users/services';
import { authStore } from '@/store/auth.store';

interface ProfileEditModalProps {
  /** 현재 프로필 이미지 (있으면 미리보기) */
  initialImageUrl?: string;
  onClose: () => void;
  /** 저장 성공 시 호출 (부모가 데이터 refetch 용도) */
  onSaved?: () => void;
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MOCK_CURRENT_PASSWORD = 'h4511068@';
const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%#?&]).{8,16}$/;

type PwCheck = { type: 'success' | 'error'; text: string } | null;

export default function ProfileEditModal({ initialImageUrl, onClose, onSaved }: ProfileEditModalProps) {
  const router = useRouter();

  const [imagePreview, setImagePreview] = useState(initialImageUrl ?? '');
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [newPwConfirm, setNewPwConfirm] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [currentPwCheck, setCurrentPwCheck] = useState<PwCheck>(null);
  const [newPwCheck, setNewPwCheck] = useState<PwCheck>(null);
  const [confirmPwCheck, setConfirmPwCheck] = useState<PwCheck>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const currentPwRef = useRef<HTMLInputElement>(null);
  const newPwRef = useRef<HTMLInputElement>(null);
  const confirmPwRef = useRef<HTMLInputElement>(null);

  const isFormValid =
    currentPwCheck?.type === 'success' &&
    newPwCheck?.type === 'success' &&
    confirmPwCheck?.type === 'success';

  /* ── 이미지 업로드 ── */
  const handleImageUpload = (file: File | undefined) => {
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error('jpg, jpeg, png 형식만 업로드 가능합니다');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('이미지는 5MB 이하만 업로드 가능합니다');
      return;
    }
    setImagePreview(URL.createObjectURL(file));
    setImageFile(file);
  };

  /* ── 비밀번호 검증 ── */
  const handleCurrentPwChange = (value: string) => {
    setCurrentPw(value);
    if (!value) {
      setCurrentPwCheck(null);
      return;
    }
    setCurrentPwCheck(
      value === MOCK_CURRENT_PASSWORD
        ? { type: 'success', text: '비밀번호가 일치합니다' }
        : { type: 'error', text: '비밀번호가 일치하지 않습니다' },
    );
  };

  const handleNewPwChange = (value: string) => {
    setNewPw(value);
    if (!value) {
      setNewPwCheck(null);
    } else if (!PASSWORD_RULE.test(value)) {
      setNewPwCheck({
        type: 'error',
        text: '비밀번호는 8자 이상, 16자 이하, 영문과 숫자, 특수문자(@$!%#?&)를 포함해야 합니다',
      });
    } else {
      setNewPwCheck({ type: 'success', text: '사용 가능한 비밀번호입니다' });
    }
    if (newPwConfirm) {
      setConfirmPwCheck(
        value === newPwConfirm
          ? { type: 'success', text: '사용 가능한 비밀번호입니다' }
          : { type: 'error', text: '비밀번호가 일치하지 않습니다' },
      );
    }
  };

  const handleConfirmPwChange = (value: string) => {
    setNewPwConfirm(value);
    if (!value) {
      setConfirmPwCheck(null);
      return;
    }
    setConfirmPwCheck(
      value === newPw
        ? { type: 'success', text: '사용 가능한 비밀번호입니다' }
        : { type: 'error', text: '비밀번호가 일치하지 않습니다' },
    );
  };

  /* ── 저장 ── */
  const handleSaveClick = () => {
    // 순차 검증 (위에서부터 빈 필드 또는 에러 상태 검사)
    if (!currentPw) {
      setCurrentPwCheck({ type: 'error', text: '현재 비밀번호를 입력하세요' });
      currentPwRef.current?.focus();
      return;
    }
    if (currentPwCheck?.type !== 'success') {
      currentPwRef.current?.focus();
      return;
    }
    if (!newPw) {
      setNewPwCheck({ type: 'error', text: '새 비밀번호를 입력하세요' });
      newPwRef.current?.focus();
      return;
    }
    if (newPwCheck?.type !== 'success') {
      newPwRef.current?.focus();
      return;
    }
    if (!newPwConfirm) {
      setConfirmPwCheck({ type: 'error', text: '새 비밀번호 확인을 입력하세요' });
      confirmPwRef.current?.focus();
      return;
    }
    if (confirmPwCheck?.type !== 'success') {
      confirmPwRef.current?.focus();
      return;
    }
    setIsConfirmOpen(true);
  };

  const handleConfirmedSubmit = async () => {
    setIsConfirmOpen(false);
    setIsSubmitting(true);
    // PATCH /api/users/me — 이미지 있으면 multipart, 없으면 JSON
    const res = await updateMyProfile({
      currentPassword: currentPw,
      newPassword: newPw,
      ...(imageFile ? { profileImage: imageFile } : {}),
    });
    setIsSubmitting(false);
    if (!res.success) {
      toast.error(res.message || '프로필 수정에 실패했습니다.');
      return;
    }
    toast.success(res.message || '프로필이 수정되었습니다.');
    onSaved?.();
    onClose();
  };

  /* ── 회원 탈퇴 (DELETE /api/members/me) ── */
  const handleWithdrawConfirm = async () => {
    const res = await withdrawAccount();
    if (!res.success) {
      // 409: 이미 탈퇴 / 404: 회원 없음 / 401: 인증 실패
      toast.error(res.message || '회원 탈퇴에 실패했습니다.');
      return;
    }
    authStore.clear();
    setIsWithdrawOpen(false);
    onClose();
    toast.success(res.message || '회원 탈퇴가 완료되었습니다.');
    router.push('/');
  };

  const isOverlayOpen = isSubmitting || isConfirmOpen || isWithdrawOpen;

  return (
    <>
    {!isOverlayOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-[672px] max-h-[90vh] overflow-y-auto bg-white rounded-2xl"
        style={{
          padding: '32px 32px 32px',
          boxShadow:
            '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 8px 10px -6px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* 헤더 */}
        <div className="relative mb-6 flex h-8 items-center justify-center">
          <h2 className="text-2xl font-bold leading-8 text-[#1F2937]">프로필 수정</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="absolute right-0 text-base font-medium text-[#4B5563] hover:text-[#1F2937]"
          >
            ✕
          </button>
        </div>

        {/* 프로필 이미지 */}
        <section className="mb-6">
          <h3 className="mb-4 text-lg font-semibold leading-7 text-[#1F2937]">프로필 이미지</h3>
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-[rgba(47,93,170,0.1)]">
              {imagePreview ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={imagePreview} alt="" className="h-full w-full object-cover" />
              ) : (
                <Image src="/icons/profileAvatarIcon.svg" alt="" width={64} height={64} />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="h-12 w-[135px] rounded-[10px] bg-[#2F5DAA] text-base font-semibold text-white hover:bg-[#1D3E75] transition-colors"
            >
              이미지 업로드
            </button>
            <p className="text-sm text-[#4B5563]">jpeg, jpg, png 형식 / 최대 5MB</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              hidden
              onChange={(e) => handleImageUpload(e.target.files?.[0])}
            />
          </div>
        </section>

        {/* 비밀번호 변경 */}
        <section className="mb-6">
          <h3 className="mb-4 text-lg font-semibold leading-7 text-[#1F2937]">비밀번호 변경</h3>
          <div className="flex flex-col gap-5">
            <PwField
              ref={currentPwRef}
              label="현재 비밀번호"
              placeholder="현재 비밀번호를 입력하세요"
              value={currentPw}
              onChange={handleCurrentPwChange}
              show={showCurrent}
              onToggleShow={() => setShowCurrent((v) => !v)}
              check={currentPwCheck}
            />
            <PwField
              ref={newPwRef}
              label="새 비밀번호"
              placeholder="새 비밀번호를 입력하세요"
              value={newPw}
              onChange={handleNewPwChange}
              show={showNew}
              onToggleShow={() => setShowNew((v) => !v)}
              check={newPwCheck}
            />
            <PwField
              ref={confirmPwRef}
              label="새 비밀번호 확인"
              placeholder="새 비밀번호를 다시 입력하세요"
              value={newPwConfirm}
              onChange={handleConfirmPwChange}
              show={showConfirm}
              onToggleShow={() => setShowConfirm((v) => !v)}
              check={confirmPwCheck}
            />
          </div>
        </section>

        {/* 계정 관리 (절취선) */}
        <div className="mb-6 border-t border-[#E5E7EB] pt-6">
          <button
            type="button"
            onClick={() => setIsWithdrawOpen(true)}
            className="h-12 w-full rounded-[10px] border border-[#DC2626] text-base font-semibold text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
          >
            회원 탈퇴
          </button>
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="h-12 flex-1 rounded-[10px] border border-[#E2E8F0] bg-white text-base font-semibold text-[#4B5563] hover:bg-[#F8FAFC] transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSaveClick}
            disabled={isSubmitting}
            className={`h-12 flex-1 rounded-[10px] text-base font-semibold transition-colors ${
              isFormValid && !isSubmitting
                ? 'bg-[#2F5DAA] text-white hover:bg-[#1D3E75]'
                : 'bg-[#2F5DAA]/50 text-[#9CA3AF]'
            }`}
          >
            {isSubmitting ? '변경 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
    )}

    {/* 회원 탈퇴 확인 모달 (메인 모달 대체) */}
    {isWithdrawOpen && !isSubmitting && (
      <WithdrawConfirmModal
        onCancel={() => setIsWithdrawOpen(false)}
        onConfirm={handleWithdrawConfirm}
      />
    )}

    {/* 비밀번호 변경 확인 모달 (메인 모달 대체) */}
    {isConfirmOpen && !isSubmitting && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div
          className="w-full max-w-[448px] bg-white rounded-2xl"
          style={{
            padding: '32px',
            boxShadow:
              '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 8px 10px -6px rgba(0, 0, 0, 0.1)',
          }}
        >
          <h2 className="text-center text-2xl font-bold leading-8 text-[#1F2937]">
            프로필 수정
          </h2>
          <p className="mt-3 text-center text-base leading-6 text-[#4B5563]">
            비밀번호를 변경하시겠습니까?
          </p>
          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={() => setIsConfirmOpen(false)}
              className="h-12 flex-1 rounded-[10px] border border-[#E2E8F0] bg-white text-base font-semibold text-[#4B5563] hover:bg-[#F8FAFC] transition-colors"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleConfirmedSubmit}
              className="h-12 flex-1 rounded-[10px] bg-[#2F5DAA] text-base font-semibold text-white hover:bg-[#1D3E75] transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      </div>
    )}

    {/* 변경 중 로딩 모달 (메인 모달 대체) */}
    {isSubmitting && (
      <LoadingModal title="변경 중입니다" description="잠시만 기다려주세요...." />
    )}
    </>
  );
}

/* ──────────────── 비밀번호 입력 + 검증 ──────────────── */
interface PwFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggleShow: () => void;
  check: PwCheck;
}

const PwField = forwardRef<HTMLInputElement, PwFieldProps>(function PwField(
  { label, placeholder, value, onChange, show, onToggleShow, check },
  ref,
) {
  const borderClass =
    check?.type === 'error' ? 'border-[#DC2626]' : 'border-[#E2E8F0] focus-within:border-[#2F5DAA]';

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#1F2937]">{label}</label>
      <div className={`flex h-12 items-center rounded-[10px] border pl-4 pr-12 transition-colors ${borderClass} relative`}>
        <input
          ref={ref}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent text-base outline-none placeholder:text-[rgba(26,31,46,0.5)]"
        />
        <button
          type="button"
          onClick={onToggleShow}
          aria-label="비밀번호 표시 토글"
          className="absolute right-4 top-1/2 -translate-y-1/2"
        >
          <Image src={show ? '/icons/openEye.svg' : '/icons/closeEye.svg'} alt="" width={20} height={20} />
        </button>
      </div>
      {check && (
        <p className={`mt-2 flex items-center gap-1 text-sm ${check.type === 'success' ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
          <Image
            src={check.type === 'success' ? '/icons/check.svg' : '/icons/error.svg'}
            alt=""
            width={16}
            height={16}
          />
          {check.text}
        </p>
      )}
    </div>
  );
});
