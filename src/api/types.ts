export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: ApiMeta;
}

export interface ApiErrorBody {
  success?: boolean;
  message?: string;
  statusCode?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: ApiMeta;
}
