'use client';

import { useState, useEffect, useRef } from 'react';
import CommunityPostCard from './CommunityPostCard';
import PostEmptyState from './PostEmptyState';
import CommunityToolBar from './CommunityToolBar';
import { getPostsAction } from '../actions';
import type { PostListItem, BoardType } from '../types';
import { BOARD_TYPE_LABEL } from '../types';

// UI 표시 → 백엔드 sort enum
const SORT_MAP: Record<string, string> = {
  최신순: 'latest',
  조회순: 'views',
  댓글순: 'comments',
};
const FILTERS = ['전체', '자유게시판', '질문게시판', '스터디모집'];

const TAB_TO_BOARD_TYPE: Record<string, BoardType> = {
  전체: 'ALL',
  자유게시판: 'FREE',
  질문게시판: 'QUESTION',
  스터디모집: 'STUDY'
};

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  return date.toLocaleDateString('ko-KR');
}

export default function CommunityFilterTabs() {
  const [activeTab, setActiveTab] = useState('전체');
  const [sortType, setSortType] = useState('최신순');
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 검색어 debounce 500ms
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 500);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchValue]);

  // 탭/정렬/검색 변경 시 API 호출
  useEffect(() => {
    const boardType = TAB_TO_BOARD_TYPE[activeTab];
    const apiSort = SORT_MAP[sortType]; // 최신순→latest, 조회순→views, 댓글순→comments

    setIsLoading(true);
    getPostsAction(boardType, 0, debouncedSearch || undefined, apiSort).then(
      (result) => {
        if (result.success && result.data) {
          // content(구) / posts(신) 둘 다 대응
          const items =
            (result.data as { posts?: PostListItem[]; content?: PostListItem[] }).posts ??
            (result.data as { content?: PostListItem[] }).content ??
            [];
          setPosts(items);
        }
        setIsLoading(false);
      },
    );
  }, [activeTab, sortType, debouncedSearch]);

  // 검색 버튼 클릭 → 즉시 검색
  const handleSearch = () => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    setDebouncedSearch(searchValue);
  };

  const mappedPosts = posts.map((p) => ({
    id: p.postId,
    category: BOARD_TYPE_LABEL[p.boardType],
    title: p.title,
    author: p.authorName,
    time: formatDate(p.createdAt),
    views: p.viewCount,
    comments: p.commentCount,
  }));

  return (
    <>
      {/* filter tabs */}
      <div className="overflow-hidden rounded-[16px] border border-[#E2E8F0] bg-white p-1 shadow-sm">
        <div className="grid grid-cols-4 gap-1">
          {FILTERS.map((filter) => {
            const isActive = activeTab === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveTab(filter)}
                className={`h-11 rounded-[20px] text-sm font-semibold transition ${
                  isActive
                    ? 'bg-[#2F5DAA] text-white shadow-sm'
                    : 'bg-white text-[#4B5563] hover:bg-[#F8FAFC]'
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      {/* toolbar */}
      <div className="mt-6">
        <CommunityToolBar
          sortType={sortType}
          onSortChange={setSortType}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onSearch={handleSearch}
        />
      </div>

      {/* posts */}
      {isLoading ? (
        <div className="py-20 text-center text-[#64748B]">불러오는 중...</div>
      ) : mappedPosts.length === 0 ? (
        <PostEmptyState />
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {mappedPosts.map((post) => (
            <CommunityPostCard key={post.id} {...post} />
          ))}
        </div>
      )}
    </>
  );
}
