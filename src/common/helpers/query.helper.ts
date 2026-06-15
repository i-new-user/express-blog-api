export const escapeRegex = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const getAllowedSortBy = <T extends string>(
  sortBy: string,
  allowedFields: readonly T[],
  fallback: T,
): T => {
  return allowedFields.includes(sortBy as T) ? (sortBy as T) : fallback;
};