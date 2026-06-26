import api from '../api/axiosInstance'

export const getDashboard = () => api.get('/dashboard')
