const AVATAR_COLORS = [
  "#d94666",
  "#7c3aed",
  "#2563eb",
  "#0891b2",
  "#059669",
  "#ca8a04",
  "#ea580c",
  "#db2777",
  "#4f46e5",
  "#0f766e",
];

export function generateAvatarColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}
