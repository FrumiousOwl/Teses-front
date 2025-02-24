// src/service/apiService.ts
import axios, { AxiosInstance } from 'axios';

class CustomAxiosWrapper {
  private readonly axiosInstance: AxiosInstance;

  constructor(axiosInstance: AxiosInstance) {
    this.axiosInstance = axiosInstance;
  }

  public async get<ResponseType>(url: string): Promise<ResponseType> {
    try {
      const response = await this.axiosInstance.get(url);
      return response.data as ResponseType;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async post<RequestType, ResponseType>(
    url: string,
    data: RequestType
  ): Promise<ResponseType> {
    try {
      const response = await this.axiosInstance.post(url, data);
      return response.data as ResponseType;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async put<RequestType, ResponseType>(
    url: string,
    data: RequestType
  ): Promise<ResponseType> {
    try {
      const response = await this.axiosInstance.put(url, data);
      return response.data as ResponseType;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async delete<ResponseType>(url: string): Promise<ResponseType> {
    try {
      const response = await this.axiosInstance.delete(url);
      return response.data as ResponseType;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async formData<ResponseType>(url: string, formData: FormData): Promise<ResponseType> {
    try {
      const response = await this.axiosInstance.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data as ResponseType;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      return new Error(error.response?.data || error.message);
    } else {
      return new Error((error as Error).message);
    }
  }
}

export const useApi = () => {
  const customAxios = new CustomAxiosWrapper(
    axios.create({
      baseURL: 'https://localhost:7234/api'
, // ✅ No extra "/api"
    })
  );

  return customAxios;
};
