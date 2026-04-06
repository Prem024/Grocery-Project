const StatCard = ({ title, value, subtitle, icon: Icon, gradient, trend }) => {
  return (
    <div className="card hover:border-gray-700 transition-colors duration-200 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`stat-icon w-12 h-12 ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-200`}>
          <Icon size={22} className="text-white" />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend >= 0 ? 'text-green-400 bg-green-900/30' : 'text-red-400 bg-red-900/30'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div>
        <p className="text-3xl font-bold text-white mb-0.5">{value}</p>
        <p className="text-sm font-medium text-gray-300">{title}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}

export default StatCard
