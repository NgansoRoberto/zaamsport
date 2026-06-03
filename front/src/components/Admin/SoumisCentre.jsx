// src/components/admin/PendingCentersList.jsx
import { useState } from 'react';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import Button from '../common/Button';
import Modalrejet from './Modalrejet';

 function SoumisCentre({ centers, onApprove, onReject }) {
  const [rejectCenter, setRejectCenter] = useState(null);

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Centres en attente de validation</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {centers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Aucun centre en attente.</div>
          ) : (
            centers.map((center) => (
              <div key={center.id} className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-800">{center.name}</h3>
                  <p className="text-sm text-gray-500">{center.address}</p>
                  <p className="text-xs text-gray-400">Soumis par : {center.managerName}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.open(`/club/${center.id}`, '_blank')}
                    className="p-2 text-gray-500 hover:text-gray-700"
                    title="Voir détails"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => onApprove(center.id)}
                    className="p-2 text-green-600 hover:text-green-800"
                    title="Approuver"
                  >
                    <CheckCircle size={20} />
                  </button>
                  <button
                    onClick={() => setRejectCenter(center)}
                    className="p-2 text-red-600 hover:text-red-800"
                    title="Rejeter"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {rejectCenter && (
        <RejectModal
          isOpen={true}
          onClose={() => setRejectCenter(null)}
          onConfirm={(reason) => onReject(rejectCenter.id, reason)}
          centerName={rejectCenter.name}
        />
      )}
    </>
  );
}
export default SoumisCentre