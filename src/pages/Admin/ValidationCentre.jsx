// src/components/admin/CenterValidationTable.jsx
import StatutsBadge from '../../components/Manager/StatutsBadge';
import { CheckCircle, XCircle, Eye } from 'lucide-react';

function ValidationCentre({ centers, onApprove, onReject, onViewDetails }) {
  if (centers.length === 0) {
    return <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">Aucun centre en attente de validation.</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adresse</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manager</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date soumission</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {centers.map((center) => (
            <tr key={center.id}>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">{center.name}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{center.address}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{center.managerName || "Non renseigné"}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{new Date(center.submittedAt).toLocaleDateString()}</td>
              <td className="px-6 py-4 text-sm space-x-2">
                <button onClick={() => onViewDetails(center)} className="text-blue-600 hover:text-blue-800" title="Voir détails">
                  <Eye size={18} />
                </button>
                <button onClick={() => onApprove(center.id)} className="text-green-600 hover:text-green-800" title="Approuver">
                  <CheckCircle size={18} />
                </button>
                <button onClick={() => onReject(center.id)} className="text-red-600 hover:text-red-800" title="Rejeter">
                  <XCircle size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default ValidationCentre