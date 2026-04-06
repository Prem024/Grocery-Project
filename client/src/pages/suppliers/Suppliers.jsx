import { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Plus, Search, Edit2, Trash2, Phone, Mail } from 'lucide-react'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../../api/supplierApi'
import { setSuppliers, addSupplier, updateSupplier as editSupplier, removeSupplier } from '../../store/slices/supplierSlice'
import Modal from '../../components/UI/Modal'
import Loader from '../../components/UI/Loader'
import Pagination from '../../components/UI/Pagination'
import ConfirmDialog from '../../components/UI/ConfirmDialog'
import { formatDate } from '../../utils/helpers'
import { useDebounce } from '../../hooks/useDebounce'

const Suppliers = () => {
  const dispatch = useDispatch()
  const { items, total, pages, loading } = useSelector((s) => s.suppliers)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const debouncedSearch = useDebounce(search)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const fetchSuppliers = useCallback(async () => {
    try {
      const res = await getSuppliers({ search: debouncedSearch, page, limit: 10 })
      dispatch(setSuppliers(res.data))
    } catch (e) { toast.error('Failed to load suppliers') }
  }, [debouncedSearch, page, dispatch])

  useEffect(() => { fetchSuppliers() }, [fetchSuppliers])

  const openAdd = () => { setEditing(null); reset({}); setModalOpen(true) }
  const openEdit = (s) => {
    setEditing(s)
    reset({ name: s.name, contact: s.contact, email: s.email, phone: s.phone, address: s.address })
    setModalOpen(true)
  }

  const onSubmit = async (data) => {
    try {
      setSaving(true)
      if (editing) {
        const res = await updateSupplier(editing._id, data)
        dispatch(editSupplier(res.data.data)); toast.success('Supplier updated!')
      } else {
        const res = await createSupplier(data)
        dispatch(addSupplier(res.data.data)); toast.success('Supplier created!')
      }
      setModalOpen(false); fetchSuppliers()
    } catch (e) { toast.error(e.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      setDeleteLoading(true)
      await deleteSupplier(deleteTarget._id)
      dispatch(removeSupplier(deleteTarget._id))
      toast.success('Supplier deleted'); setDeleteTarget(null)
    } catch (e) { toast.error('Failed to delete') }
    finally { setDeleteLoading(false) }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Suppliers</h2>
          <p className="section-subtitle">{total} suppliers registered</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus size={16} />Add Supplier</button>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search suppliers..." className="input-field pl-10" />
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Loader /></div>
        ) : items.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-12">No suppliers found.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50 border-b border-gray-800">
                  <tr>{['Name', 'Contact', 'Email', 'Phone', 'Address', 'Added', 'Actions'].map((h) => <th key={h} className="table-header">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {items.map((s) => (
                    <tr key={s._id} className="table-row">
                      <td className="table-cell font-medium text-white">{s.name}</td>
                      <td className="table-cell">{s.contact || '—'}</td>
                      <td className="table-cell">
                        {s.email ? <span className="flex items-center gap-1 text-gray-400"><Mail size={12} />{s.email}</span> : '—'}
                      </td>
                      <td className="table-cell">
                        {s.phone ? <span className="flex items-center gap-1 text-gray-400"><Phone size={12} />{s.phone}</span> : '—'}
                      </td>
                      <td className="table-cell text-gray-400 max-w-[150px] truncate">{s.address || '—'}</td>
                      <td className="table-cell text-gray-400">{formatDate(s.createdAt)}</td>
                      <td className="table-cell">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(s)} className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-900/20 rounded-lg transition-colors"><Edit2 size={14} /></button>
                          <button onClick={() => setDeleteTarget(s)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pages={pages} onPage={setPage} />
          </>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Supplier' : 'Add Supplier'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label-text">Supplier Name *</label>
              <input className={`input-field ${errors.name ? 'border-red-500' : ''}`} placeholder="FreshFarm Suppliers" {...register('name', { required: 'Name required' })} />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label-text">Contact Person</label>
              <input className="input-field" placeholder="John Doe" {...register('contact')} />
            </div>
            <div>
              <label className="label-text">Email</label>
              <input type="email" className={`input-field ${errors.email ? 'border-red-500' : ''}`} placeholder="contact@supplier.com" {...register('email')} />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label-text">Phone</label>
              <input className="input-field" placeholder="9876543210" {...register('phone')} />
            </div>
            <div>
              <label className="label-text">Address</label>
              <input className="input-field" placeholder="123 Market St" {...register('address')} />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? <Loader size="sm" /> : null}{saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} message={`Delete supplier "${deleteTarget?.name}"?`} />
    </div>
  )
}

export default Suppliers
