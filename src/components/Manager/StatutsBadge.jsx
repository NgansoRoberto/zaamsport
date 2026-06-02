// src/components/manager/StatusBadge.jsx
 function StatutsBadge({ status }) {
  const config = {
    pending: { label: "En attente", className: "bg-yellow-100 text-yellow-800" },
    approved: { label: "Validé", className: "bg-green-100 text-green-800" },
    rejected: { label: "Rejeté", className: "bg-red-100 text-red-800" }
  };
  const { label, className } = config[status] || config.pending;
  return <span className={`px-2 py-1 text-xs rounded-full ${className}`}>{label}</span>;
}
export default StatutsBadge