import { type TermsModalType } from './registerForm.shared';

const termsContent = {
  terms: {
    title: '이용약관',
    content: [
      '제1조 (목적)',
      '본 약관은 FLOWN(이하 "회사")이 제공하는 온라인 학습 플랫폼 서비스(이하 "서비스")를 이용함에 있어 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.',
      '제2조 (정의)',
      '1. "서비스"란 회사가 제공하는 온라인 학습 플랫폼 및 관련 제반 서비스를 의미합니다.',
      '2. "회원"이란 회사의 서비스에 접속하여 본 약관에 따라 회사와 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 고객을 말합니다.',
      '제3조 (약관의 게시와 개정)',
      '1. 회사는 본 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.',
      '2. 회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.',
    ],
  },
  privacy: {
    title: '개인정보 활용 동의',
    content: [
      '제1조 (개인정보의 처리 목적)',
      '회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.',
      '1. 회원 가입 및 관리',
      '회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리, 서비스 부정이용 방지, 각종 고지·통지 목적으로 개인정보를 처리합니다.',
      '2. 재화 또는 서비스 제공',
      '서비스 제공, 콘텐츠 제공, 맞춤 서비스 제공, 본인인증을 목적으로 개인정보를 처리합니다.',
      '제2조 (개인정보의 처리 및 보유 기간)',
      '회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.',
    ],
  },
  marketing: {
    title: '마케팅 정보 수신 동의',
    content: [
      '제1조 (목적)',
      '본 동의는 회사가 제공하는 이벤트, 프로모션, 신규 서비스 등의 마케팅 정보를 수신하는 것에 대한 동의입니다.',
      '제2조 (수신 정보)',
      '회원은 다음과 같은 마케팅 정보를 수신할 수 있습니다:',
      '1. 신규 강의 및 콘텐츠 안내',
      '2. 이벤트 및 프로모션 정보',
      '3. 서비스 업데이트 소식',
      '4. 맞춤형 학습 추천 정보',
      '제3조 (수신 방법)',
      '마케팅 정보는 이메일, SMS, 앱 푸시 알림 등의 방법으로 발송됩니다.',
      '제4조 (동의 철회)',
      '회원은 언제든지 마이페이지에서 마케팅 정보 수신 동의를 철회할 수 있습니다.',
    ],
  },
};

export default function TermsModal({
  type,
  onClose,
}: {
  type: Exclude<TermsModalType, null>;
  onClose: () => void;
}) {
  const item = termsContent[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="flex h-[590px] w-[672px] flex-col overflow-hidden rounded-[16px] bg-white shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]">
        <div className="flex h-[77px] w-[672px] shrink-0 items-center justify-between border-b border-[#E2E8F0] px-[24px]">
          <h3 className="text-[20px] font-bold leading-[28px] tracking-[-0.45px] text-[#1F2937]">
            {item.title}
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="relative h-[24px] w-[24px] outline-none focus:outline-none"
          >
            <span className="absolute left-[6px] top-[11px] h-[2px] w-[14px] rotate-45 rounded-full bg-[#4B5563]" />
            <span className="absolute left-[6px] top-[11px] h-[2px] w-[14px] -rotate-45 rounded-full bg-[#4B5563]" />
          </button>
        </div>

        <div className="h-[416px] w-[672px] overflow-y-auto px-[24px] py-[24px]">
          <div className="flex w-[624px] flex-col gap-[16px]">
            {item.content.map((line, index) => (
              <p
                key={`${line}-${index}`}
                className="text-[16px] font-normal leading-[24px] tracking-[-0.31px] text-[#4B5563]"
              >
                {line}
              </p>
            ))}
          </div>
        </div>

        <div className="h-[97px] w-[672px] shrink-0 border-t border-[#E2E8F0] px-[24px] pt-[25px]">
          <button
            type="button"
            onClick={onClose}
            className="h-[48px] w-[624px] rounded-[10px] bg-[#2F5DAA] text-[16px] font-semibold leading-[24px] tracking-[-0.31px] text-white outline-none focus:outline-none"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
