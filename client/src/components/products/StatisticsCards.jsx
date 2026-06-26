import React from 'react'
import { Package, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import StatCard from '../UI/StatCard'

const StatisticsCards = ({ statistics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard
        title="Total Products"
        value={statistics?.totalProducts || 0}
        subtitle="Global inventory count"
        icon={Package}
        gradient="gradient-blue"
      />
      <StatCard
        title="Active Products"
        value={statistics?.activeProducts || 0}
        subtitle="Available in stock"
        icon={CheckCircle}
        gradient="gradient-green"
      />
      <StatCard
        title="Inactive Products"
        value={statistics?.inactiveProducts || 0}
        subtitle="Out of stock items"
        icon={XCircle}
        gradient="gradient-purple"
      />
      <StatCard
        title="Low Stock"
        value={statistics?.lowStockProducts || 0}
        subtitle="Restocking required"
        icon={AlertTriangle}
        gradient="gradient-orange"
      />
    </div>
  )
}

export default StatisticsCards
