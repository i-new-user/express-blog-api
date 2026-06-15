export type SortDirection = 'asc' | 'desc';

export type PaginationQuery = {
  sortBy?: string;
  sortDirection?: SortDirection;
  pageNumber?: string;
  pageSize?: string;
};

export type PaginationParams = {
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: SortDirection;
  skip: number;
};

export type PaginatedView<T> = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T[];
};