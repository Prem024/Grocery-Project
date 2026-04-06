import { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Plus, Search, Edit2, Trash2, Filter } from 'lucide-react'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../api/productApi'
import { getCategories } from '../../api/categoryApi'
import { getSuppliers } from '../../api/supplierApi'
import { setProducts, addProduct, updateProduct as editProduct, removeProduct } from '../../store/slices/productSlice'
import Modal from '../../components/UI/Modal'
import Loader from '../../components/UI/Loader'
import Pagination from '../../components/UI/Pagination'
import ConfirmDialog from '../../components/UI/ConfirmDialog'
import { formatCurrency, formatDate, getStockStatus } from '../../utils/helpers'
import { useDebounce } from '../../hooks/useDebounce'

const Products = () => {
  const dispatch = useDispatch()
  const { items: products, total, pages, loading } = useSelector((s) => s.products)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const debouncedSearch = useDebounce(search, 400)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const fetchProducts = useCallback(async () => {
    try {
      const res = await getProducts({ search: debouncedSearch, category: catFilter, page, limit: 10 })
      dispatch(setProducts(res.data))
    } catch (e) { toast.error('Failed to fetch products') }
  }, [debouncedSearch, catFilter, page, dispatch])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  useEffect(() => {
    Promise.all([getCategories({ limit: 100 }), getSuppliers({ limit: 100 })]).then(([c, s]) => {
      setCategories(c.data.data)
      setSuppliers(s.data.data)
    })
  }, [])

  const openAdd = () => { setEditing(null); reset({}); setModalOpen(true) }
  const openEdit = (p) => {
    setEditing(p)
    reset({
      name: p.name, sku: p.sku, category: p.category?._id, supplier: p.supplier?._id,
      price: p.price, quantity: p.quantity, minStock: p.minStock, unit: p.unit,
      description: p.description, expiryDate: p.expiryDate ? p.expiryDate.split('T')[0] : '',
    })
    setModalOpen(true)
  }

  const onSubmit = async (data) => {
    try {
      setSaving(true)
      if (editing) {
        const res = await updateProduct(editing._id, data)
        dispatch(editProduct(res.data.data))
        toast.success('Product updated!')
      } else {
        const res = await createProduct(data)
        dispatch(addProduct(res.data.data))
        toast.success('Product created!')
      }
      setModalOpen(false)
      fetchProducts()
    } catch (e) { toast.error(e.response?.data?.message || 'Error saving product') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      setDeleteLoading(true)
      await deleteProduct(deleteTarget._id)
      dispatch(removeProduct(deleteTarget._id))
      toast.success('Product deleted')
      setDeleteTarget(null)
      fetchProducts()
    } catch (e) { toast.error('Failed to delete') }
    finally { setDeleteLoading(false) }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Products</h2>
          <p className="section-subtitle">{total} products total</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus size={16} /> Add Product</button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="input-field pl-10" />
        </div>
        <div className="relative">
          <Filter size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <select value={catFilter} onChange={(e) => { setCatFilter(e.target.value); setPage(1) }} className="input-field pl-10 pr-8 appearance-none min-w-[160px]">
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Loader /></div>
        ) : products.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-12">No products found</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50 border-b border-gray-800">
                  <tr>
                    {['Name / SKU', 'Category', 'Supplier', 'Price', 'Stock', 'Status', 'Expiry', 'Actions'].map((h) => (
                      <th key={h} className="table-header">{h}</th>
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
                          <p className="text-gray-500 text-xs">{p.sku}</p>
                        </td>
                        <td className="table-cell">{p.category?.name || '—'}</td>
                        <td className="table-cell">{p.supplier?.name || '—'}</td>
                        <td className="table-cell font-medium text-white">{formatCurrency(p.price)}</td>
                        <td className="table-cell">
                          <span className="font-semibold text-white">{p.quantity}</span>
                          <span className="text-gray-500 text-xs ml-1">{p.unit}</span>
                        </td>
                        <td className="table-cell"><span className={status.className}>{status.label}</span></td>
                        <td className="table-cell text-gray-400">{formatDate(p.expiryDate)}</td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-900/20 rounded-lg transition-colors"><Edit2 size={14} /></button>
                            <button onClick={() => setDeleteTarget(p)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pages={pages} onPage={setPage} />
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'Add Product'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label-text">Product Name *</label>
              <input className={`input-field ${errors.name ? 'border-red-500' : ''}`} placeholder="e.g. Full Cream Milk 1L" {...register('name', { required: 'Name required' })} />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label-text">SKU</label>
              <input className="input-field" placeholder="Auto-generated if empty" {...register('sku')} />
            </div>
            <div>
              <label className="label-text">Category *</label>
              <select className={`input-field ${errors.category ? 'border-red-500' : ''}`} {...register('category', { required: 'Category required' })}>
                <option value="">Select category</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category.message}</p>}
            </div>
            <div>
              <label className="label-text">Supplier</label>
              <select className="input-field" {...register('supplier')}>
                <option value="">Select supplier</option>
                {suppliers.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label-text">Price (₹) *</label>
              <input type="number" step="0.01" className={`input-field ${errors.price ? 'border-red-500' : ''}`} {...register('price', { required: 'Price required', min: 0 })} />
              {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <label className="label-text">Quantity *</label>
              <input type="number" className={`input-field ${errors.quantity ? 'border-red-500' : ''}`} {...register('quantity', { required: 'Quantity required', min: 0 })} />
              {errors.quantity && <p className="text-red-400 text-xs mt-1">{errors.quantity.message}</p>}
            </div>
            <div>
              <label className="label-text">Min Stock</label>
              <input type="number" className="input-field" defaultValue={10} {...register('minStock')} />
            </div>
            <div>
              <label className="label-text">Unit</label>
              <input className="input-field" placeholder="pcs, kg, litre..." {...register('unit')} />
            </div>
            <div>
              <label className="label-text">Expiry Date</label>
              <input type="date" className="input-field" {...register('expiryDate')} />
            </div>
            <div>
              <label className="label-text">Description</label>
              <input className="input-field" placeholder="Optional description" {...register('description')} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? <Loader size="sm" /> : null}
              {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} message={`Delete "${deleteTarget?.name}"?`} />
    </div>
  )
}

export default Products
