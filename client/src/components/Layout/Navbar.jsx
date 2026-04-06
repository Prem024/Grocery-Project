import { Menu, Bell } from 'lucide-react'
import { useSelector } from 'react-redux'

const Navbar = ({ onMenuClick }) => {
  const { user } = useSelector((s) => s.auth)

  return (
    <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-10">
      <button
        onClick={onMenuClick}
        className="lg:hidden text-gray-400 hover:text-white p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
      >
        <Menu size={22} />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <button className="relative text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-lg transition-colors">
          <Bell size={20} />
        </button>
        <div className="h-8 w-px bg-gray-700" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full gradient-green flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <span className="hidden sm:block text-sm font-medium text-gray-300">{user?.name}</span>
        </div>
      </div>
    </header>
  )
}

export default Navbar
