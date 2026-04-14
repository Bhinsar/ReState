import axios, {AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse, AxiosRequestConfig} from 'axios';
import {refresh} from "next/dist/server/web/spec-extension/revalidate";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface PageMeta {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

export interface ApiResponse<T> {
    success: boolean;
    status: number;
    message: string;
    data: T;
    pagination?: PageMeta;
    timestamp: string;
}

export class ApiError extends Error {
    constructor(public message: string, public status: number) {
        super(message);
        this.name = 'ApiError';
    }
}

let isRefreshing = false;
let refreshQueue: Array<() => void> = [];

const processQueue = () => {
    refreshQueue.forEach((cb) => cb());
    refreshQueue = [];
};


export interface CustomAxiosInstance extends AxiosInstance {
    get<T = any, R = ApiResponse<T>, D = any>(
        url: string,
        config?: AxiosRequestConfig<D>
    ): Promise<R>;
    delete<T = any, R = ApiResponse<T>, D = any>(
        url: string,
        config?: AxiosRequestConfig<D>
    ): Promise<R>;
    post<T = any, R = ApiResponse<T>, D = any>(
        url: string,
        data?: D,
        config?: AxiosRequestConfig<D>
    ): Promise<R>;
    put<T = any, R = ApiResponse<T>, D = any>(
        url: string,
        data?: D,
        config?: AxiosRequestConfig<D>
    ): Promise<R>;
    patch<T = any, R = ApiResponse<T>, D = any>(
        url: string,
        data?: D,
        config?: AxiosRequestConfig<D>
    ): Promise<R>;
}

const api: CustomAxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
}) as CustomAxiosInstance;

api.interceptors.response.use(
    (response) => response.data,
    async (error: AxiosError<ApiResponse<unknown>>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve) => {
                    refreshQueue.push(() => {
                        resolve(api(originalRequest));
                    });
                });
            }
            originalRequest._retry = true;
            isRefreshing = true;

            try{
                const {data} = await axios.post<ApiResponse<null>>(
                    `${BASE_URL}/auth/refresh`,
                    {withCredentials: true},
                )

                isRefreshing = false;
                processQueue();

                return api(originalRequest);
            }catch(error) {
                isRefreshing = false;
                refreshQueue = [];
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
                return Promise.reject(new ApiError('Session expired. Please login again.', 401));
            }
        }
        const message = error.response?.data?.message ?? 'Something went wrong';
        const status  = error.response?.status ?? 500;
        return Promise.reject(new ApiError(message, status));
    }
)

