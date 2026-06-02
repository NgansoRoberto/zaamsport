import { useState, useEffect, useCallback } from 'react';
import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';
import AdminSidebar from '../../components/Admin/Adminsidebar';
import Statistique from '../../components/Admin/Statistique';
import ListeUtilisateur from '../../components/Admin/ListeUtilisateur';
import SoumisCentre from '../../components/Admin/SoumisCentre';
import ToutLescentre from '../../components/Admin/ToutLescentre';
import { apiFetch } from '../../hooks/API';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('stats');
  const [users, setUsers] = useState([]);
  const [centers, setCenters] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    approvedCenters: 0,
    pendingCenters: 0,
    totalCenters: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const updateStats = (usersList, centersList) => {
    setStats({
      totalUsers: usersList.length,
      totalCenters: centersList.length,
      approvedCenters: centersList.filter((c) => c.status === 'approved').length,
      pendingCenters: centersList.filter((c) => c.status === 'pending').length,
    });
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [usersData, centersData] = await Promise.all([
        apiFetch('/admin/users'),
        apiFetch('/admin/centers'),
      ]);
      setUsers(usersData);
      setCenters(centersData);
      updateStats(usersData, centersData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApproveCenter = async (centerId) => {
    try {
      await apiFetch(`/admin/centers/${centerId}/approve`, { method: 'PUT' });
      await fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRejectCenter = async (centerId, reason) => {
    try {
      await apiFetch(`/admin/centers/${centerId}/reject`, {
        method: 'PUT',
        body: JSON.stringify({ reason }),
      });
      await fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleBanUser = async (userId) => {
    if (!window.confirm('Bannir cet utilisateur ?')) return;
    try {
      await apiFetch(`/admin/users/${userId}/ban`, { method: 'DELETE' });
      await fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const pendingCenters = centers.filter((c) => c.status === 'pending');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Chargement...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 text-sm text-center border-b border-red-200">
          {error}
          <button type="button" onClick={fetchData} className="ml-2 underline font-medium">
            Réessayer
          </button>
        </div>
      )}
      <div className="flex flex-col lg:flex-row flex-1">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto min-w-0">
          {activeTab === 'stats' && (
            <>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
                Tableau de bord
              </h1>
              <Statistique stats={stats} />
            </>
          )}
          {activeTab === 'users' && (
            <ListeUtilisateur users={users} onBanUser={handleBanUser} />
          )}
          {activeTab === 'pending' && (
            <SoumisCentre
              centers={pendingCenters}
              onApprove={handleApproveCenter}
              onReject={handleRejectCenter}
            />
          )}
          {activeTab === 'all' && (
            <ToutLescentre
              centers={centers}
              onEdit={(center) => console.log('Edit', center)}
              onDelete={(id) => console.log('Delete', id)}
            />
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default AdminDashboard;
