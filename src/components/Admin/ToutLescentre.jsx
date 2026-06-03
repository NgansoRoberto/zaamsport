// src/components/admin/AllCentersList.jsx
import { useState } from 'react';
import { Search, Edit, Trash2 } from 'lucide-react';
import StatutsBadge from '../Manager/StatutsBadge';

 function ToutLescentre({ centers, onEdit,   onDelete }) {
  const [search, setSearch] = useState("");

  const filtered = centers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Tous les centres</h2>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manager</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motif (rejet)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map((center) => (
              <tr key={center.id}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{center.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{center.managerName}</td>
                <td className="px-6 py-4"><StatutsBadge status={center.status} /></td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                  {center.status === 'rejected' && center.rejectionReason ? center.rejectionReason : '-'}
                </td>
                <td className="px-6 py-4 text-sm">
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
    </div>
  );
}
export default ToutLescentre