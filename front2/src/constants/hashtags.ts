export interface HashtagItem {
  name: string;
  label: string;
  icon: string;
  category: "trending" | "creative" | "lifestyle" | "entertainment" | "tech";
}

export const MAIN_STATIC_HASHTAGS: HashtagItem[] = [
  { name: "viral", label: "#viral", icon: "🔥", category: "trending" },
  { name: "trending", label: "#trending", icon: "⚡", category: "trending" },
  { name: "for-you", label: "#foryou", icon: "✨", category: "trending" },
  { name: "dance", label: "#dance", icon: "💃", category: "creative" },
  { name: "funny", label: "#funny", icon: "😂", category: "entertainment" },
  { name: "music", label: "#music", icon: "🎵", category: "creative" },
  { name: "tech", label: "#tech", icon: "💻", category: "tech" },
  { name: "gaming", label: "#gaming", icon: "🎮", category: "entertainment" },
  { name: "fitness", label: "#fitness", icon: "🏋️‍♂️", category: "lifestyle" },
  { name: "fashion", label: "#fashion", icon: "👠", category: "lifestyle" },
  { name: "food", label: "#food", icon: "🍕", category: "lifestyle" },
  { name: "comedy", label: "#comedy", icon: "🎭", category: "entertainment" },
  { name: "sports", label: "#sports", icon: "⚽", category: "lifestyle" },
  { name: "art", label: "#art", icon: "🎨", category: "creative" },
  { name: "motivation", label: "#motivation", icon: "💪", category: "lifestyle" },
];
