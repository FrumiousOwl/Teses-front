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

  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        return new Error("You do not have permission to perform this action.");
      }
      return new Error(error.response?.data?.message || error.message);
    } else if (error instanceof Error) {
      return new Error(error.message);
    } else {
      return new Error("An unknown error occurred.");
    }
  }
}

export const useApi = () => {
  const customAxios = axios.create({
    baseURL: 'https://localhost:7234/api',
  });

  customAxios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  return new CustomAxiosWrapper(customAxios);
};