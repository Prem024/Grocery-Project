const Loader = ({ size = 'md', fullScreen = false }) => {
  const sizeMap = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }
  const spinner = (
    <div className={`${sizeMap[size]} border-2 border-gray-700 border-t-primary-500 rounded-full animate-spin`} />
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-950 z-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-2 border-gray-700 border-t-primary-500 rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    )
  }
  return spinner
}

export default Loader
