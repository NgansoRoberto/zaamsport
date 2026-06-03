// src/components/accessibility/DetailPanel.jsx
 function DetailPanel({ center }) {
  if (!center) return null;

  return (
    <div className="absolute bottom-4 left-4 w-80 bg-white rounded-xl shadow-xl p-4 z-30 border border-gray-200">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-gray-800">{center.name}</h3>
          <p className="text-sm text-gray-500">{center.type}</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-red-600">{center.score}</span>
          <p className="text-xs text-gray-400">score accès</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        <span className="text-xs bg-gray-100 px-2 py-1 rounded"> {center.distance}</span>
        <span className="text-xs bg-gray-100 px-2 py-1 rounded"> {center.metro}</span>
        {center.pmr && (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded"> Accès PMR</span>
        )}
        <span
          className={`text-xs px-2 py-1 rounded ${
            center.open ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
          }`}
        >
          {center.open ? "✓ Ouvert" : "✗ Fermé"}
        </span>
      </div>
      <div className="flex gap-2 mt-4">
        <button className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-red-700">
          Itinéraire →
        </button>
        <button className="flex-1 bg-gray-100 text-gray-800 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200">
          Détails
        </button>
      </div>
    </div>
  );
}
export default DetailPanel