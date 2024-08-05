/* eslint-disable @typescript-eslint/no-explicit-any */
// src/service/apiService.ts
import axios, { AxiosInstance, AxiosError } from 'axios';

class CustomAxiosWrapper {
  private readonly axiosInstance: AxiosInstance;

  constructor(axiosInstance: AxiosInstance) {
    this.axiosInstance = axiosInstance;
  }

  public async get<ResponseType>(url: string): Promise<ResponseType> {
    return this.makeRequest<ResponseType>('get', url);
  }

  public async post<RequestType, ResponseType>(
    url: string,
    data: RequestType
  ): Promise<ResponseType> {
    return this.makeRequest<ResponseType>('post', url, data);
  }

  public async put<RequestType, ResponseType>(
    url: string,
    data: RequestType
  ): Promise<ResponseType> {
    return this.makeRequest<ResponseType>('put', url, data);
  }

  public async delete<ResponseType>(url: string): Promise<ResponseType> {
    return this.makeRequest<ResponseType>('delete', url);
  }

  public async formData<ResponseType>(url: string, formData: FormData): Promise<ResponseType> {
    return this.makeRequest<ResponseType>('post', url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  private async makeRequest<ResponseType>(
    method: 'get' | 'post' | 'put' | 'delete',
    url: string,
    data?: any,
    config?: any
  ): Promise<ResponseType> {
    try {
      const response = await this.axiosInstance[method](url, data, config);
      return response.data as ResponseType;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const message = axiosError.response?.data ? JSON.stringify(axiosError.response.data) : axiosError.message;
      return new Error(message);
    } else {
      return new Error((error as Error).message);
    }
  }
}

export const useApi = () => {
  const customAxios = new CustomAxiosWrapper(
    axios.create({
      baseURL: 'https://localhost:7234/api', // General base URL for API
    })
  );

  return customAxios;
};