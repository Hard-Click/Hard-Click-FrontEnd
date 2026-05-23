export default function PasswordRuleList() {
  return (
    <div className="mt-3 text-xs leading-6 text-[#6B7280]">
      <p>비밀번호 조건:</p>
      <p>• 8자 이상 16자 이하</p>
      <p>• 영문 포함</p>
      <p>• 숫자 포함</p>
      <p>• 특수문자(@$!%*#?&) 포함</p>
    </div>
  );
}
