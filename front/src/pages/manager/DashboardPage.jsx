import { useState, useEffect, useCallback } from 'react';
import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';
import Button from '../../components/common/Button';
import CenterTable from '../../components/Manager/CenterTable';
import CenterFormModal from '../../components/Manager/CenterFormModal';
import { apiFetch } from '../../hooks/API';

function DashboardPage() {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState(null);

  const fetchCenters = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/manager/centers');
      setCenters(data);
    } catch (err) {
      alert(err.message || 'Impossible de charger vos centres');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCenters();
  }, [fetchCenters]);

  const handleSaveCenter = async (formDataToSend) => {
    try {
      let endpoint = '/manager/centers';
      let method = 'POST';
      if (editingCenter) {
        endpoint += `/${editingCenter.id}`;
        method = 'PUT';
      }
      await apiFetch(endpoint, { method, body: formDataToSend });
      await fetchCenters();
      setIsModalOpen(false);
      setEditingCenter(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (center) => {
    setEditingCenter(center);
    setIsModalOpen(true);
  };

  const handleDelete = async (centerId) => {
    if (!window.confirm('Supprimer définitivement ce centre ?')) return;
    try {
      await apiFetch(`/manager/centers/${centerId}`, { method: 'DELETE' });
      await fetchCenters();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Mes centres</h1>
          <Button
            onClick={() => {
              setEditingCenter(null);
              setIsModalOpen(true);
            }}
            className="w-full sm:w-auto"
          >
            + Ajouter un centre
          </Button>
        </div>
        {loading ? (
          <div className="text-center py-12 text-gray-500">Chargement...</div>
        ) : (
          <div className="overflow-x-auto">
            <CenterTable centers={centers} onEdit={handleEdit} onDelete={handleDelete} />
          </div>
        )}
        <CenterFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingCenter(null);
          }}
          onSubmit={handleSaveCenter}
          initialData={editingCenter}
        />
      </main>
      <Footer />
    </div>
  );
}

export default DashboardPage;
