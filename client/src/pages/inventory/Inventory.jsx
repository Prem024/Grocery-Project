import { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Plus, Search, TrendingUp, TrendingDown, Filter } from 'lucide-react'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'
import { getTransactions, createTransaction } from '../../api/inventoryApi'
import { getProducts } from '../../api/productApi'
import { setTransactions, addTransaction } from '../../store/slices/inventorySlice'
import Modal from '../../components/UI/Modal'
import Loader from '../../components/UI/Loader'
import Pagination from '../../components/UI/Pagination'
import { formatDateTime } from '../../utils/helpers'

const Inventory = () => {
  const dispatch = useDispatch()
  const { items, total, pages, loading } = useSelector((s) => s.inventory)
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState('')
  const [products, setProducts] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState('in')
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await getTransactions({ type: typeFilter, page, limit: 15 })
      dispatch(setTransactions(res.data))
    } catch (e) { toast.error('Failed to load transactions') }
  }, [typeFilter, page, dispatch])

  useEffect(() => { fetchTransactions() }, [fetchTransactions])

  useEffect(() => {
    getProducts({ limit: 200 }).then((res) => setProducts(res.data.data)).catch(() => {})
  }, [])

  const openModal = (type) => { setModalType(type); reset({ type }); setModalOpen(true) }

  const onSubmit = async (data) => {
    try {
      setSaving(true)
      const res = await createTransaction({ ...data, type: modalType, quantity: Number(data.quantity) })
      dispatch(addTransaction(res.data.data))
      toast.success(res.data.message)
      setModalOpen(false)
      fetchTransactions()
    } catch (e) { toast.error(e.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Inventory</h2>
          <p className="section-subtitle">Stock In / Stock Out Transactions</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => openModal('in')} className="btn-primary">
            <TrendingUp size={16} />Stock In
          </button>
          <button onClick={() => openModal('out')} className="btn-danger">
            <TrendingDown size={16} />Stock Out
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card flex items-center gap-3 py-4">
          <div className="w-10 h-10 rounded-xl bg-green-900/30 border border-green-800 flex items-center justify-center">
            <TrendingUp size={18} className="text-green-400" />
          </div>
          <div>
            <p className="text-gray-400 text-xs">Total Transactions</p>
            <p className="text-white font-bold text-xl">{total}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3 py-4">
          <div className="w-10 h-10 rounded-xl bg-blue-900/30 border border-blue-800 flex items-center justify-center">
            <Filter size={18} className="text-blue-400" />
          </div>
          <div>
            <p className="text-gray-400 text-xs">Filtered by</p>
            <p className="text-white font-bold text-sm">{typeFilter || 'All Types'}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }} className="input-field max-w-[160px]">
          <option value="">All Types</option>
          <option value="in">Stock In</option>
          <option value="out">Stock Out</option>
        </select>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Loader /></div>
        ) : items.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-12">No transactions yet. Start by adding stock!</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50 border-b border-gray-800">
                  <tr>{['Type', 'Product', 'Quantity', 'Note', 'Performed By', 'Date'].map((h) => <th key={h} className="table-header">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {items.map((tx) => (
                    <tr key={tx._id} className="table-row">
                      <td className="table-cell">
                        <span className={`flex items-center gap-1.5 font-semibold text-sm ${tx.type === 'in' ? 'text-green-400' : 'text-red-400'}`}>
                          {tx.type === 'in' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          {tx.type === 'in' ? 'Stock In' : 'Stock Out'}
                        </span>
                      </td>
                      <td className="table-cell">
                        <p className="text-white font-medium">{tx.product?.name}</p>
                        <p className="text-gray-500 text-xs">{tx.product?.sku}</p>
                      </td>
                      <td className="table-cell">
                        <span className={`font-bold text-base ${tx.type === 'in' ? 'text-green-400' : 'text-red-400'}`}>
                          {tx.type === 'in' ? '+' : '-'}{tx.quantity}
                        </span>
                      </td>
                      <td className="table-cell text-gray-400">{tx.note || '—'}</td>
                      <td className="table-cell text-gray-400">{tx.performedBy?.name || '—'}</td>
                      <td className="table-cell text-gray-400">{formatDateTime(tx.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pages={pages} onPage={setPage} />
          </>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalType === 'in' ? '📦 Stock In' : '📤 Stock Out'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label-text">Product *</label>
            <select className={`input-field ${errors.product ? 'border-red-500' : ''}`} {...register('product', { required: 'Product required' })}>
              <option value="">Select product</option>
              {products.map((p) => <option key={p._id} value={p._id}>{p.name} (Stock: {p.quantity} {p.unit})</option>)}
            </select>
            {errors.product && <p className="text-red-400 text-xs mt-1">{errors.product.message}</p>}
          </div>
          <div>
            <label className="label-text">Quantity *</label>
            <input type="number" min="1" className={`input-field ${errors.quantity ? 'border-red-500' : ''}`} placeholder="e.g. 50" {...register('quantity', { required: 'Quantity required', min: { value: 1, message: 'Must be at least 1' } })} />
            {errors.quantity && <p className="text-red-400 text-xs mt-1">{errors.quantity.message}</p>}
          </div>
          <div>
            <label className="label-text">Note</label>
            <input className="input-field" placeholder="Optional note..." {...register('note')} />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={saving} className={`flex-1 justify-center ${modalType === 'in' ? 'btn-primary' : 'btn-danger'}`}>
              {saving ? <Loader size="sm" /> : null}
              {saving ? 'Processing...' : modalType === 'in' ? 'Add Stock' : 'Remove Stock'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Inventory
