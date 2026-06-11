'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

import { getInputBorderClass, iconPath, type FieldStatus } from './registerForm.shared';

export default function DatePickerInput({
  inputRef,
  value,
  onChange,
  status,
}: {
  inputRef?: RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (value: string) => void;
  status?: FieldStatus | null;
}) {
  const today = new Date();
  const parsedValue = value ? new Date(value) : today;

  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(
    Number.isNaN(parsedValue.getTime())
      ? today.getFullYear()
      : parsedValue.getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState(
    Number.isNaN(parsedValue.getTime())
      ? today.getMonth() + 1
      : parsedValue.getMonth() + 1,
  );
  // 입력 중 화면에 표시되는 문자열 (controlled input용, 빈 문자열 허용)
  const [yearInput, setYearInput] = useState(String(viewYear));
  const [monthInput, setMonthInput] = useState(String(viewMonth));

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!value) return;

    const nextDate = new Date(value);

    if (Number.isNaN(nextDate.getTime())) return;

    setViewYear(nextDate.getFullYear());
    setViewMonth(nextDate.getMonth() + 1);
  }, [value]);

  // viewYear/viewMonth 변경 시 input 문자열도 동기화 (prev/next 버튼 등 외부 변경 대응)
  useEffect(() => {
    setYearInput(String(viewYear));
  }, [viewYear]);

  useEffect(() => {
    setMonthInput(String(viewMonth));
  }, [viewMonth]);

  useEffect(() => {
    // click 이벤트로 처리 (mousedown → click 변경: input click과 순서 충돌 방지)
    // isOpen이 false면 외부 클릭 체크 자체 불필요 → 다시 열기 트리거가 막히는 버그 방지
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(
      2,
      '0',
    )}`;
  };

  const isFutureDay = (year: number, month: number, day: number) => {
    const selected = new Date(year, month - 1, day);
    selected.setHours(0, 0, 0, 0);

    const current = new Date();
    current.setHours(0, 0, 0, 0);

    return selected > current;
  };

  const selectedDateParts = value.split('-');
  const selectedYear = Number(selectedDateParts[0]);
  const selectedMonth = Number(selectedDateParts[1]);
  const selectedDay = Number(selectedDateParts[2]);

  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);

  const calendarCells = [
    ...Array.from({ length: firstDay }, (_, index) => ({
      type: 'empty' as const,
      key: `empty-${index}`,
    })),
    ...Array.from({ length: daysInMonth }, (_, index) => ({
      type: 'day' as const,
      key: `day-${index + 1}`,
      day: index + 1,
    })),
  ];

  const moveMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (viewMonth === 1) {
        setViewYear((prev) => prev - 1);
        setViewMonth(12);
        return;
      }

      setViewMonth((prev) => prev - 1);
      return;
    }

    if (viewMonth === 12) {
      setViewYear((prev) => prev + 1);
      setViewMonth(1);
      return;
    }

    setViewMonth((prev) => prev + 1);
  };

  const handleYearChange = (nextValue: string) => {
    const onlyNumber = nextValue.replace(/\D/g, '').slice(0, 4);
    setYearInput(onlyNumber);

    // 유효한 숫자일 때만 calendar 상태 업데이트
    if (onlyNumber) {
      setViewYear(Number(onlyNumber));
    }
  };

  const handleMonthChange = (nextValue: string) => {
    const onlyNumber = nextValue.replace(/\D/g, '').slice(0, 2);
    setMonthInput(onlyNumber);

    if (!onlyNumber) return;

    const nextMonth = Number(onlyNumber);

    // 13 이상은 12로 클램프
    if (nextMonth > 12) {
      setMonthInput('12');
      setViewMonth(12);
      return;
    }

    // 1~12면 그대로 반영 (0은 input엔 표시되지만 calendar는 업데이트 안 함)
    if (nextMonth >= 1) {
      setViewMonth(nextMonth);
    }
  };

  // blur 시 빈 값이거나 0이면 viewMonth/viewYear 값으로 복구
  const handleYearBlur = () => {
    if (!yearInput || Number(yearInput) < 1) {
      setYearInput(String(viewYear));
    }
  };

  const handleMonthBlur = () => {
    if (!monthInput || Number(monthInput) < 1) {
      setMonthInput(String(viewMonth));
    }
  };

  // 포커스 시 input 전체 선택 → 클릭만 해도 새 숫자 타이핑으로 교체됨
  const handleNumberInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <div ref={wrapperRef} className="relative mt-[8px] h-[48px] w-[590px]">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="absolute left-[16px] top-[14px] z-20 h-[20px] w-[20px] outline-none focus:outline-none"
      >
        <Image src={iconPath.calendar} alt="" width={20} height={20} />
      </button>

      <input
        ref={inputRef}
        value={value}
        readOnly
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        placeholder="YYYY-MM-DD"
        className={`h-[48px] w-full cursor-pointer rounded-[10px] border bg-white pl-[48px] pr-[16px] text-[16px] leading-[19px] tracking-[-0.31px] text-[#1F2937] outline-none placeholder:text-[#9CA3AF] focus:outline-none focus:ring-0 ${getInputBorderClass(
          status,
        )}`}
      />

      {isOpen && (
        <div className="absolute left-0 top-[56px] z-40 w-[360px] rounded-[16px] border border-[#E2E8F0] bg-white p-[16px] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]">
          <div className="mb-[14px] flex items-center justify-between">
            <button
              type="button"
              onClick={() => moveMonth('prev')}
              className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#F1F5F9] text-[18px] font-semibold text-[#4B5563] outline-none focus:outline-none"
            >
              ‹
            </button>

            <div className="flex items-center gap-[8px]">
              <div className="flex h-[36px] w-[90px] items-center rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] px-[10px]">
                <input
                  value={yearInput}
                  onChange={(e) => handleYearChange(e.target.value)}
                  onFocus={handleNumberInputFocus}
                  onBlur={handleYearBlur}
                  inputMode="numeric"
                  className="h-full w-full bg-transparent text-center text-[15px] font-semibold leading-[20px] text-[#1F2937] outline-none"
                />
                <span className="text-[14px] font-medium text-[#4B5563]">
                  년
                </span>
              </div>

              <div className="flex h-[36px] w-[70px] items-center rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] px-[10px]">
                <input
                  value={monthInput}
                  onChange={(e) => handleMonthChange(e.target.value)}
                  onFocus={handleNumberInputFocus}
                  onBlur={handleMonthBlur}
                  inputMode="numeric"
                  className="h-full w-full bg-transparent text-center text-[15px] font-semibold leading-[20px] text-[#1F2937] outline-none"
                />
                <span className="text-[14px] font-medium text-[#4B5563]">
                  월
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => moveMonth('next')}
              className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#F1F5F9] text-[18px] font-semibold text-[#4B5563] outline-none focus:outline-none"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-[6px]">
            {['일', '월', '화', '수', '목', '금', '토'].map((dayName) => (
              <div
                key={dayName}
                className="flex h-[28px] items-center justify-center text-[12px] font-semibold leading-[16px] text-[#9CA3AF]"
              >
                {dayName}
              </div>
            ))}

            {calendarCells.map((cell) => {
              if (cell.type === 'empty') {
                return <div key={cell.key} className="h-[36px]" />;
              }

              const disabled = isFutureDay(viewYear, viewMonth, cell.day);
              const isSelected =
                selectedYear === viewYear &&
                selectedMonth === viewMonth &&
                selectedDay === cell.day;

              return (
                <button
                  key={cell.key}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onChange(formatDate(viewYear, viewMonth, cell.day));
                    setIsOpen(false);
                  }}
                  className={`flex h-[36px] items-center justify-center rounded-[10px] text-[14px] font-medium leading-[20px] outline-none focus:outline-none ${
                    disabled
                      ? 'cursor-not-allowed text-[#CBD5E1]'
                      : isSelected
                        ? 'bg-[#2F5DAA] text-white'
                        : 'text-[#1F2937] hover:bg-[#EFF6FF] hover:text-[#2F5DAA]'
                  }`}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          <div className="mt-[14px] flex items-center justify-between border-t border-[#E2E8F0] pt-[12px]">
            <button
              type="button"
              onClick={() => {
                setViewYear(today.getFullYear());
                setViewMonth(today.getMonth() + 1);
              }}
              className="text-[13px] font-medium leading-[18px] text-[#4B5563] outline-none focus:outline-none"
            >
              오늘로 이동
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="h-[32px] rounded-[8px] bg-[#2F5DAA] px-[14px] text-[13px] font-semibold leading-[18px] text-white outline-none focus:outline-none"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
