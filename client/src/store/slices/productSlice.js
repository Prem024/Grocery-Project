import { createSlice } from '@reduxjs/toolkit'

const productSlice = createSlice({
  name: 'products',
  initialState: { items: [], total: 0, pages: 1, loading: false, error: null },
  reducers: {
    setProducts(state, action) {
      state.items = action.payload.data
      state.total = action.payload.total
      state.pages = action.payload.pages
    },
    addProduct(state, action) {
      state.items.unshift(action.payload)
      state.total += 1
    },
    updateProduct(state, action) {
      const idx = state.items.findIndex((p) => p._id === action.payload._id)
      if (idx !== -1) state.items[idx] = action.payload
    },
    removeProduct(state, action) {
      state.items = state.items.filter((p) => p._id !== action.payload)
      state.total -= 1
    },
    setLoading(state, action) { state.loading = action.payload },
    setError(state, action) { state.error = action.payload },
  },
})

export const { setProducts, addProduct, updateProduct, removeProduct, setLoading, setError } = productSlice.actions
export default productSlice.reducer
