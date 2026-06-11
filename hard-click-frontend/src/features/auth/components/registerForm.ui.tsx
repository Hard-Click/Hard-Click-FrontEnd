'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode, RefObject } from 'react';
import {
  getInputBorderClass,
  iconPath,
  type FieldStatus,
  type StatusType,
} from './registerForm.shared';

export function BrandLogo() {
  return (
    <section className="absolute left-[50px] top-[38px]">
      <div className="flex h-[48px] items-center gap-[12px]">
        <div className="flex h-[48px] w-[48px] items-center justify-center rounded-[20px] bg-[#2F5DAA]">
          <Image
            src="/logos/logo.svg"
            alt=""
            width={28}
            height={28}
            priority
            className="h-[28px] w-[28px]"
          />
        </div>

        <Image
          src="/logos/logoblack.svg"
          alt="FLOWN"
          width={112}
          height={36}
          priority
          className="h-[36px] w-[112px]"
        />
      </div>

      <p className="mt-[25px] w-[238px] text-center text-[16px] leading-[24px] tracking-[-0.31px] text-[#4B5563]">
        학습 흐름을 관리하는 가장 쉬운 방법
      </p>
    </section>
  );
}

export function CompleteStepBrandLogo() {
  return (
    <section className="absolute left-1/2 top-[88px] h-[48px] w-[166.06px] -translate-x-1/2">
      <div className="flex h-[48px] items-center gap-[12px]">
        <div className="flex h-[48px] w-[48px] items-center justify-center rounded-[20px] bg-[#2F5DAA]">
          <Image
            src="/logos/logo.svg"
            alt=""
            width={28}
            height={28}
            priority
            className="h-[28px] w-[28px]"
          />
        </div>

        <Image
          src="/logos/logoblack.svg"
          alt="FLOWN"
          width={112}
          height={36}
          priority
          className="h-[36px] w-[112px]"
        />
      </div>

      <p className="absolute left-1/2 top-[74px] w-[238px] -translate-x-1/2 text-center text-[16px] leading-[24px] tracking-[-0.31px] text-[#4B5563]">
        학습 흐름을 관리하는 가장 쉬운 방법
      </p>
    </section>
  );
}

export function SectionTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="h-[52px] w-[590px]">
      <h2 className="text-[18px] font-semibold leading-[28px] tracking-[-0.44px] text-[#1F2937]">
        {title}
      </h2>
      <p className="mt-[4px] text-[14px] leading-[20px] tracking-[-0.15px] text-[#4B5563]">
        {description}
      </p>
    </div>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <span className="block text-[14px] font-medium leading-[20px] tracking-[-0.15px] text-[#1F2937]">
      {children}
    </span>
  );
}

export function IconInput({
  inputRef,
  icon,
  value,
  onChange,
  placeholder,
  width,
  noTopMargin = false,
  status,
}: {
  inputRef?: RefObject<HTMLInputElement | null>;
  icon: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  width: string;
  noTopMargin?: boolean;
  status?: FieldStatus | null;
}) {
  return (
    <div
      className={`relative ${noTopMargin ? '' : 'mt-[8px]'}`}
      style={{ width }}
    >
      <Image
        src={icon}
        alt=""
        width={20}
        height={20}
        className="absolute left-[16px] top-[14px]"
      />
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`h-[48px] w-full rounded-[10px] border bg-white pl-[48px] pr-[16px] text-[16px] leading-[19px] tracking-[-0.31px] text-[#1F2937] outline-none placeholder:text-[#9CA3AF] focus:outline-none focus:ring-0 ${getInputBorderClass(
          status,
        )}`}
      />
    </div>
  );
}

export function PasswordInput({
  inputRef,
  value,
  onChange,
  placeholder,
  show,
  onToggle,
  status,
}: {
  inputRef?: RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  show: boolean;
  onToggle: () => void;
  status?: FieldStatus | null;
}) {
  const displayValue = show ? value : '*'.repeat(value.length);

  const handleChange = (nextDisplayValue: string) => {
    if (show) {
      onChange(nextDisplayValue);
      return;
    }

    if (nextDisplayValue.length < value.length) {
      onChange(value.slice(0, nextDisplayValue.length));
      return;
    }

    const addedText = nextDisplayValue.slice(value.length);
    onChange(value + addedText);
  };

  return (
    <div className="relative mt-[8px] h-[48px]">
      <Image
        src={iconPath.password}
        alt=""
        width={20}
        height={20}
        className="absolute left-[16px] top-[14px]"
      />

      <input
        ref={inputRef}
        type="text"
        value={displayValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className={`h-[48px] w-full rounded-[10px] border bg-white pl-[48px] pr-[48px] pt-[3px] text-[16px] leading-[48px] tracking-[-0.31px] text-[#1F2937] outline-none placeholder:leading-[19px] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-0 ${getInputBorderClass(
          status,
        )}`}
      />

      <button
        type="button"
        onClick={onToggle}
        className="absolute right-[16px] top-[14px] outline-none focus:outline-none focus:ring-0"
      >
        <Image
          src={show ? iconPath.closeEye : iconPath.openEye}
          alt=""
          width={20}
          height={20}
        />
      </button>
    </div>
  );
}

export function SmallButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-[48px] w-[91.43px] rounded-[10px] bg-[#E5E7EB]/50 text-[16px] font-medium leading-[24px] tracking-[-0.31px] text-[#1F2937] outline-none focus:outline-none focus:ring-0"
    >
      {children}
    </button>
  );
}

