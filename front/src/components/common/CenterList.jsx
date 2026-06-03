import CenterCard from "./CenterCard";

 function CenterList({ centers, selected, onSelect }) {
  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-2">
      {centers.map((center) => (
        <CenterCard
          key={center.id}
          center={center}
          isSelected={selected?.id === center.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
export default CenterList