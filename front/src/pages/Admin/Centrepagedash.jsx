// src/components/admin/CenterDetailsModal.jsx
import { useState } from 'react';
import Button from '../../components/common/Button';

 function Centrepagedash({ center, isOpen, onClose, onApprove, onReject }) {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  if (!isOpen || !center) return null;

  const handleReject = () => {
    if (showRejectInput && !rejectReason.trim()) {
      alert("Veuillez saisir un motif de rejet");
      return;
    }
    onReject(center.id, rejectReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{center.name}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <div className="space-y-4">
            <div><strong>Adresse :</strong> {center.address}</div>
            <div><strong>Type :</strong> {center.type}</div>
            <div><strong>Accès PMR :</strong> {center.pmr ? "Oui" : "Non"}</div>
            <div><strong>Équipements :</strong> {center.equipment?.join(", ")}</div>
            <div><strong>Horaires :</strong> {Object.entries(center.hours || {}).map(([day, hour]) => `${day}: ${hour}`).join(", ")}</div>
            <div><strong>Tarifs :</strong> Abonnement: {center.prices?.monthly}, Séance: {center.prices?.single}</div>
            <div><strong>Images :</strong> {center.images?.length > 0 ? <div className="flex gap-2">{center.images.map((img, idx) => <img key={idx} src={img} className="w-20 h-20 object-cover rounded" />)}</div> : "Aucune"}</div>
          </div>
          <div className="mt-6">
            {showRejectInput ? (
              <div className="mb-4">
                <textarea
                  placeholder="Motif du rejet"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full p-2 border rounded"
                  rows="2"
                />
              </div>
            ) : null}
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => { setShowRejectInput(!showRejectInput); if (!showRejectInput) setRejectReason(''); }}>Rejeter</Button>
              <Button onClick={() => onApprove(center.id)}>Approuver</Button>
              {showRejectInput && <Button onClick={handleReject} variant="secondary">Confirmer rejet</Button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Centrepagedash
