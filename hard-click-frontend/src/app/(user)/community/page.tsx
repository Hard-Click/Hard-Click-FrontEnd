import Image from 'next/image';
import CommunityFilterTabs from '@/features/community/components/CommunityFilterTabs';
import CommunityToolBar from '@/features/community/components/CommunityToolBar';
import PostActionButtons from '@/features/community/components/PostActionButtons';

export default function CommunityPage() {
  // 임의 데이터!! 나중에 연동 하고 지우깅
  const mockPosts = [
    {
      id: 1,
      category: '질문게시판',
      title: 'React Hook useEffect 사용 시 무한 루프 문제 해결 방법',
      author: '이*호',
      time: '2시간 전',
      views: 145,
      comments: 12,
      status: '채택 완료',
    },
    {
      id: 2,
      category: '자유게시판',
      title: '프론트엔드 개발자 로드맵 공유합니다',
      author: '박*영',
      time: '5시간 전',
      views: 321,
      comments: 23,
    },
    {
      id: 3,
      category: '질문게시판',
      title: '가나다라',
      author: '이*윤',
      time: '8시간 전',
      views: 120,
      comments: 60,
      status: '답변 대기',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-8 py-10">
      <div className="mx-auto w-full max-w-[1152px]">
        {/* top */}
        <div className="mb-8 flex items-start justify-between">
          {/* left */}
          <div>
            <div className="mb-3 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-[#2F5DAA]">
                <Image
                  src="/icons/commu.svg"
                  alt="community"
                  width={30}
                  height={30}
                />
              </div>

              <h1 className="text-4xl font-bold text-[#1E293B]">커뮤니티</h1>
            </div>

            <p className="text-base text-[#4B5563]">
              함께 성장하는 학습 커뮤니티에 참여하세요
            </p>
          </div>

          {/* right */}
          <PostActionButtons />
        </div>

        <CommunityFilterTabs posts={mockPosts} />
      </div>
    </div>
  );
}
