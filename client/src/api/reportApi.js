import api from './axiosInstance'

export const getReport = (type) => api.get('/reports', { params: { type } })
