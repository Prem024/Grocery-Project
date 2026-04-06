import api from './axiosInstance'

export const getTransactions = (params) => api.get('/inventory', { params })
export const createTransaction = (data) => api.post('/inventory', data)
