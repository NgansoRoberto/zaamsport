// src/components/admin/StatsCards.jsx
import { Users, Dumbbell, Clock, CheckCircle } from 'lucide-react';

 function Statistique({ stats }) {
  const cards = [
    { title: "Utilisateurs", value: stats.totalUsers, icon: Users, color: "bg-blue-500" },
    { title: "Centres validés", value: stats.approvedCenters, icon: CheckCircle, color: "bg-green-500" },
    { title: "En attente", value: stats.pendingCenters, icon: Clock, color: "bg-yellow-500" },
    { title: "Total centres", value: stats.totalCenters, icon: Dumbbell, color: "bg-red-500" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => (
        <div key={card.title} className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">{card.title}</p>
            <p className="text-3xl font-bold text-gray-800">{card.value}</p>
          </div>
          <div className={`${card.color} p-3 rounded-full text-white`}>
            <card.icon size={24} />
          </div>
        </div>
      ))}
    </div>
  );
}
export default Statistique