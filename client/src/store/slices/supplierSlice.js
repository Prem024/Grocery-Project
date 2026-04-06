import { createSlice } from '@reduxjs/toolkit'

const supplierSlice = createSlice({
  name: 'suppliers',
  initialState: { items: [], total: 0, pages: 1, loading: false, error: null },
  reducers: {
    setSuppliers(state, action) {
      state.items = action.payload.data
      state.total = action.payload.total
      state.pages = action.payload.pages
    },
    addSupplier(state, action) { state.items.unshift(action.payload) },
    updateSupplier(state, action) {
      const idx = state.items.findIndex((s) => s._id === action.payload._id)
      if (idx !== -1) state.items[idx] = action.payload
    },
    removeSupplier(state, action) {
      state.items = state.items.filter((s) => s._id !== action.payload)
    },
    setLoading(state, action) { state.loading = action.payload },
    setError(state, action) { state.error = action.payload },
  },
})

export const { setSuppliers, addSupplier, updateSupplier, removeSupplier, setLoading, setError } = supplierSlice.actions
export default supplierSlice.reducer
