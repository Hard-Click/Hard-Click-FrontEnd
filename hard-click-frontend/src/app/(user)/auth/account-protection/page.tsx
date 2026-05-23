import Image from 'next/image';

export default function AccountProtectionPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5F7FB]">
      <div className="mb-14 flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2F5DAA] pl-1">
          <Image src="/logos/logo.svg" alt="logo" width={36} height={36} />
        </div>

        <Image
          src="/logos/sitenameBlack.svg"
          alt="sitename"
          width={140}
          height={40}
        />
      </div>
    </div>
  );
}
