function CenterCard({ center, isSelected, onSelect }) {
  const scoreColor = center.score >= 90 ? "text-green-600" : center.score >= 75 ? "text-yellow-600" : "text-red-600";
  return (
    <div
      onClick={() => onSelect(center)}
      className={`p-3 rounded-lg cursor-pointer transition ${
        isSelected ? "bg-red-50 border border-red-200" : "hover:bg-gray-50 border border-transparent"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${scoreColor} bg-gray-50 border`}>
          {center.score}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-gray-800">{center.name}</div>
          <div className="text-xs text-gray-500">{center.type}</div>
          <div className="flex gap-2 mt-1 text-xs">
            <span> {center.distance}</span>
            {center.pmr && <span className="text-red-600"> PMR</span>}
            {!center.open && <span className="text-gray-400">Fermé</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
export default CenterCard