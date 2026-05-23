import AuthHeader from '@/components/common/AuthHeader';
import AccountProtectionFlow from '@/features/auth/components/AccountProtectionFlow';

export default function AccountProtectionPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5F7FB]">
      <AuthHeader />

      <AccountProtectionFlow />
    </div>
  );
}
