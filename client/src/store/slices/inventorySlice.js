import { createSlice } from '@reduxjs/toolkit'

const inventorySlice = createSlice({
  name: 'inventory',
  initialState: { items: [], total: 0, pages: 1, loading: false, error: null },
  reducers: {
    setTransactions(state, action) {
      state.items = action.payload.data
      state.total = action.payload.total
      state.pages = action.payload.pages
    },
    addTransaction(state, action) { state.items.unshift(action.payload) },
    setLoading(state, action) { state.loading = action.payload },
    setError(state, action) { state.error = action.payload },
  },
})

export const { setTransactions, addTransaction, setLoading, setError } = inventorySlice.actions
export default inventorySlice.reducer
