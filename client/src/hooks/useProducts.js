import { useState, useEffect, useCallback } from 'react'
import { getProductInit } from '../services/productApi'
import { useDebounce } from './useDebounce'
import { toast } from 'react-toastify'

export const useProducts = (initialParams = {}) => {
  // Data states
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [statistics, setStatistics] = useState({
    totalProducts: 0,
    activeProducts: 0,
    inactiveProducts: 0,
    lowStockProducts: 0,
  })

  // Status states
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Query parameter states
  const [search, setSearch] = useState(initialParams.search || '')
  const [category, setCategory] = useState(initialParams.category || '')
  const [supplier, setSupplier] = useState(initialParams.supplier || '')
  const [status, setStatus] = useState(initialParams.status || '')
  const [sortBy, setSortBy] = useState(initialParams.sortBy || 'createdAt')
  const [sortOrder, setSortOrder] = useState(initialParams.sortOrder || 'desc')
  const [page, setPage] = useState(initialParams.page || 1)
  const [limit, setLimit] = useState(initialParams.limit || 10)

  // Debounce the search input to avoid redundant requests
  const debouncedSearch = useDebounce(search, 400)

  // The single optimized init API call
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getProductInit({
        search: debouncedSearch,
        category,
        supplier,
        status,
        sortBy,
        sortOrder,
        page,
        limit,
      })

      const {
        products: productData,
        categories: categoryData,
        suppliers: supplierData,
        statistics: statData,
      } = response.data.data

      setProducts(productData.rows || [])
      setPagination(productData.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 })
      setCategories(categoryData || [])
      setSuppliers(supplierData || [])
      setStatistics(statData || { totalProducts: 0, activeProducts: 0, inactiveProducts: 0, lowStockProducts: 0 })
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to initialize product page'
      setError(errMsg)
      toast.error(errMsg)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, category, supplier, status, sortBy, sortOrder, page, limit])

  // Fetch when filters or search change
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Reset page to 1 when filters change to avoid empty page issues
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, category, supplier, status])

  return {
    products,
    pagination,
    categories,
    suppliers,
    statistics,
    loading,
    error,
    search,
    setSearch,
    category,
    setCategory,
    supplier,
    setSupplier,
    status,
    setStatus,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    page,
    setPage,
    limit,
    setLimit,
    refetch: fetchProducts,
  }
}
