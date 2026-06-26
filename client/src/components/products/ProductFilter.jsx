import React from 'react'
import { Search, Filter, ArrowUpDown } from 'lucide-react'
import CategorySelect from './CategorySelect'
import SupplierSelect from './SupplierSelect'

const ProductFilter = ({
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
  categories,
  suppliers,
}) => {
  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }

  return (
    <div className="flex flex-col lg:flex-row gap-3">
      {/* Search Bar */}
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products by name or SKU..."
          className="input-field pl-10"
        />
      </div>

      {/* Filter and Sort Options */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category Dropdown */}
        <div className="relative flex-1 sm:flex-initial">
          <Filter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <CategorySelect
            value={category}
            onChange={setCategory}
            categories={categories}
            className="pl-10 min-w-[160px]"
          />
        </div>

        {/* Supplier Dropdown */}
        <div className="relative flex-1 sm:flex-initial">
          <Filter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <SupplierSelect
            value={supplier}
            onChange={setSupplier}
            suppliers={suppliers}
            className="pl-10 min-w-[160px]"
          />
        </div>

        {/* Status Dropdown */}
        <div className="relative flex-1 sm:flex-initial">
          <Filter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input-field pl-10 min-w-[140px]"
          >
            <option value="">All Statuses</option>
            <option value="active">Active (In Stock)</option>
            <option value="inactive">Inactive (Out of Stock)</option>
            <option value="low_stock">Low Stock</option>
            <option value="in_stock">In Stock (Normal)</option>
          </select>
        </div>

        {/* Sorting Fields */}
        <div className="flex items-center gap-2 flex-1 sm:flex-initial">
          <div className="relative w-full sm:w-auto">
            <ArrowUpDown size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field pl-10 min-w-[150px]"
            >
              <option value="createdAt">Date Created</option>
              <option value="name">Product Name</option>
              <option value="sku">SKU Code</option>
              <option value="price">Product Price</option>
              <option value="quantity">Stock Quantity</option>
              <option value="expiryDate">Expiry Date</option>
            </select>
          </div>
          <button
            type="button"
            onClick={toggleSortOrder}
            className="btn-secondary h-10 w-10 flex items-center justify-center p-0 rounded-lg hover:bg-gray-800 transition-colors"
            title={`Sort ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
          >
            <ArrowUpDown size={16} className={sortOrder === 'asc' ? 'rotate-180 text-blue-400' : 'text-gray-400'} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductFilter
