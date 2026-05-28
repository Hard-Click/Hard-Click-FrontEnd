export interface Reply {
  id: number;
  author: string;
  avatar: string;
  time: string;
  content: string;
  isOwner: boolean;
}

export interface Comment {
  id: number;
  author: string;
  avatar: string;
  time: string;
  content: string;
  isOwner: boolean;
  isAccepted: boolean;
  replies: Reply[];
}

export interface Post {
  id: number;
  category: '질문게시판' | '자유게시판' | '스터디모집';
  title: string;
  author: string;
  date: string;
  views: number;
  content: string;
  isOwner: boolean;
  isAccepted: boolean;
  comments: Comment[];
}

export const MOCK_POSTS: Record<number, Post> = {
  1: {
    id: 1,
    category: '질문게시판',
    title: 'React Hook useEffect 사용 시 무한 루프 문제 해결 방법',
    author: '이*호',
    date: '2026.05.11 14:30',
    views: 145,
    content:
      'useEffect를 사용할 때 계속 무한 루프가 발생합니다.\n\n아래와 같은 코드를 작성했는데, 계속해서 useEffect가 실행되는 문제가 있습니다.\n\n```javascript\nuseEffect(() => {\n  setData(fetchData());\n}, [data]);\n```\n\n어떻게 해결해야 할까요?',
    isOwner: false,
    isAccepted: true,
    comments: [
      {
        id: 1,
        author: '박*영',
        avatar: '박',
        time: '2시간 전',
        content:
          'dependency array에 data를 넣으면 data가 변경될 때마다 useEffect가 실행되고, useEffect 안에서 다시 data를 변경하기 때문에 무한 루프가 발생합니다. dependency array를 비우거나 다른 값으로 변경해보세요.',
        isOwner: false,
        isAccepted: true,
        replies: [
          {
            id: 2,
            author: '이*호',
            avatar: '이',
            time: '2시간 전',
            content: '야 그렇군요! 감사합니다. 해결됐습니다!',
            isOwner: false,
          },
        ],
      },
      {
        id: 3,
        author: '김*수',
        avatar: '김',
        time: '1시간 전',
        content: 'useCallback을 사용하는 것도 좋은 방법입니다.',
        isOwner: true,
        isAccepted: false,
        replies: [],
      },
    ],
  },

  2: {
    id: 2,
    category: '자유게시판',
    title: '프론트엔드 개발자 로드맵 공유합니다',
    author: '박*영',
    date: '2026.05.11 14:30',
    views: 321,
    content:
      '수능을 준비하면서 느낀 점들을 공유합니다.\n\n1. 꾸준함이 가장 중요합니다\n2. 자신만의 학습 방법을 찾는 것이 중요해요\n3. 오답 노트는 필수입니다\n4. 충분한 수면과 휴식도 중요합니다\n5. 모의고사는 실전처럼 풀어야 해요\n6. 포기하지 않는 마음가짐이 제일 중요합니다\n\n여러분 모두 파이팅!',
    isOwner: true,
    isAccepted: false,
    comments: [
      {
        id: 1,
        author: '이*호',
        avatar: '이',
        time: '1시간 전',
        content: '좋은 정보 감사합니다!',
        isOwner: false,
        isAccepted: false,
        replies: [],
      },
      {
        id: 2,
        author: '김*수',
        avatar: '김',
        time: '30분 전',
        content: '저도 공감합니다. 특히 오답 노트 정말 중요하더라고요',
        isOwner: true,
        isAccepted: false,
        replies: [
          {
            id: 3,
            author: '박*영',
            avatar: '박',
            time: '20분 전',
            content: '좋은 의견 감사합니다!',
            isOwner: false,
          },
        ],
      },
    ],
  },

  3: {
    id: 3,
    category: '질문게시판',
    title: '가나다라',
    author: '이*윤',
    date: '2026.05.11 14:30',
    views: 120,
    content: '질문 내용입니다.',
    isOwner: true,
    isAccepted: false,
    comments: [],
  },
};
