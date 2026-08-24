"use client";

import { use } from "react";
import { useGetShortByIdQuery } from "../../../src/redux/api/shortsApi";
import ShortCard from "../../../src/components/feed/ShortCard";

export default function SingleShortPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const shortId = resolvedParams.id;

  const { data: short, isLoading } = useGetShortByIdQuery(shortId);

  if (isLoading) {
    return (
      <div className="w-full h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-[var(--accent-primary)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!short) {
    return (
      <div className="w-full h-[calc(100vh-4rem)] flex items-center justify-center text-[var(--text-secondary)]">
        Short video not found
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-4rem)] flex items-center justify-center py-4">
      <ShortCard short={short} isActive={true} />
    </div>
  );
}
