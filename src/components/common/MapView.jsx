import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix des icônes Leaflet
const defaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

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