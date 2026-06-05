import { getMyActivitiesServer } from '@/features/mypage/server';
import MyActivitiesContent from './MyActivitiesContent';

export default async function MyActivitiesPage() {
  // 서버에서 내 활동(글/댓글/리뷰) 확보
  const activities = await getMyActivitiesServer();

  return (
    <MyActivitiesContent
      activities={activities ?? { posts: [], comments: [], reviews: [] }}
    />
  );
}
