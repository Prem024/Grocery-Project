import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'

// Custom Hook & APIs
import { useProducts } from '../../hooks/useProducts'
import { createProduct, updateProduct, deleteProduct } from '../../services/productApi'

// UI Components
import Modal from '../../components/UI/Modal'
import Loader from '../../components/UI/Loader'
import ConfirmDialog from '../../components/UI/ConfirmDialog'
import SkeletonCard from '../../components/UI/SkeletonCard'

// Modular Components
import StatisticsCards from '../../components/products/StatisticsCards'
import ProductFilter from '../../components/products/ProductFilter'
import ProductTable from '../../components/products/ProductTable'
import Pagination from '../../components/products/Pagination'
import CategorySelect from '../../components/products/CategorySelect'
import SupplierSelect from '../../components/products/SupplierSelect'

const ProductPage = () => {
  const {
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
    setPage,
    refetch,
  } = useProducts()

  // Form & Modals State
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  const openAdd = () => {
    setEditing(null)
    reset({})
    setModalOpen(true)
  }

  const openEdit = (product) => {
    setEditing(product)
    reset({
      name: product.name,
      sku: product.sku,
      category: product.category?._id,
      supplier: product.supplier?._id,
      price: product.price,
      quantity: product.quantity,
      minStock: product.minStock,
      unit: product.unit,
      description: product.description,
      expiryDate: product.expiryDate ? product.expiryDate.split('T')[0] : '',
    })
    setModalOpen(true)
  }

  const onSubmit = async (data) => {
    try {
      setSaving(true)
      if (editing) {
        await updateProduct(editing._id, data)
        toast.success('Product updated successfully!')
      } else {
        await createProduct(data)
        toast.success('Product created successfully!')
      }
      setModalOpen(false)
      refetch()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error saving product')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      setDeleteLoading(true)
      await deleteProduct(deleteTarget._id)
      toast.success('Product deleted successfully')
      setDeleteTarget(null)
      refetch()
    } catch (e) {
      toast.error('Failed to delete product')
    } finally {
      setDeleteLoading(false)
    }
  }

  // Handle page skeletons when first loading
  if (loading && !products.length) {
    return (
      <div className="space-y-6 animate-fade-in py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="card h-96 flex items-center justify-center bg-gray-900/40 border-gray-800">
          <Loader />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="page-title text-2xl sm:text-3xl font-bold text-white">Product Catalog</h2>
          <p className="section-subtitle text-sm text-gray-400 mt-1">
            {pagination.total} products registered in inventory
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Global Stock Stats */}
      <StatisticsCards statistics={statistics} />

      {/* Filter and Sorting Options */}
      <ProductFilter
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        supplier={supplier}
        setSupplier={setSupplier}
        status={status}
        setStatus={setStatus}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        categories={categories}
        suppliers={suppliers}
      />

      {/* Product List Table */}
      <div className="card p-0 overflow-hidden bg-gray-900/40 border border-gray-800 relative">
        {loading && (
          <div className="absolute inset-0 bg-gray-950/40 backdrop-blur-[1px] flex items-center justify-center z-10 transition-opacity">
            <Loader />
          </div>
        )}

        <ProductTable
          products={products}
          onEdit={openEdit}
          onDelete={setDeleteTarget}
        />

        <Pagination
          pagination={pagination}
          onPageChange={setPage}
        />
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Product' : 'Add New Product'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label-text block text-sm font-medium text-gray-300 mb-1.5">
                Product Name *
              </label>
              <input
                className={`input-field w-full ${errors.name ? 'border-red-500' : ''}`}
                placeholder="e.g. Full Cream Milk 1L"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label-text block text-sm font-medium text-gray-300 mb-1.5">SKU</label>
              <input
                className="input-field w-full"
                placeholder="Auto-generated if empty"
                {...register('sku')}
              />
            </div>

            <div>
              <label className="label-text block text-sm font-medium text-gray-300 mb-1.5">
                Category *
              </label>
              <CategorySelect
                register={register}
                name="category"
                required="Category is required"
                categories={categories}
                className={errors.category ? 'border-red-500' : ''}
              />
              {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category.message}</p>}
            </div>

            <div>
              <label className="label-text block text-sm font-medium text-gray-300 mb-1.5">
                Supplier
              </label>
              <SupplierSelect
                register={register}
                name="supplier"
                suppliers={suppliers}
              />
            </div>

            <div>
              <label className="label-text block text-sm font-medium text-gray-300 mb-1.5">
                Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                className={`input-field w-full ${errors.price ? 'border-red-500' : ''}`}
                placeholder="0.00"
                {...register('price', {
                  required: 'Price is required',
                  min: { value: 0, message: 'Price cannot be negative' },
                })}
              />
              {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price.message}</p>}
            </div>

            <div>
              <label className="label-text block text-sm font-medium text-gray-300 mb-1.5">
                Initial Stock *
              </label>
              <input
                type="number"
                className={`input-field w-full ${errors.quantity ? 'border-red-500' : ''}`}
                placeholder="0"
                {...register('quantity', {
                  required: 'Quantity is required',
                  min: { value: 0, message: 'Quantity cannot be negative' },
                })}
              />
              {errors.quantity && <p className="text-red-400 text-xs mt-1">{errors.quantity.message}</p>}
            </div>

            <div>
              <label className="label-text block text-sm font-medium text-gray-300 mb-1.5">
                Minimum Stock
              </label>
              <input
                type="number"
                className="input-field w-full"
                defaultValue={10}
                {...register('minStock', {
                  min: { value: 0, message: 'Minimum stock cannot be negative' },
                })}
              />
            </div>

            <div>
              <label className="label-text block text-sm font-medium text-gray-300 mb-1.5">Unit</label>
              <input
                className="input-field w-full"
                placeholder="pcs, kg, litre..."
                {...register('unit')}
              />
            </div>

            <div>
              <label className="label-text block text-sm font-medium text-gray-300 mb-1.5">
                Expiry Date
              </label>
              <input type="date" className="input-field w-full text-white" {...register('expiryDate')} />
            </div>

            <div>
              <label className="label-text block text-sm font-medium text-gray-300 mb-1.5">
                Description
              </label>
              <input
                className="input-field w-full"
                placeholder="Optional description"
                {...register('description')}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-secondary flex-1 justify-center"
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
              {saving && <Loader size="sm" className="mr-2" />}
              {saving ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
      />
    </div>
  )
}

export default ProductPage
