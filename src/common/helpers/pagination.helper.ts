import {
  PaginatedView,
  PaginationParams,
  PaginationQuery,
} from '../types/pagination.types';

/**
 * getPaginationParams — нормализует query-параметры пагинации.
 *
 * Из req.query приходят строки.
 * Здесь мы приводим их к нормальному виду:
 * - pageNumber: number
 * - pageSize: number
 * - sortBy: string
 * - sortDirection: asc | desc
 * - skip: number
 */
export const getPaginationParams = (
  query: PaginationQuery,
): PaginationParams => {
  const pageNumber = Number(query.pageNumber) || 1;
  const pageSize = Number(query.pageSize) || 10;
  const sortBy = query.sortBy || 'createdAt';
  const sortDirection = query.sortDirection === 'asc' ? 'asc' : 'desc';

  return {
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
    skip: (pageNumber - 1) * pageSize,
  };
};

export const buildPaginatedView = <T>(params: {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  items: T[];
}): PaginatedView<T> => {
  return {
    pagesCount: Math.ceil(params.totalCount / params.pageSize),
    page: params.pageNumber,
    pageSize: params.pageSize,
    totalCount: params.totalCount,
    items: params.items,
  };
};