export function HelpText({ text }: { text: string }) {
  return (
    <p className="mt-[4px] text-[12px] leading-[16px] text-[#4B5563]">{text}</p>
  );
}

export function StatusText({
  type,
  text,
  className = '',
}: {
  type: StatusType;
  text: string;
  className?: string;
}) {
  const statusStyle = {
    success: {
      icon: iconPath.check,
      color: 'text-[#16A34A]',
      bgColor: 'bg-[#16A34A]',
    },
    warning: {
      icon: iconPath.warning,
      color: 'text-[#F59E0B]',
      bgColor: 'bg-[#F59E0B]',
    },
    error: {
      icon: iconPath.error,
      color: 'text-[#B91C1C]',
      bgColor: 'bg-[#B91C1C]',
    },
  }[type];

  return (
    <p
      className={`flex h-[20px] items-center gap-[6px] text-[14px] leading-[20px] tracking-[-0.15px] ${statusStyle.color} ${className}`}
    >
      <span
        className={`block h-[16px] w-[16px] shrink-0 ${statusStyle.bgColor}`}
        style={{
          WebkitMaskImage: `url(${statusStyle.icon})`,
          maskImage: `url(${statusStyle.icon})`,
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
        }}
      />
      <span className="block leading-[20px]">{text}</span>
    </p>
  );
}

export function CustomCheckbox({
  checked,
  onChange,
  size = 'small',
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: 'small' | 'large';
}) {
  const boxSize = size === 'large' ? 'h-[20px] w-[20px]' : 'h-[16px] w-[16px]';
  const markSize = size === 'large' ? 'text-[14px]' : 'text-[12px]';

  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex ${boxSize} shrink-0 items-center justify-center rounded-[4px] border outline-none focus:outline-none focus:ring-0 ${
        checked ? 'border-[#2F4156] bg-[#2F4156]' : 'border-[#1F2937] bg-white'
      }`}
    >
      {checked && (
        <span className={`${markSize} font-bold leading-none text-white`}>
          ✓
        </span>
      )}
    </button>
  );
}

export function AgreementRow({
  label,
  required,
  checked,
  onChange,
  onClickView,
}: {
  label: string;
  required?: boolean;
  checked: boolean;
  onChange: (checked: boolean) => void;
  onClickView: () => void;
}) {
  return (
    <div className="flex h-[20px] w-[540px] items-center justify-between">
      <label className="flex cursor-pointer items-center gap-[12px]">
        <CustomCheckbox checked={checked} onChange={onChange} />

        <span
          className={`text-[14px] font-medium leading-[20px] tracking-[-0.15px] ${
            required ? 'text-[#B91C1C]' : 'text-[#4B5563]'
          }`}
        >
          {required ? '[필수]' : '[선택]'}
          {label}
        </span>
      </label>

      <button
        type="button"
        onClick={onClickView}
        className="text-[14px] font-medium leading-[20px] tracking-[-0.15px] text-[#4B5563] underline outline-none focus:outline-none"
      >
        보기
      </button>
    </div>
  );
}

export function FooterLogin() {
  return (
    <div className="absolute left-[40.64px] top-[866.53px] h-[44.63px] w-[590.72px] border-t border-[#E2E8F0] pt-[24.64px] text-center text-[14px] leading-[20px] tracking-[-0.15px] text-[#4B5563]">
      이미 계정이 있으신가요?{' '}
      <Link href="/auth/login" className="font-semibold text-[#2F5DAA]">
        로그인
      </Link>
    </div>
  );
}

export function CompleteStep() {
  return (
    <>
      <CompleteStepBrandLogo />

      <section className="absolute left-1/2 top-[calc(50%-246px)] h-[514px] w-[773px] -translate-x-1/2 rounded-[16px] border border-[#E2E8F0] bg-white text-center shadow-[0_4px_10px_rgba(0,0,0,0.06)]">
        <div className="absolute left-[331px] top-[96px] flex h-[80px] w-[98px] items-center justify-center rounded-full bg-[#16A34A]/10">
          <Image src={iconPath.check} alt="" width={48} height={48} />
        </div>

        <h2 className="absolute left-0 top-[241px] w-full text-center text-[24px] font-bold leading-[32px] tracking-[0.07px] text-[#1F2937]">
          회원가입이 완료되었습니다
        </h2>

        <Link
          href="/auth/login"
          className="absolute bottom-[105px] left-1/2 flex h-[48px] w-[590px] -translate-x-1/2 items-center justify-center rounded-[10px] bg-[#2F5DAA] text-[16px] font-semibold leading-[48px] tracking-[-0.31px] text-white"
        >
          로그인 페이지로 이동
        </Link>
      </section>
    </>
  );
}
