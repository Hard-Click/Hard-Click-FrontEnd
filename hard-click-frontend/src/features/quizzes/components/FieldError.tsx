import Image from 'next/image';

/**
 * 폼 필드 에러 텍스트 — 강의등록(CourseCreateForm)·회원가입과 동일 형식.
 * error.svg + 빨강 문구, min-h로 에러 유무에 따른 레이아웃 흔들림 방지.
 */
export default function FieldError({ message }: { message?: string }) {
  return (
    <div className="mt-1.5 min-h-[20px]">
      {message ? (
        <div className="flex items-center gap-1">
          <Image src="/icons/error.svg" alt="" width={14} height={14} />
          <p className="text-sm text-[#B91C1C]">{message}</p>
        </div>
      ) : null}
    </div>
  );
}
