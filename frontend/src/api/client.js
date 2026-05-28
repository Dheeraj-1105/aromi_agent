import axios from 'axios'
import useAuth from '../store/useAuth'

/**
 * Axios instance with automatic JWT injection.
 * The base URL comes from env so we never hardcode it.
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — inject JWT from Zustand store
apiClient.interceptors.request.use((config) => {
  const token = useAuth.getState().getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor — handle 401 by logging out
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuth.getState().logout()
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export const getWorkoutPlan = () => apiClient.get('/profile').then((r) => r.data)
export const getNutritionPlan = () => apiClient.get('/profile').then((r) => r.data)
export const getProgressData = () => apiClient.get('/progress').then((r) => r.data)
export const updateProfile = (data) => apiClient.put('/profile', data).then((r) => r.data)

export default apiClient
