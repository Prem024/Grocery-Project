import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import productReducer from './slices/productSlice'
import categoryReducer from './slices/categorySlice'
import supplierReducer from './slices/supplierSlice'
import inventoryReducer from './slices/inventorySlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    categories: categoryReducer,
    suppliers: supplierReducer,
    inventory: inventoryReducer,
  },
})
