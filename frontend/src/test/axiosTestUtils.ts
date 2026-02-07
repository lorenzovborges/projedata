import type {
  AxiosRequestHeaders,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

export function buildAxiosResponse<T>(
  data: T,
  status = 200,
  statusText = 'OK'
): AxiosResponse<T> {
  return {
    data,
    status,
    statusText,
    headers: {},
    config: {
      headers: {} as AxiosRequestHeaders,
    } as InternalAxiosRequestConfig,
  };
}
