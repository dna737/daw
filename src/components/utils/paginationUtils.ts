import { PAGINATION_THRESHOLD, PAGINATION_LEADING_OFFSET_THRESHOLD } from "./constants";

export const getPageRange = (current: number, total: number) => {
  const pages: (number | string)[] = [];
  if (total <= PAGINATION_THRESHOLD) return Array.from({ length: total }, (_, i) => i + 1);

  pages.push(1);

  if (current > PAGINATION_LEADING_OFFSET_THRESHOLD) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - (PAGINATION_LEADING_OFFSET_THRESHOLD -1)) pages.push("...");

  pages.push(total);
  return pages;
};
