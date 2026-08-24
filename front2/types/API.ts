export interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  error?: string | null;
  statusCode?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextCursor?: string | null;
}

export interface APIError {
  message: string;
  code?: string;
  status?: number;
  errors?: Record<string, string[]>;
}
