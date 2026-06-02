import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import Button from '../common/Button';
import { useAuth } from '../../Contexts/AuthContext';
import { getRoleDashboardPath } from '../../hooks/API';
import playstore from '../../assets/playstore.jpeg';

const navLinks = [
  { to: '/', label: 'Accueil' },
  { to: '/clubspage', label: 'Clubs' },
  { to: '/carte', label: 'Questionnaire' },
];

export default function Header() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const dashboardPath = user ? getRoleDashboardPath(user.role) : null;
  const displayLabel = user?.displayName || user?.email || 'Mon compte';

  const authBlock = loading ? (
    <span className="text-sm text-gray-400 px-3">...</span>
  ) : user ? (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-sm text-gray-800 min-w-0">
        <User size={16} className="shrink-0 text-red-600" />
        <span className="truncate font-medium">{displayLabel}</span>
      </div>
      {dashboardPath && (
        <Link to={dashboardPath} onClick={() => setMenuOpen(false)} className="w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto text-sm px-4 py-2 flex items-center justify-center gap-2">
            <LayoutDashboard size={16} />
            Mon espace
          </Button>
        </Link>
      )}
      <Button
        variant="secondary"
        onClick={handleLogout}
        className="w-full sm:w-auto text-sm px-4 py-2 flex items-center justify-center gap-2 !text-gray-700"
      >
        <LogOut size={16} />
        Déconnexion
      </Button>
    </div>
  ) : (
    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
      <Link to="/connexion" onClick={() => setMenuOpen(false)} className="w-full sm:w-auto">
        <Button variant="outline" className="w-full sm:w-auto text-sm px-4 py-2">
          Connexion
        </Button>
      </Link>
      <Link to="/inscription" onClick={() => setMenuOpen(false)} className="w-full sm:w-auto">
        <Button className="w-full sm:w-auto text-sm px-4 py-2">Inscription</Button>
      </Link>
    </div>
  );

  return (
    <header className="bg-white border-b border-gray-200 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="shrink-0 flex items-center gap-2" onClick={() => setMenuOpen(false)}>
  <img src={playstore} alt="za'amSport" className="h-8 w-auto" />
  <span className="text-lg sm:text-2xl font-bold text-red-600">
    <strong className="text-black">za'am</strong>Sport
  </span>
</Link>

          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-gray-700 hover:text-red-600 transition font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-2">{authBlock}</div>

          <button
            type="button"
            className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {menuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-gray-200 space-y-4 pb-2">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-red-600 font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            {authBlock}
          </div>
        )}
      </div>
    </header>
  );
}
