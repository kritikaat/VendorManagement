import { axiosInstance } from './axios.js';
import { ApiResponse } from './api.type.js';

export class HttpClient {
  public static async get<T>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const response = await axiosInstance.get<T>(url, { params });
    return {
      data: response.data,
      status: response.status,
      headers: response.headers,
    };
  }

  public static async post<T>(url: string, body?: any): Promise<ApiResponse<T>> {
    const response = await axiosInstance.post<T>(url, body);
    return {
      data: response.data,
      status: response.status,
      headers: response.headers,
    };
  }

  public static async put<T>(url: string, body?: any): Promise<ApiResponse<T>> {
    const response = await axiosInstance.put<T>(url, body);
    return {
      data: response.data,
      status: response.status,
      headers: response.headers,
    };
  }

  public static async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response = await axiosInstance.delete<T>(url);
    return {
      data: response.data,
      status: response.status,
      headers: response.headers,
    };
  }
}
