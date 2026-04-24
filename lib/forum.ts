export const FORUM_CATEGORIES = ["General", "Salud", "Adopciones", "Rescate"] as const;

export type ForumCategory = (typeof FORUM_CATEGORIES)[number];

export function isForumCategory(value: string): value is ForumCategory {
  return FORUM_CATEGORIES.includes(value as ForumCategory);
}
