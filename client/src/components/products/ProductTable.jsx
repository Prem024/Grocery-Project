import React from 'react'
import { Edit2, Trash2 } from 'lucide-react'
import { formatCurrency, formatDate, getStockStatus } from '../../utils/helpers'

const ProductTable = ({ products, onEdit, onDelete }) => {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <p className="text-gray-400 text-lg font-medium mb-1">No products found</p>
        <p className="text-gray-500 text-sm">Try adjusting your filters or search query.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-800/50 border-b border-gray-800">
          <tr>
            {['Name / SKU', 'Category', 'Supplier', 'Price', 'Stock', 'Status', 'Expiry', 'Actions'].map((h) => (
              <th key={h} className="table-header">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const status = getStockStatus(p.quantity, p.minStock)
            return (
              <tr key={p._id} className="table-row">
                <td className="table-cell">
                  <p className="text-white font-medium">{p.name}</p>
                  <p className="text-gray-500 text-xs font-mono">{p.sku}</p>
                </td>
                <td className="table-cell">
                  <span className="bg-blue-900/20 text-blue-300 text-xs px-2.5 py-1 rounded-full border border-blue-800/30">
                    {p.category?.name || '—'}
                  </span>
                </td>
                <td className="table-cell text-gray-300">{p.supplier?.name || '—'}</td>
                <td className="table-cell font-medium text-white">{formatCurrency(p.price)}</td>
                <td className="table-cell">
                  <span className="font-semibold text-white">{p.quantity}</span>
                  <span className="text-gray-500 text-xs ml-1">{p.unit || 'pcs'}</span>
                </td>
                <td className="table-cell">
                  <span className={status.className}>{status.label}</span>
                </td>
                <td className="table-cell text-gray-400 text-sm">{formatDate(p.expiryDate)}</td>
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(p)}
                      className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                      title="Edit Product"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(p)}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all duration-200"
                      title="Delete Product"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default ProductTable
