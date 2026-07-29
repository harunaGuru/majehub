export interface PaginatedResult<T> {
  data: T[];
  page: number;
  totalPages: number;
  total: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const paginateData = <T>(
  items: T[],
  page: number = 1,
  limit: number = 5
): PaginatedResult<T> => {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const startIndex = (currentPage - 1) * limit;
  const endIndex = startIndex + limit;
  const data = items.slice(startIndex, endIndex);

  return {
    data,
    page: currentPage,
    totalPages,
    total,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
};
