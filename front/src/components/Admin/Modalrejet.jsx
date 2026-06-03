// src/components/admin/RejectModal.jsx
import { useState } from 'react';
import Button from '../common/Button';

function Modalrejet({ isOpen, onClose, onConfirm, centerName }) {
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (!reason.trim()) {
      alert("Veuillez saisir un motif de rejet.");
      return;
    }
    onConfirm(reason);
    onClose();
    setReason("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Rejeter le centre</h2>
        <p className="text-gray-600 mb-4">Motif du rejet pour <strong>{centerName}</strong> :</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Ex: Photos manquantes, adresse invalide..."
        />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSubmit}>Confirmer le rejet</Button>
        </div>
      </div>
    </div>
  );
}
export default Modalrejet