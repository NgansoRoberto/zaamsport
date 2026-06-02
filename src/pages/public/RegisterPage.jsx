import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';
import Button from '../../components/common/Button';
import { useAuth } from '../../Contexts/AuthContext';
import { apiFetch, buildSessionFromAuthResponse, getRoleDashboardPath } from '../../hooks/API';

function RegisterPage() {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login, user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate(getRoleDashboardPath(user.role), { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (!nom.trim() || !prenom.trim()) {
      setError('Veuillez saisir votre nom et prénom');
      return;
    }

    setSubmitting(true);
    try {
      const data = await apiFetch('/register', {
        method: 'POST',
        body: JSON.stringify({ nom, prenom, email, password, role }),
      });
      login(buildSessionFromAuthResponse(data, email));
      navigate(getRoleDashboardPath(data.role));
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center bg-gray-50 py-8 sm:py-12 px-4">
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-xl sm:text-2xl font-bold text-center mb-6">Inscription</h1>
          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2 text-sm">Nom</label>
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 text-sm">Prénom</label>
                <input
                  type="text"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                  disabled={submitting}
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 text-sm">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required
                disabled={submitting}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 text-sm">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required
                disabled={submitting}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 text-sm">Confirmer le mot de passe</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required
                disabled={submitting}
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2 text-sm">Je suis :</label>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="user"
                    checked={role === 'user'}
                    onChange={() => setRole('user')}
                    className="mr-2"
                    disabled={submitting}
                  />
                  Utilisateur
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="manager"
                    checked={role === 'manager'}
                    onChange={() => setRole('manager')}
                    className="mr-2"
                    disabled={submitting}
                  />
                  Chef de centre
                </label>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Inscription...' : "S'inscrire"}
            </Button>
          </form>
          <p className="text-center text-gray-600 mt-4 text-sm">
            Déjà inscrit ?{' '}
            <Link to="/connexion" className="text-red-600 hover:underline">
              Connectez-vous
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default RegisterPage;
