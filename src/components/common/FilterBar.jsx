// src/components/accessibility/FilterBar.jsx
 function FilterBar({ filters, activeFilter, setActiveFilter }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => setActiveFilter(filter)}
          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
            activeFilter === filter
              ? "bg-red-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}
export default FilterBar