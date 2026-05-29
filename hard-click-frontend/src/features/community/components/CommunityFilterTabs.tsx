'use client';

import { useState, useEffect, useRef } from 'react';
import CommunityPostCard from './CommunityPostCard';
import PostEmptyState from './PostEmptyState';
import CommunityToolBar from './CommunityToolBar';
import { getPostsAction, getSubjectsAction } from '../actions';
import type { PostListItem, BoardType } from '../types';
import { BOARD_TYPE_LABEL, POST_STATUS_LABEL } from '../types';

const FILTERS = ['전체', '자유게시판', '질문게시판', '스터디모집'];

const TAB_TO_BOARD_TYPE: Record<string, BoardType> = {
  전체: 'ALL',
  자유게시판: 'FREE',
  질문게시판: 'QUESTION',
  스터디모집: 'STUDY',
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
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 과목 목록 API 로드
  useEffect(() => {
    getSubjectsAction().then((result) => {
      if (result.success && result.data) {
        setSubjects(result.data.map((s) => s.subjectName));
      }
    });
  }, []);

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
    const apiSort =
      sortType === '조회순'
        ? 'viewCount,desc'
        : sortType === '최신순'
          ? 'createdAt,desc'
          : undefined; // 댓글순은 클라이언트 정렬

    setIsLoading(true);
    getPostsAction(boardType, 0, debouncedSearch || undefined, apiSort).then(
      (result) => {
        if (result.success && result.data) {
          setPosts(result.data.content);
        }
        setIsLoading(false);
      },
    );
  }, [activeTab, sortType, debouncedSearch]);

  // 댓글순: 클라이언트 정렬 (API 미지원)
  const sortedPosts =
    sortType === '댓글순'
      ? [...posts].sort((a, b) => b.commentCount - a.commentCount)
      : posts;

  const handleReset = () => {
    setSelectedSubject('');
    setSortType('최신순');
    setSearchValue('');
    setDebouncedSearch(''); // debounce 스킵하고 즉시 초기화
  };

  // 검색 버튼 클릭 → 즉시 검색 (debounce 스킵)
  const handleSearch = () => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    setDebouncedSearch(searchValue);
  };

  const mappedPosts = sortedPosts.map((p) => ({
    id: p.postId,
    category: BOARD_TYPE_LABEL[p.boardType],
    title: p.title,
    author: p.authorName,
    time: formatDate(p.createdAt),
    views: p.viewCount,
    comments: p.commentCount,
    status: p.status ? POST_STATUS_LABEL[p.status] : undefined,
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
          boardType={activeTab}
          selectedSubject={selectedSubject}
          onSubjectChange={setSelectedSubject}
          onReset={handleReset}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onSearch={handleSearch}
          subjects={subjects}
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
