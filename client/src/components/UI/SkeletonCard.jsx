const SkeletonCard = ({ className = '' }) => (
  <div className={`animate-pulse rounded-3xl bg-gray-900/70 p-5 ${className}`}>
    <div className="h-5 w-3/4 rounded-full bg-gray-700 mb-5" />
    <div className="space-y-3">
      <div className="h-4 rounded bg-gray-700" />
      <div className="h-4 rounded bg-gray-700 w-5/6" />
      <div className="h-4 rounded bg-gray-700 w-2/3" />
    </div>
  </div>
)

export default SkeletonCard
