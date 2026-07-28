import axios from 'axios';
import useAuthStore from '@/stores/useAuthStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
});

api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// JWT 만료/무효 시 로그인 상태가 localStorage에 남아 UI만 로그인처럼 보이는 걸 막는다.
// ponytail: 리프레시 토큰 없이 그냥 로그아웃 — 재발급 흐름은 토큰 만료가 실제로 성가셔지면 추가
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && useAuthStore.getState().isLoggedIn) {
      useAuthStore.getState().logout();
      window.location.replace('/');
    }
    return Promise.reject(error);
  },
);

const restClient = {
  get: async <T>(url: string, params = {}, config = {}) => {
    const response = await api.get<T>(url, { params, ...config });
    return {
      status: response.status,
      data: response.data,
    };
  },
  post: async <T>(url: string, data = {}, config = {}) => {
    const response = await api.post<T>(url, data, config);
    return {
      status: response.status,
      data: response.data,
    };
  },
  put: async <T>(url: string, data = {}, config = {}) => {
    const response = await api.put<T>(url, data, config);
    return {
      status: response.status,
      data: response.data,
    };
  },
  patch: async <T>(url: string, data = {}, config = {}) => {
    const response = await api.patch<T>(url, data, config);
    return {
      status: response.status,
      data: response.data,
    };
  },
  delete: async <T>(url: string, data = {}) => {
    const response = await api.delete<T>(url, { data });
    return {
      status: response.status,
      data: response.data,
    };
  },
};

export default restClient;
