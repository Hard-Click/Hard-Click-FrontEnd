'use client';

import { useState } from 'react';
import CommunityPostCard from './CommunityPostCard';
import PostEmptyState from './PostEmptyState';
import CommunityToolBar from './CommunityToolBar';

interface CommunityFilterTabsProps {
  posts: {
    id: number;
    category: string;
    title: string;
    author: string;
    time: string;
    views: number;
    comments: number;
    status?: string;
    recruit?: string;
  }[];
}

interface CommunityToolBarProps {
  sortType: string;
  onSortChange: (sort: string) => void;
}

const FILTERS = ['전체', '자유게시판', '질문게시판', '스터디모집'];

export default function CommunityFilterTabs({
  posts,
}: CommunityFilterTabsProps) {
  const [activeTab, setActiveTab] = useState('전체');
  const filteredPosts =
    activeTab === '전체'
      ? posts
      : posts.filter((post) => post.category === activeTab);

  const [sortType, setSortType] = useState('최신순');
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortType === '조회순') {
      return b.views - a.views;
    }

    if (sortType === '댓글순') {
      return b.comments - a.comments;
    }

    return 0;
  });
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
        <CommunityToolBar sortType={sortType} onSortChange={setSortType} />
      </div>

      {/* posts */}
      {sortedPosts.length === 0 ? (
        <PostEmptyState />
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {sortedPosts.map((post) => (
            <CommunityPostCard
              key={post.id}
              category={post.category}
              title={post.title}
              author={post.author}
              time={post.time}
              views={post.views}
              comments={post.comments}
              status={post.status}
              recruit={post.recruit}
            />
          ))}
        </div>
      )}
    </>
  );
}
