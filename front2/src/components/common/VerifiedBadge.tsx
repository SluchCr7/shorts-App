"use client";

import { BsPatchCheckFill } from "react-icons/bs";

interface VerifiedBadgeProps {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

export default function VerifiedBadge({ size = "sm", className = "" }: VerifiedBadgeProps) {
  const sizeMap = {
    xs: "w-3.5 h-3.5",
    sm: "w-4 h-4",
    md: "w-4.5 h-4.5",
    lg: "w-5.5 h-5.5",
  };

  return (
    <BsPatchCheckFill
      className={`text-[#1d9bf0] shrink-0 inline-block align-middle ${sizeMap[size]} ${className}`}
      title="Verified Account"
    />
  );
}
