import { AlertTriangle, Trash2, X } from 'lucide-react'

const ConfirmDialog = ({ isOpen, message, onConfirm, onCancel, loading }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl animate-scale-in p-6">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-red-950/50 border border-red-800 flex items-center justify-center">
            <AlertTriangle size={24} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">Confirm Delete</h3>
            <p className="text-gray-400 text-sm">{message || 'Are you sure you want to delete this item? This action cannot be undone.'}</p>
          </div>
          <div className="flex gap-3 w-full">
            <button onClick={onCancel} className="btn-secondary flex-1 justify-center">
              <X size={16} />
              Cancel
            </button>
            <button onClick={onConfirm} disabled={loading} className="btn-danger flex-1 justify-center">
              <Trash2 size={16} />
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
