import { useNavigate } from 'react-router-dom';
import { Users, Dumbbell, Clock, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '../../Contexts/AuthContext';

function AdminSidebar({ activeTab, onTabChange }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { id: 'stats', label: 'Statistiques', icon: BarChart3 },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'pending', label: 'Centres en attente', icon: Clock },
    { id: 'all', label: 'Tous les centres', icon: Dumbbell },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="w-full lg:w-64 bg-gray-900 text-white flex flex-col shrink-0">
      <div className="p-4 sm:p-5 border-b border-gray-800">
        <h1 className="text-lg sm:text-xl font-bold">Admin</h1>
        <p className="text-xs text-gray-400">JantSport</p>
      </div>
      <nav className="flex lg:flex-col gap-1 p-2 sm:p-4 overflow-x-auto lg:overflow-visible">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onTabChange(item.id)}
            className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-lg transition whitespace-nowrap text-sm sm:text-base ${
              activeTab === item.id ? 'bg-red-600' : 'hover:bg-gray-800'
            }`}
          >
            <item.icon size={18} className="shrink-0" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-800 mt-auto hidden lg:block">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 text-gray-400 hover:text-white w-full"
        >
          <LogOut size={18} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
