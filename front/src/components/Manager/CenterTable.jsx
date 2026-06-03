// src/components/manager/CenterTable.jsx
import StatutsBadge from './StatutsBadge';
import { Edit, Trash2 } from 'lucide-react';

 function CenterTable({ centers, onEdit, onDelete }) {
  if (centers.length === 0) {
    return <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">Aucun centre enregistré.</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adresse</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PMR</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {centers.map((center) => (
            <tr key={center.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{center.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{center.address}</td>
              <td className="px-6 py-4 whitespace-nowrap"><StatutsBadge status={center.status} /></td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{center.type}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{center.pmr ? "✅ Oui" : "❌ Non"}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button onClick={() => onEdit(center)} className="text-blue-600 hover:text-blue-900 mr-3">
                  <Edit size={18} />
                </button>
                <button onClick={() => onDelete(center.id)} className="text-red-600 hover:text-red-900">
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default CenterTable