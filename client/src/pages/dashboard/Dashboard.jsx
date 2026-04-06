import { useEffect, useState } from 'react'
import { Package, Tag, Truck, AlertTriangle, ArrowUpDown, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import StatCard from '../../components/UI/StatCard'
import Loader from '../../components/UI/Loader'
import { getProducts, getLowStockProducts } from '../../api/productApi'
import { getCategories } from '../../api/categoryApi'
import { getSuppliers } from '../../api/supplierApi'
import { getTransactions } from '../../api/inventoryApi'
import { formatCurrency, formatDateTime, getStockStatus } from '../../utils/helpers'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [lowStock, setLowStock] = useState([])
  const [recentTx, setRecentTx] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes, supRes, txRes, lowRes] = await Promise.all([
          getProducts({ limit: 1 }),
          getCategories({ limit: 1 }),
          getSuppliers({ limit: 1 }),
          getTransactions({ limit: 6 }),
          getLowStockProducts(),
        ])
        setStats({
          totalProducts: prodRes.data.total,
          categories: catRes.data.total,
          suppliers: supRes.data.total,
          lowStock: lowRes.data.total,
        })
        setLowStock(lowRes.data.data.slice(0, 5))
        setRecentTx(txRes.data.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Loader size="lg" /></div>

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="page-title">Dashboard</h2>
        <p className="section-subtitle">Overview of your grocery stock</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Products" value={stats?.totalProducts || 0} subtitle="Across all categories" icon={Package} gradient="gradient-green" />
        <StatCard title="Categories" value={stats?.categories || 0} subtitle="Product groups" icon={Tag} gradient="gradient-blue" />
        <StatCard title="Suppliers" value={stats?.suppliers || 0} subtitle="Active vendors" icon={Truck} gradient="gradient-purple" />
        <StatCard title="Low Stock Alerts" value={stats?.lowStock || 0} subtitle="Need restocking" icon={AlertTriangle} gradient="gradient-orange" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Low Stock Table */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-orange-400" />
            <h3 className="text-white font-semibold">Low Stock Alerts</h3>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">All products are well-stocked ✅</p>
          ) : (
            <div className="space-y-3">
              {lowStock.map((p) => {
                const status = getStockStatus(p.quantity, p.minStock)
                return (
                  <div key={p._id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                    <div>
                      <p className="text-white text-sm font-medium">{p.name}</p>
                      <p className="text-gray-500 text-xs">{p.category?.name} — Min: {p.minStock} {p.unit}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-sm">{p.quantity}</span>
                      <span className={status.className}>{status.label}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <ArrowUpDown size={16} className="text-blue-400" />
            <h3 className="text-white font-semibold">Recent Transactions</h3>
          </div>
          {recentTx.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {recentTx.map((tx) => (
                <div key={tx._id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === 'in' ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
                    {tx.type === 'in' ? <TrendingUp size={14} className="text-green-400" /> : <TrendingDown size={14} className="text-red-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{tx.product?.name}</p>
                    <p className="text-gray-500 text-xs">{formatDateTime(tx.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${tx.type === 'in' ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.type === 'in' ? '+' : '-'}{tx.quantity}
                    </p>
                    <p className="text-gray-500 text-xs capitalize">{tx.type === 'in' ? 'Stock In' : 'Stock Out'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
