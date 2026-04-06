import { createSlice } from '@reduxjs/toolkit'

const categorySlice = createSlice({
  name: 'categories',
  initialState: { items: [], loading: false, error: null },
  reducers: {
    setCategories(state, action) { state.items = action.payload.data },
    addCategory(state, action) { state.items.unshift(action.payload) },
    updateCategory(state, action) {
      const idx = state.items.findIndex((c) => c._id === action.payload._id)
      if (idx !== -1) state.items[idx] = action.payload
    },
    removeCategory(state, action) {
      state.items = state.items.filter((c) => c._id !== action.payload)
    },
    setLoading(state, action) { state.loading = action.payload },
    setError(state, action) { state.error = action.payload },
  },
})

export const { setCategories, addCategory, updateCategory, removeCategory, setLoading, setError } = categorySlice.actions
export default categorySlice.reducer
