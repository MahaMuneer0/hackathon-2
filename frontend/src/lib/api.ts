import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/v1';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// // Response interceptor to handle token refresh
// apiClient.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         const refreshToken = localStorage.getItem('refresh_token');
//         if (!refreshToken) {
//           throw new Error('No refresh token available');
//         }

//         const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
//           refresh_token: refreshToken,
//         });

//         const { access_token } = response.data;
//         localStorage.setItem('access_token', access_token);

//         // Retry original request with new token
//         originalRequest.headers.Authorization = `Bearer ${access_token}`;
//         return apiClient(originalRequest);
//       } catch (refreshError) {
//         // If refresh fails, redirect to login
//         localStorage.removeItem('access_token');
//         localStorage.removeItem('refresh_token');
//         window.location.href = '/login';
//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   }
// );
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken =
          typeof window !== 'undefined'
            ? localStorage.getItem('refresh_token')
            : null;

        if (!refreshToken) throw new Error('No refresh token');

        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refresh_token: refreshToken }
        );

        // Backend returns RefreshTokenResponse: {access_token, token_type}
        const { access_token } = response.data;

        localStorage.setItem('access_token', access_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);


export default apiClient;

// Authentication API functions
export const authAPI = {
  signup: (userData: {
    email: string;
    username: string;
    password: string;
    first_name?: string;
    last_name?: string;
  }) => apiClient.post('/auth/signup', userData),

  login: (credentials: { email_or_username: string; password: string }) =>
    apiClient.post('/auth/login', credentials),

  logout: () => apiClient.post('/auth/logout'),

  getMe: () => apiClient.get('/auth/me'),

  refresh: (refreshToken: string) =>
    axios.post(`${API_BASE_URL}/auth/refresh`, { refresh_token: refreshToken }),
};

// Task API functions
export const taskAPI = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    sort?: string;
    search?: string;
  }) => apiClient.get('/tasks', { params }),

  getById: (id: string) => apiClient.get(`/tasks/${id}`),

  create: (taskData: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    due_date?: string;
  }) => apiClient.post('/tasks', taskData),

  update: (id: string, taskData: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    due_date?: string;
    completed_at?: string;
  }) => apiClient.put(`/tasks/${id}`, taskData),

  complete: (id: string) => apiClient.patch(`/tasks/${id}/complete`),

  uncomplete: (id: string) => apiClient.patch(`/tasks/${id}/uncomplete`),

  delete: (id: string) => apiClient.delete(`/tasks/${id}`),
};