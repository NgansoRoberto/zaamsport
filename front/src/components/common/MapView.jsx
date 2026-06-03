import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

 function MapView({ centers, selected, onSelect, userLocation }) {
  return (
    <div className="flex-1 relative">
      <MapContainer
      
        center={userLocation || [ 4.051056,  9.767869]}
        zoom={29}
        className="h-full w-full"
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
        {centers.map((center) => (
          <Marker
            key={center.id}
            position={[center.lat, center.lng]}
            eventHandlers={{ click: () => onSelect(center) }}
          >
            <Popup>{center.name}</Popup>
          </Marker>
        ))}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>Votre position</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
export default MapView