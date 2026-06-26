import api from '../api/axiosInstance'

export const getProductInit = (params) => api.get('/products/init', { params })
export const getProducts = (params) => api.get('/products', { params })
export const getProduct = (id) => api.get(`/products/${id}`)
export const createProduct = (data) => api.post('/products', data)
export const updateProduct = (id, data) => api.put(`/products/${id}`, data)
export const deleteProduct = (id) => api.delete(`/products/${id}`)
export const getLowStockProducts = () => api.get('/products/low-stock')
