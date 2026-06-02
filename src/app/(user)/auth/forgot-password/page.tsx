import AuthHeader from '@/components/common/AuthHeader';
import ForgotPasswordForm from '@/features/auth/components/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5F7FB]">
      <AuthHeader />

      <ForgotPasswordForm />
    </div>
  );
}
