import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, TrendingDown, Package, AlertTriangle, DollarSign } from 'lucide-react'
import { toast } from 'react-toastify'
import { getReport } from '../../api/reportApi'
import Loader from '../../components/UI/Loader'
import { formatCurrency } from '../../utils/helpers'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line
} from 'recharts'

const TYPES = ['daily', 'weekly', 'monthly']

const Reports = () => {
  const [period, setPeriod] = useState('daily')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchReport = async (type) => {
    try {
      setLoading(true)
      const res = await getReport(type)
      setData(res.data.data)
    } catch (e) { toast.error('Failed to load report') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchReport(period) }, [period])

  const trendChartData = data?.trend?.reduce((acc, item) => {
    const existing = acc.find((d) => d.date === item._id.date)
    if (existing) {
      existing[item._id.type] = item.total
    } else {
      acc.push({ date: item._id.date, [item._id.type]: item.total })
    }
    return acc
  }, []) || []

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Reports</h2>
          <p className="section-subtitle">Stock movement analytics</p>
        </div>
        {/* Period Tabs */}
        <div className="flex bg-gray-800 rounded-xl p-1 gap-1">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setPeriod(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all duration-200
                ${period === t ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader size="lg" /></div>
      ) : data ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl gradient-green flex items-center justify-center"><Package size={16} className="text-white" /></div>
                <p className="text-gray-400 text-sm">Total Products</p>
              </div>
              <p className="text-3xl font-bold text-white">{data.summary.totalProducts}</p>
            </div>
            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl gradient-orange flex items-center justify-center"><AlertTriangle size={16} className="text-white" /></div>
                <p className="text-gray-400 text-sm">Low Stock</p>
              </div>
              <p className="text-3xl font-bold text-white">{data.summary.lowStockCount}</p>
            </div>
            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl gradient-blue flex items-center justify-center"><TrendingUp size={16} className="text-white" /></div>
                <p className="text-gray-400 text-sm">Stock In ({period})</p>
              </div>
              <p className="text-3xl font-bold text-green-400">{data.summary.stockIn.totalQuantity}</p>
              <p className="text-xs text-gray-500">{data.summary.stockIn.transactions} txn</p>
            </div>
            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl gradient-red flex items-center justify-center"><TrendingDown size={16} className="text-white" /></div>
                <p className="text-gray-400 text-sm">Stock Out ({period})</p>
              </div>
              <p className="text-3xl font-bold text-red-400">{data.summary.stockOut.totalQuantity}</p>
              <p className="text-xs text-gray-500">{data.summary.stockOut.transactions} txn</p>
            </div>
          </div>

          {/* Stock Value */}
          <div className="card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gradient-purple flex items-center justify-center"><DollarSign size={20} className="text-white" /></div>
            <div>
              <p className="text-gray-400 text-sm">Total Stock Value</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(data.summary.totalStockValue)}</p>
            </div>
          </div>

          {/* Trend Chart */}
          {trendChartData.length > 0 && (
            <div className="card">
              <h3 className="text-white font-semibold mb-4">Stock Movement Trend</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={trendChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#f9fafb' }} />
                  <Legend wrapperStyle={{ color: '#9ca3af' }} />
                  <Bar dataKey="in" name="Stock In" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="out" name="Stock Out" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top Products */}
          {data.topProducts?.length > 0 && (
            <div className="card">
              <h3 className="text-white font-semibold mb-4">Top Moved Products ({period})</h3>
              <div className="space-y-3">
                {data.topProducts.map((p, i) => (
                  <div key={p.productId} className="flex items-center gap-3">
                    <span className="text-gray-500 text-sm w-5">{i + 1}.</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-white text-sm font-medium">{p.name}</p>
                        <p className="text-primary-400 text-sm font-bold">{p.totalMoved} units</p>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-1.5">
                        <div
                          className="bg-primary-500 h-1.5 rounded-full"
                          style={{ width: `${Math.min((p.totalMoved / (data.topProducts[0]?.totalMoved || 1)) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {trendChartData.length === 0 && data.topProducts?.length === 0 && (
            <div className="card text-center py-10">
              <BarChart3 size={40} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500">No data available for the selected period.</p>
              <p className="text-gray-600 text-sm mt-1">Perform some stock transactions to see analytics here.</p>
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}

export default Reports
