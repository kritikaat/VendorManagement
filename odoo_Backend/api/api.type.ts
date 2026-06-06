export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: any;
}

export interface ExternalUserResponse {
  id: string;
  name: string;
  email: string;
}
