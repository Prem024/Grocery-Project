import { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Plus, Search, Edit2, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/categoryApi'
import { setCategories, addCategory, updateCategory as editCategory, removeCategory } from '../../store/slices/categorySlice'
import Modal from '../../components/UI/Modal'
import Loader from '../../components/UI/Loader'
import ConfirmDialog from '../../components/UI/ConfirmDialog'
import { formatDate } from '../../utils/helpers'
import { useDebounce } from '../../hooks/useDebounce'

const Categories = () => {
  const dispatch = useDispatch()
  const { items, loading } = useSelector((s) => s.categories)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const debouncedSearch = useDebounce(search)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const fetchCategories = useCallback(async () => {
    try {
      const res = await getCategories({ search: debouncedSearch, limit: 100 })
      dispatch(setCategories(res.data))
    } catch (e) { toast.error('Failed to load categories') }
  }, [debouncedSearch, dispatch])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  const openAdd = () => { setEditing(null); reset({}); setModalOpen(true) }
  const openEdit = (c) => { setEditing(c); reset({ name: c.name, description: c.description }); setModalOpen(true) }

  const onSubmit = async (data) => {
    try {
      setSaving(true)
      if (editing) {
        const res = await updateCategory(editing._id, data)
        dispatch(editCategory(res.data.data)); toast.success('Category updated!')
      } else {
        const res = await createCategory(data)
        dispatch(addCategory(res.data.data)); toast.success('Category created!')
      }
      setModalOpen(false); fetchCategories()
    } catch (e) { toast.error(e.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      setDeleteLoading(true)
      await deleteCategory(deleteTarget._id)
      dispatch(removeCategory(deleteTarget._id))
      toast.success('Category deleted'); setDeleteTarget(null)
    } catch (e) { toast.error('Failed to delete') }
    finally { setDeleteLoading(false) }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Categories</h2>
          <p className="section-subtitle">Organize your products</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus size={16} />Add Category</button>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search categories..." className="input-field pl-10" />
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Loader /></div>
        ) : items.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-12">No categories found. Add one!</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-800/50 border-b border-gray-800">
              <tr>
                {['Name', 'Description', 'Created', 'Actions'].map((h) => <th key={h} className="table-header">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c._id} className="table-row">
                  <td className="table-cell font-medium text-white">{c.name}</td>
                  <td className="table-cell text-gray-400">{c.description || '—'}</td>
                  <td className="table-cell text-gray-400">{formatDate(c.createdAt)}</td>
                  <td className="table-cell">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-900/20 rounded-lg transition-colors"><Edit2 size={14} /></button>
                      <button onClick={() => setDeleteTarget(c)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label-text">Name *</label>
            <input className={`input-field ${errors.name ? 'border-red-500' : ''}`} placeholder="e.g. Dairy & Eggs" {...register('name', { required: 'Name required' })} />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label-text">Description</label>
            <textarea className="input-field min-h-[80px] resize-none" placeholder="Optional description..." {...register('description')} />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? <Loader size="sm" /> : null}{saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} message={`Delete category "${deleteTarget?.name}"?`} />
    </div>
  )
}

export default Categories
