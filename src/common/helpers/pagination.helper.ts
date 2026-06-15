import {
  PaginatedView,
  PaginationParams,
  PaginationQuery,
} from '../types/pagination.types';

const DEFAULT_PAGE_NUMBER = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

const toPositiveNumber = (value: unknown, fallback: number): number => {
  const numberValue = Number(value);

  if (!Number.isInteger(numberValue) || numberValue < 1) {
    return fallback;
  }

  return numberValue;
};

export const getPaginationParams = (
  query: PaginationQuery,
): PaginationParams => {
  const pageNumber = toPositiveNumber(query.pageNumber, DEFAULT_PAGE_NUMBER);

  const rawPageSize = toPositiveNumber(query.pageSize, DEFAULT_PAGE_SIZE);
  const pageSize = Math.min(rawPageSize, MAX_PAGE_SIZE);

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
}): PaginatedView<T> => ({
  pagesCount: Math.ceil(params.totalCount / params.pageSize),
  page: params.pageNumber,
  pageSize: params.pageSize,
  totalCount: params.totalCount,
  items: params.items,
});