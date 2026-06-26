'use client';

interface TabOption<T extends string> {
  key: T;
  label: string;
}

interface ReportFilterTabGroupProps<T extends string> {
  title: string;
  options: TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export default function ReportFilterTabGroup<T extends string>({
  title,
  options,
  value,
  onChange,
}: ReportFilterTabGroupProps<T>) {
  return (
    <div className="flex flex-1 flex-col gap-3">
      <span className="text-sm font-semibold text-[#64748B]">{title}</span>
      <div className="flex items-center gap-[12px]">
        {options.map((option) => {
          const isActive = value === option.key;
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => onChange(option.key)}
              className={`h-9 whitespace-nowrap rounded-[30px] px-4 text-sm font-semibold transition ${
                isActive
                  ? 'bg-[#2F5DAA] text-white'
                  : 'bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
