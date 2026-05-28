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

type Step = 'verify' | 'select' | 'image' | 'password' | 'withdraw';
type PwCheck = { type: 'success' | 'error'; text: string } | null;

const MIN_LOADING_MS = 600;
const ensureMinimumDelay = async (start: number) => {
  const elapsed = Date.now() - start;
  if (elapsed < MIN_LOADING_MS) {
    await new Promise((resolve) => setTimeout(resolve, MIN_LOADING_MS - elapsed));
  }
};

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%#?&]).{8,16}$/;
const WITHDRAW_CONFIRM_TEXT = '회원탈퇴';

const WITHDRAW_INFO_ITEMS = [
  '계정 정보 (이메일, 비밀번호, 프로필)',
  '수강 기록 및 학습 진도',
  '작성한 게시글 및 댓글',
  '퀴즈 응시 기록 및 랭킹 정보',
  '결제 내역 및 구독 정보',
];

export default function ProfileEditModal({ initialImageUrl, onClose, onSaved }: ProfileEditModalProps) {
  const router = useRouter();

  const [step, setStep] = useState<Step>('verify');

  /* 본인 확인 */
  const [currentPw, setCurrentPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [currentPwCheck, setCurrentPwCheck] = useState<PwCheck>(null);
  const [verifiedPassword, setVerifiedPassword] = useState('');
  const currentPwRef = useRef<HTMLInputElement>(null);

  /* 이미지 */
  const [imagePreview, setImagePreview] = useState(initialImageUrl ?? '');
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* 비밀번호 변경 */
  const [newPw, setNewPw] = useState('');
  const [newPwConfirm, setNewPwConfirm] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [newPwCheck, setNewPwCheck] = useState<PwCheck>(null);
  const [confirmPwCheck, setConfirmPwCheck] = useState<PwCheck>(null);
  const newPwRef = useRef<HTMLInputElement>(null);
  const confirmPwRef = useRef<HTMLInputElement>(null);

  /* 탈퇴 */
  const [withdrawText, setWithdrawText] = useState('');
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  /* 진행 상태 */
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  /* ── 본인 확인 ──
   * 백엔드에 별도 verify API가 없으므로 Step 1에서는 형식 검증만 진행하고,
   * 실제 비밀번호 일치 여부는 PATCH /api/users/me 응답(409)으로 확인. */
  const handleCurrentPwChange = (value: string) => {
    setCurrentPw(value);
    if (currentPwCheck) setCurrentPwCheck(null);
  };

  const handleVerify = () => {
    if (!currentPw) {
      setCurrentPwCheck({ type: 'error', text: '현재 비밀번호를 입력하세요' });
      currentPwRef.current?.focus();
      return;
    }
    setVerifiedPassword(currentPw);
    setStep('select');
  };

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
    setImageError(null);
  };

  const handleSaveImageClick = () => {
    if (!imageFile) {
      setImageError('이미지를 업로드해주세요');
      return;
    }
    setIsConfirmOpen(true);
  };

  /* ── 비밀번호 변경 ── */
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
          ? { type: 'success', text: '비밀번호가 일치합니다' }
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
        ? { type: 'success', text: '비밀번호가 일치합니다' }
        : { type: 'error', text: '비밀번호가 일치하지 않습니다' },
    );
  };

  const isPasswordValid =
    newPwCheck?.type === 'success' && confirmPwCheck?.type === 'success';

  const handleSavePasswordClick = () => {
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
    const start = Date.now();
    const payload =
      step === 'image'
        ? { currentPassword: verifiedPassword, profileImage: imageFile }
        : { currentPassword: verifiedPassword, newPassword: newPw };
    const res = await updateMyProfile(payload);
    await ensureMinimumDelay(start);
    setIsSubmitting(false);
    if (!res.success) {
      // 409: 현재 비밀번호 불일치 — Step 1로 복귀해서 다시 입력받기
      if (res.httpStatus === 409) {
        setStep('verify');
        setCurrentPw('');
        setVerifiedPassword('');
        setCurrentPwCheck({ type: 'error', text: '비밀번호가 일치하지 않습니다' });
        return;
      }
      toast.error(res.message || '프로필 수정에 실패했습니다.');
      return;
    }
    toast.success(res.message || '프로필이 수정되었습니다.');
    onSaved?.();
    onClose();
  };

  /* ── 회원 탈퇴 ── */
  const isWithdrawTextMatched = withdrawText === WITHDRAW_CONFIRM_TEXT;

  const handleWithdrawClick = () => {
    if (!withdrawText) {
      setWithdrawError('"회원탈퇴"를 입력해주세요');
      return;
    }
    if (!isWithdrawTextMatched) {
      setWithdrawError('"회원탈퇴"와 일치하지 않습니다');
      return;
    }
    setIsWithdrawOpen(true);
  };

  const handleWithdrawTextChange = (value: string) => {
    setWithdrawText(value);
    if (withdrawError) setWithdrawError(null);
  };

  const handleWithdrawConfirm = async () => {
    setIsWithdrawOpen(false);
    const res = await withdrawAccount();
    if (!res.success) {
      toast.error(res.message || '회원 탈퇴에 실패했습니다.');
      return;
    }
    authStore.clear();
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
            className="w-full max-w-[672px] max-h-[90vh] overflow-y-auto bg-white rounded-2xl p-8"
            style={{
              boxShadow:
                '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 8px 10px -6px rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* 헤더 */}
            <div className="flex h-8 items-center justify-between">
              <h2 className="text-2xl font-bold leading-8 text-[#1F2937]">프로필 수정</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="닫기"
                className="text-base font-medium text-[#4B5563] hover:text-[#1F2937]"
              >
                ✕
              </button>
            </div>

            <div className="mt-6">
              {step === 'verify' && (
                <VerifyStep
                  inputRef={currentPwRef}
                  value={currentPw}
                  onChange={handleCurrentPwChange}
                  show={showCurrent}
                  onToggleShow={() => setShowCurrent((v) => !v)}
                  check={currentPwCheck}
                  onCancel={onClose}
                  onConfirm={handleVerify}
                />
              )}

              {step === 'select' && (
                <SelectStep
                  onSelectImage={() => setStep('image')}
                  onSelectPassword={() => setStep('password')}
                  onSelectWithdraw={() => setStep('withdraw')}
                  onBack={() => setStep('verify')}
                />
              )}

              {step === 'image' && (
                <ImageStep
                  imagePreview={imagePreview}
                  onUploadClick={() => fileInputRef.current?.click()}
                  fileInputRef={fileInputRef}
                  onFileChange={(file) => handleImageUpload(file)}
                  canSave={!!imageFile}
                  error={imageError}
                  onBack={() => setStep('select')}
                  onSave={handleSaveImageClick}
                />
              )}

              {step === 'password' && (
                <PasswordStep
                  newPwRef={newPwRef}
                  confirmPwRef={confirmPwRef}
                  newPw={newPw}
                  newPwConfirm={newPwConfirm}
                  showNew={showNew}
                  showConfirm={showConfirm}
                  newPwCheck={newPwCheck}
                  confirmPwCheck={confirmPwCheck}
                  onNewPwChange={handleNewPwChange}
                  onConfirmPwChange={handleConfirmPwChange}
                  onToggleNew={() => setShowNew((v) => !v)}
                  onToggleConfirm={() => setShowConfirm((v) => !v)}
                  canSave={isPasswordValid}
                  onBack={() => setStep('select')}
                  onSave={handleSavePasswordClick}
                />
              )}

              {step === 'withdraw' && (
                <WithdrawStep
                  value={withdrawText}
                  onChange={handleWithdrawTextChange}
                  canWithdraw={isWithdrawTextMatched}
                  error={withdrawError}
                  onBack={() => setStep('select')}
                  onWithdraw={handleWithdrawClick}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* 회원 탈퇴 확인 모달 */}
      {isWithdrawOpen && !isSubmitting && (
        <WithdrawConfirmModal
          onCancel={() => setIsWithdrawOpen(false)}
          onConfirm={handleWithdrawConfirm}
        />
      )}

      {/* 비밀번호 변경 확인 모달 */}
      {isConfirmOpen && !isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            className="w-full max-w-[448px] bg-white rounded-2xl p-8"
            style={{
              boxShadow:
                '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 8px 10px -6px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h2 className="text-center text-2xl font-bold leading-8 text-[#1F2937]">
              프로필 수정
            </h2>
            <p className="mt-3 text-center text-base leading-6 text-[#4B5563]">
              수정하시겠습니까?
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

      {isSubmitting && (
        <LoadingModal title="변경 중입니다" description="잠시만 기다려주세요...." />
      )}
    </>
  );
}

/* ──────────────── Step 1: 본인 확인 ──────────────── */
interface VerifyStepProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggleShow: () => void;
  check: PwCheck;
  onCancel: () => void;
  onConfirm: () => void;
}

function VerifyStep({ inputRef, value, onChange, show, onToggleShow, check, onCancel, onConfirm }: VerifyStepProps) {
  const canConfirm = value.length > 0;
  return (
    <>
      <div className="flex flex-col items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(47,93,170,0.1)]">
          <LockIcon className="h-8 w-8 text-[#2F5DAA]" />
        </div>
        <h3 className="mt-4 text-xl font-semibold leading-7 text-[#1F2937]">본인 확인</h3>
        <p className="mt-2 text-base leading-6 text-[#4B5563]">
          프로필 수정을 위해 현재 비밀번호를 입력해주세요
        </p>
      </div>

      <div className="mt-8">
        <PwField
          ref={inputRef}
          label="현재 비밀번호"
          placeholder="현재 비밀번호를 입력하세요"
          value={value}
          onChange={onChange}
          show={show}
          onToggleShow={onToggleShow}
          check={check}
        />
      </div>

      <div className="mt-6 flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="h-12 flex-1 rounded-[10px] border border-[#E2E8F0] bg-white text-base font-semibold text-[#4B5563] hover:bg-[#F8FAFC] transition-colors"
        >
          취소
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={`h-12 flex-1 rounded-[10px] text-base font-semibold transition-colors ${
            canConfirm
              ? 'bg-[#2F5DAA] text-white hover:bg-[#1D3E75]'
              : 'bg-[#E2E8F0] text-[#9CA3AF]'
          }`}
        >
          확인
        </button>
      </div>
    </>
  );
}

/* ──────────────── Step 2: 카테고리 선택 ──────────────── */
interface SelectStepProps {
  onSelectImage: () => void;
  onSelectPassword: () => void;
  onSelectWithdraw: () => void;
  onBack: () => void;
}

function SelectStep({ onSelectImage, onSelectPassword, onSelectWithdraw, onBack }: SelectStepProps) {
  return (
    <>
      <div className="flex flex-col items-center">
        <h3 className="text-xl font-semibold leading-7 text-[#1F2937]">수정할 항목 선택</h3>
        <p className="mt-2 text-base leading-6 text-[#4B5563]">변경하실 항목을 선택해주세요</p>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4">
        <SelectCard
          onClick={onSelectImage}
          title="프로필 이미지"
          subtitle="이미지 변경"
          tone="primary"
          icon={<UserIcon className="h-7 w-7 text-[#2F5DAA]" />}
        />
        <SelectCard
          onClick={onSelectPassword}
          title="비밀번호"
          subtitle="비밀번호 변경"
          tone="primary"
          icon={<LockIcon className="h-7 w-7 text-[#2F5DAA]" />}
        />
        <SelectCard
          onClick={onSelectWithdraw}
          title="회원 탈퇴"
          subtitle="계정 삭제"
          tone="danger"
          icon={<UserXIcon className="h-7 w-7 text-[#B91C1C]" />}
        />
      </div>

      <div className="mt-6 flex justify-center pt-4">
        <button
          type="button"
          onClick={onBack}
          className="h-12 rounded-[10px] border border-[#E2E8F0] bg-white px-6 text-base font-semibold text-[#4B5563] hover:bg-[#F8FAFC] transition-colors"
        >
          뒤로가기
        </button>
      </div>
    </>
  );
}

interface SelectCardProps {
  onClick: () => void;
  title: string;
  subtitle: string;
  tone: 'primary' | 'danger';
  icon: React.ReactNode;
}

function SelectCard({ onClick, title, subtitle, tone, icon }: SelectCardProps) {
  const iconBg = tone === 'primary' ? 'bg-[rgba(47,93,170,0.1)]' : 'bg-[rgba(185,28,28,0.1)]';
  const hoverBorder = tone === 'primary' ? 'hover:border-[#2F5DAA]' : 'hover:border-[#B91C1C]';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center p-6 border-2 border-[#E2E8F0] rounded-2xl transition-colors ${hoverBorder}`}
    >
      <div className={`flex h-14 w-14 items-center justify-center rounded-full ${iconBg}`}>
        {icon}
      </div>
      <div className="mt-3 text-center text-base font-semibold leading-6 text-[#1F2937]">
        {title}
      </div>
      <div className="mt-1 text-center text-xs leading-4 text-[#4B5563]">{subtitle}</div>
    </button>
  );
}

/* ──────────────── Step 3a: 이미지 변경 ──────────────── */
interface ImageStepProps {
  imagePreview: string;
  onUploadClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (file: File | undefined) => void;
  canSave: boolean;
  error: string | null;
  onBack: () => void;
  onSave: () => void;
}

function ImageStep({ imagePreview, onUploadClick, fileInputRef, onFileChange, canSave, error, onBack, onSave }: ImageStepProps) {
  return (
    <>
      <h3 className="text-lg font-semibold leading-7 text-[#1F2937]">프로필 이미지 변경</h3>

      <div className="mt-4 flex flex-col items-center">
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
          onClick={onUploadClick}
          className="mt-4 h-12 rounded-[10px] bg-[#2F5DAA] px-6 text-base font-semibold text-white hover:bg-[#1D3E75] transition-colors"
        >
          이미지 업로드
        </button>
        <p className="mt-2 text-sm leading-5 text-[#4B5563]">jpeg, jpg, png 형식 / 최대 5MB</p>
        <div className="mt-2 h-5">
          {error && (
            <p className="flex items-center gap-1 text-sm text-[#DC2626]">
              <Image src="/icons/error.svg" alt="" width={16} height={16} />
              {error}
            </p>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          hidden
          onChange={(e) => onFileChange(e.target.files?.[0])}
        />
      </div>

      <div className="mt-6 flex gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="h-12 flex-1 rounded-[10px] border border-[#E2E8F0] bg-white text-base font-semibold text-[#4B5563] hover:bg-[#F8FAFC] transition-colors"
        >
          뒤로가기
        </button>
        <button
          type="button"
          onClick={onSave}
          className={`h-12 flex-1 rounded-[10px] text-base font-semibold transition-colors ${
            canSave
              ? 'bg-[#2F5DAA] text-white hover:bg-[#1D3E75]'
              : 'bg-[#E2E8F0] text-[#9CA3AF]'
          }`}
        >
          저장
        </button>
      </div>
    </>
  );
}

/* ──────────────── Step 3b: 비밀번호 변경 ──────────────── */
interface PasswordStepProps {
  newPwRef: React.RefObject<HTMLInputElement | null>;
  confirmPwRef: React.RefObject<HTMLInputElement | null>;
  newPw: string;
  newPwConfirm: string;
  showNew: boolean;
  showConfirm: boolean;
  newPwCheck: PwCheck;
  confirmPwCheck: PwCheck;
  onNewPwChange: (v: string) => void;
  onConfirmPwChange: (v: string) => void;
  onToggleNew: () => void;
  onToggleConfirm: () => void;
  canSave: boolean;
  onBack: () => void;
  onSave: () => void;
}

function PasswordStep({
  newPwRef,
  confirmPwRef,
  newPw,
  newPwConfirm,
  showNew,
  showConfirm,
  newPwCheck,
  confirmPwCheck,
  onNewPwChange,
  onConfirmPwChange,
  onToggleNew,
  onToggleConfirm,
  canSave,
  onBack,
  onSave,
}: PasswordStepProps) {
  return (
    <>
      <h3 className="text-lg font-semibold leading-7 text-[#1F2937]">비밀번호 변경</h3>

      <div className="mt-4 flex flex-col gap-5">
        <PwField
          ref={newPwRef}
          label="새 비밀번호"
          placeholder="새 비밀번호를 입력하세요"
          value={newPw}
          onChange={onNewPwChange}
          show={showNew}
          onToggleShow={onToggleNew}
          check={newPwCheck}
        />
        <PwField
          ref={confirmPwRef}
          label="새 비밀번호 확인"
          placeholder="새 비밀번호를 다시 입력하세요"
          value={newPwConfirm}
          onChange={onConfirmPwChange}
          show={showConfirm}
          onToggleShow={onToggleConfirm}
          check={confirmPwCheck}
        />
      </div>

      <div className="mt-6 flex gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="h-12 flex-1 rounded-[10px] border border-[#E2E8F0] bg-white text-base font-semibold text-[#4B5563] hover:bg-[#F8FAFC] transition-colors"
        >
          뒤로가기
        </button>
        <button
          type="button"
          onClick={onSave}
          className={`h-12 flex-1 rounded-[10px] text-base font-semibold transition-colors ${
            canSave
              ? 'bg-[#2F5DAA] text-white hover:bg-[#1D3E75]'
              : 'bg-[#E2E8F0] text-[#9CA3AF]'
          }`}
        >
          저장
        </button>
      </div>
    </>
  );
}

/* ──────────────── Step 3c: 회원 탈퇴 ──────────────── */
interface WithdrawStepProps {
  value: string;
  onChange: (v: string) => void;
  canWithdraw: boolean;
  error: string | null;
  onBack: () => void;
  onWithdraw: () => void;
}

function WithdrawStep({ value, onChange, canWithdraw, error, onBack, onWithdraw }: WithdrawStepProps) {
  return (
    <>
      <div className="flex flex-col items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(185,28,28,0.1)]">
          <UserXIcon className="h-8 w-8 text-[#B91C1C]" />
        </div>
        <h3 className="mt-4 text-xl font-semibold leading-7 text-[#1F2937]">회원 탈퇴</h3>
        <p className="mt-2 text-base leading-6 text-[#4B5563]">정말 회원 탈퇴하시겠습니까?</p>
        <p className="mt-1 text-sm leading-5 text-[#B91C1C]">
          탈퇴 후 계정 정보와 학습 기록 복구가 어려울 수 있습니다.
        </p>
      </div>

      <div
        className="mt-8 rounded-[20px] border p-6"
        style={{ background: '#FEF2F2', borderColor: 'rgba(185, 28, 28, 0.2)' }}
      >
        <h4 className="text-base font-semibold leading-6 text-[#1F2937]">탈퇴 시 삭제되는 정보</h4>
        <ul className="mt-3 flex flex-col gap-2">
          {WITHDRAW_INFO_ITEMS.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm leading-5 text-[#4B5563]">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#B91C1C]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-[#1F2937]">
          탈퇴를 원하시면 <span className="font-bold">&ldquo;회원탈퇴&rdquo;</span>를 입력해주세요
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="회원탈퇴"
          className={`mt-2 h-12 w-full rounded-[10px] border px-4 text-base outline-none placeholder:text-[rgba(26,31,46,0.5)] ${
            error ? 'border-[#DC2626]' : 'border-[#E2E8F0] focus:border-[#B91C1C]'
          }`}
        />
        {error && (
          <p className="mt-2 flex items-center gap-1 text-sm text-[#DC2626]">
            <Image src="/icons/error.svg" alt="" width={16} height={16} />
            {error}
          </p>
        )}
      </div>

      <div className="mt-6 flex gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="h-12 flex-1 rounded-[10px] border border-[#E2E8F0] bg-white text-base font-semibold text-[#4B5563] hover:bg-[#F8FAFC] transition-colors"
        >
          뒤로가기
        </button>
        <button
          type="button"
          onClick={onWithdraw}
          className={`h-12 flex-1 rounded-[10px] text-base font-semibold transition-colors ${
            canWithdraw
              ? 'bg-[#B91C1C] text-white hover:bg-[#991B1B]'
              : 'bg-[#E2E8F0] text-[#9CA3AF]'
          }`}
        >
          탈퇴하기
        </button>
      </div>
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
    check?.type === 'error'
      ? 'border-[#DC2626]'
      : 'border-[#E2E8F0] focus-within:border-[#2F5DAA]';

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#1F2937]">{label}</label>
      <div
        className={`flex h-12 items-center rounded-[10px] border pl-4 pr-12 transition-colors ${borderClass} relative`}
      >
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
          <Image
            src={show ? '/icons/openEye.svg' : '/icons/closeEye.svg'}
            alt=""
            width={20}
            height={20}
          />
        </button>
      </div>
      {check && (
        <p
          className={`mt-2 flex items-center gap-1 text-sm ${
            check.type === 'success' ? 'text-[#16A34A]' : 'text-[#DC2626]'
          }`}
        >
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

/* ──────────────── Icons (inline SVG) ──────────────── */
function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function UserXIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="17" y1="8" x2="22" y2="13" />
      <line x1="22" y1="8" x2="17" y2="13" />
    </svg>
  );
}
