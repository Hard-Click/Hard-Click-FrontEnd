import LearningVideoContent from './LearningVideoContent';
import {
  getVideoPlayInfoServer,
  getCourseProgressServer,
} from '@/features/learning/server';
import { getCourseDetailServer } from '@/features/courses/server';

/**
 * 학습 영상 페이지 (Server Component, §4 Server-First).
 * 초기 데이터(영상 재생정보·강의 진도·강의 상세)를 서버에서 조회해 client `LearningVideoContent`에 props로 전달.
 * 이후 재생/진도/완료/이어보기 등 상호작용은 client에서 처리. (videoId 변경 시 key로 remount → 새 초기값)
 */
export default async function LearningVideoPage({
  params,
}: {
  params: Promise<{ videoId: string }>;
}) {
  const { videoId: raw } = await params;
  const videoId = Number(raw);

  if (!Number.isFinite(videoId)) {
    return (
      <LearningVideoContent
        key="invalid"
        initialVideo={null}
        initialProgress={null}
        initialDetail={null}
        initialErrorStatus={404}
      />
    );
  }

  const { video, status } = await getVideoPlayInfoServer(videoId);
  if (!video) {
    return (
      <LearningVideoContent
        key={videoId}
        initialVideo={null}
        initialProgress={null}
        initialDetail={null}
        initialErrorStatus={status}
      />
    );
  }

  // 영상 조회 성공 → 강의 진도 + 강의 상세(사이드바 title/section/duration)를 병렬 조회
  const [prog, detail] = await Promise.all([
    getCourseProgressServer(video.courseId),
    getCourseDetailServer(video.courseId),
  ]);

  return (
    <LearningVideoContent
      key={videoId}
      initialVideo={video}
      initialProgress={prog.progress}
      initialDetail={detail}
      initialErrorStatus={null}
    />
  );
}
