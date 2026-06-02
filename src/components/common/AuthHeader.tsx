import Image from 'next/image';

export default function AuthHeader() {
  return (
    <div className="mb-14 flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2F5DAA] pl-1">
        <Image src="/logos/logo.svg" alt="logo" width={28} height={28} />
      </div>

      <Image
        src="/logos/sitenameBlack.svg"
        alt="sitename"
        width={120}
        height={40}
      />
    </div>
  );
}
