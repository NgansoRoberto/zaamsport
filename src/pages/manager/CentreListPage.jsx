// src/pages/manager/DashboardPage.jsx
// Page réservée aux chefs de centre (rôle "manager")
// Affiche la liste de leurs centres, permet d'en ajouter, modifier, supprimer.
// Les données sont pour l'instant mockées (centersMock) mais l'intégration API est commentée.

import { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Button from '../../components/common/Button';
import CenterTable from '../../components/manager/CenterTable';
import CenterFormModal from '../../components/manager/CenterFormModal';

// Données mockées (simule une réponse API)
// Chaque centre appartient à un manager via managerId. Pour les tests, on suppose managerId = 1.
const mockCenters = [
  {
    id: 1,
    name: "FitZone Bonapriso",
    address: "Bonapriso, Douala",
    lat: 4.0589,
    lng: 9.7025,
    status: "approved", // pending, approved, rejected
    type: "Salle de sport",
    pmr: true,
    equipment: ["Cardio", "Musculation"],
    hours: { monday: "6h-22h", tuesday: "6h-22h", wednesday: "6h-22h", thursday: "6h-22h", friday: "6h-22h", saturday: "8h-20h", sunday: "8h-18h" },
    prices: { monthly: "25000", single: "5000" },
    images: ["https://example.com/image1.jpg"],
    managerId: 1,
    created_at: "2025-01-01"
  },
  {
    id: 2,
    name: "AquaFit Akwa",
    address: "Akwa, Douala",
    lat: 4.0462,
    lng: 9.6873,
    status: "pending",
    type: "Piscine",
    pmr: true,
    equipment: ["Piscine", "Sauna"],
    hours: { monday: "9h-21h", tuesday: "9h-21h", wednesday: "9h-21h", thursday: "9h-21h", friday: "9h-21h", saturday: "10h-20h", sunday: "10h-18h" },
    prices: { monthly: "35000", single: "7000" },
    images: [],
    managerId: 1,
    created_at: "2025-02-15"
  }
];

 function DashboardPage() {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState(null); // centre à modifier, null si ajout

  // Chargement des centres du manager connecté
  // À remplacer par appel API : GET /api/manager/centers
  useEffect(() => {
    // Simulation d'appel API
    const fetchCenters = async () => {
      setLoading(true);
      // ICI : remplacer par fetch réel avec le token JWT
      // const response = await fetch('/api/manager/centers', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      // const data = await response.json();
      // setCenters(data);
      setTimeout(() => {
        setCenters(mockCenters);
        setLoading(false);
      }, 500);
    };
    fetchCenters();
  }, []);

  // Fonction appelée après ajout/modification réussie
  const handleSaveCenter = (centerData) => {
    // ICI : appel API pour créer ou mettre à jour
    // Si editingCenter existe, faire PUT /api/centers/:id, sinon POST /api/centers
    // Une fois l'API répondue, recharger la liste ou mettre à jour l'état local
    if (editingCenter) {
      // Mise à jour locale (mock)
      setCenters(centers.map(c => c.id === editingCenter.id ? { ...centerData, id: editingCenter.id } : c));
    } else {
      // Ajout local (mock)
      const newCenter = { ...centerData, id: Date.now(), status: "pending", managerId: 1 };
      setCenters([...centers, newCenter]);
    }
    setIsModalOpen(false);
    setEditingCenter(null);
  };

  const handleEdit = (center) => {
    setEditingCenter(center);
    setIsModalOpen(true);
  };

  const handleDelete = async (centerId) => {
    if (window.confirm("Supprimer définitivement ce centre ?")) {
      // ICI : appel API DELETE /api/centers/:id
      setCenters(centers.filter(c => c.id !== centerId));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Mes centres de remise en forme</h1>
          <Button onClick={() => { setEditingCenter(null); setIsModalOpen(true); }}>
            + Ajouter un centre
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">Chargement...</div>
        ) : (
          <CenterTable centers={centers} onEdit={handleEdit} onDelete={handleDelete} />
        )}

        {/* Modal d'ajout/modification */}
        <CenterFormModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingCenter(null); }}
          onSave={handleSaveCenter}
          initialData={editingCenter}
        />
      </main>
      <Footer />
    </div>
  );
}
export default DashboardPage