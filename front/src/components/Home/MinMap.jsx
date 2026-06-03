// src/components/home/MiniMap.jsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';

 function MinMap({ userLocation = null }) {
  const defaultCenter = { lat: 4.0511, lng: 9.7679 }; // Douala
  const [position, setPosition] = useState(defaultCenter);

  useEffect(() => {
    if (userLocation && userLocation.lat && userLocation.lng) {
      setPosition({ lat: userLocation.lat, lng: userLocation.lng });
    } else {
      const saved = localStorage.getItem('tempLocation');
      if (saved) {
        const coords = JSON.parse(saved);
        setPosition(coords);
      }
    }
  }, [userLocation]);

  return (
    <div className="rounded-lg overflow-hidden shadow-md border border-gray-200" style={{ height: '200px', width: '100%' }}>
      <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false} attributionControl={false}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
        <Marker position={position}>
          <Popup>Votre position (si partagée)</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
export default MinMap