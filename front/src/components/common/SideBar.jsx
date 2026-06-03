import FilterBar from "./FilterBar";
import CenterList from "./CenterList";
import Toggle from "./Toggle";
 function SideBar({ centers, filters, activeFilter, setActiveFilter, pmrOnly, 
  setPmrOnly, openOnly, setOpenOnly, selected, setSelected }) {
  return (
    <aside className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm">
      <div className="p-5 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-red-600 mb-4"><span className="text-black">jant</span>sport</h1>
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Rechercher une adresse..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <span className="absolute left-3 top-2.5 text-gray-400"></span>
        </div>
        <FilterBar filters={filters} activeFilter={activeFilter} setActiveFilter={setActiveFilter} /> 
      </div>
      <div className="flex gap-4 px-5 py-3 border-b border-gray-100">
        <Toggle label="Accès PMR" value={pmrOnly} onChange={setPmrOnly} />
        <Toggle label="Ouvert maintenant" value={openOnly} onChange={setOpenOnly} />
      </div>
      <div className="px-5 py-3 text-sm text-gray-500 border-b border-gray-100">
        <strong className="text-gray-800">{centers.length}</strong> centre(s) trouvé(s)
      </div>
      <CenterList centers={centers} selected={selected} onSelect={setSelected} />
    </aside>
  );
}
export default SideBar