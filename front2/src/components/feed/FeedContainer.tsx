"use client";

import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "../../redux/store";
import { useGetShortsFeedQuery } from "../../redux/api/shortsApi";
import ShortCard from "./ShortCard";

export default function FeedContainer() {
  const { feedType } = useAppSelector((state) => state.ui);
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useGetShortsFeedQuery({
    type: feedType,
    page,
  });

  const feed = data?.shorts || [];
  const hasMore = data?.hasMore ?? true;

  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Reset page when feedType changes
  useEffect(() => {
    setPage(1);
    setActiveIndex(0);
  }, [feedType]);

  // Handle scroll intersection to detect active card and trigger pagination
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const children = Array.from(container.children);
      const containerTop = container.getBoundingClientRect().top;

      let closestIndex = 0;
      let minDistance = Infinity;

      children.forEach((child, index) => {
        const distance = Math.abs(child.getBoundingClientRect().top - containerTop);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });

      setActiveIndex(closestIndex);

      // Load next page when reaching near end
      if (closestIndex >= feed.length - 2 && hasMore && !isFetching && !isLoading) {
        setPage((prev) => prev + 1);
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [feed, hasMore, isFetching, isLoading]);

  if (isLoading && page === 1) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-full border-4 border-[var(--accent-primary)] border-t-transparent animate-spin" />
        <p className="text-sm font-semibold text-[var(--text-secondary)]">Loading short videos...</p>
      </div>
    );
  }

  if (!isLoading && feed.length === 0) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="w-16 h-16 rounded-3xl bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--accent-primary)] text-2xl font-bold">
          🎬
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">No Shorts Available</h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-sm">
          {feedType === "following"
            ? "Follow creators to see their latest short videos here!"
            : "Be the first to upload a short video to the platform!"}
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-screen overflow-y-scroll snap-y snap-mandatory no-scrollbar"
    >
      {feed.map((short, index) => {
        const isNearby = Math.abs(index - activeIndex) <= 1;
        return (
          <div key={short._id} className="w-full h-screen snap-start snap-always flex items-center justify-center overflow-hidden py-2 sm:py-4">
            <ShortCard
              short={short}
              isActive={index === activeIndex}
              shouldRenderVideo={isNearby}
            />
          </div>
        );
      })}

      {isFetching && page > 1 && (
        <div className="w-full py-4 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-[var(--accent-primary)] border-t-transparent animate-spin" />
        </div>
      )}
    </div>
  );
}
