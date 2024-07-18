// src/service/apiService.ts
import axios, { AxiosInstance } from 'axios';

class CustomAxiosWrapper {
  private readonly axiosInstance: AxiosInstance;

  constructor(axiosInstance: AxiosInstance) {
    this.axiosInstance = axiosInstance;
  }

  public async get<ResponseType>(_p0: number, _p1: { id: any; "": any; }, url: string): Promise<ResponseType> {
    const response = await this.axiosInstance.get(url);
    return response.data as ResponseType;
  }

  public async post<RequestType, ResponseType>(
    url: string,
    data: RequestType
  ): Promise<ResponseType> {
    const response = await this.axiosInstance.post(url, data);
    return response.data as ResponseType;
  }

  public async put<RequestType, ResponseType>(
    url: string,
    data: RequestType
  ): Promise<ResponseType> {
    const response = await this.axiosInstance.put(url, data);
    return response.data as ResponseType;
  }

  public async delete<ResponseType>(url: string): Promise<ResponseType> {
    const response = await this.axiosInstance.delete(url);
    return response.data as ResponseType;
  }

  public async formData<ResponseType>(url: string, formData: FormData): Promise<ResponseType> {
    const response = await this.axiosInstance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data as ResponseType;
  }
}

export const useApi = () => {
  const customAxios = new CustomAxiosWrapper(
    axios.create({
      baseURL: '/api',
      // headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
  );

  return customAxios;
};