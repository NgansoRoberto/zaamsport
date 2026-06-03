import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';
import Button from '../../components/common/Button';
import { fetchClubsNearby } from '../../hooks/API';

const DOUALA_CENTER = [4.0511, 9.7679];

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

function MapPagerecommandation() {
  const [userLocation, setUserLocation] = useState(null);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('tempLocation');
    if (stored) {
      const coords = JSON.parse(stored);
      setUserLocation([coords.lat, coords.lng]);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        () => setUserLocation(DOUALA_CENTER)
      );
    } else {
      setUserLocation(DOUALA_CENTER);
    }
  }, []);

  useEffect(() => {
    if (!userLocation) return;

    const [lat, lng] = userLocation;

    const loadCenters = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchClubsNearby(lat, lng, 15);
        setCenters(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
        setCenters([]);
      } finally {
        setLoading(false);
      }
    };

    loadCenters();
  }, [userLocation]);

  const reload = () => {
    if (userLocation) {
      const [lat, lng] = userLocation;
      setLoading(true);
      fetchClubsNearby(lat, lng, 15)
        .then((data) => setCenters(Array.isArray(data) ? data : []))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex flex-col">
        <div className="bg-white shadow-sm p-4 flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Centres recommandés</h1>
          <Button variant="secondary" onClick={reload} className="w-full sm:w-auto">
            Actualiser
          </Button>
        </div>
        {error && (
          <p className="text-red-600 text-sm text-center py-2 px-4 bg-red-50">{error}</p>
        )}
        {loading ? (
          <div className="flex justify-center items-center h-64 sm:h-96">Chargement de la carte...</div>
        ) : userLocation ? (
          <div className="flex-grow relative min-h-[50vh] sm:min-h-[60vh]">
            <MapContainer
              center={userLocation}
              zoom={13}
              style={{ height: '100%', minHeight: '50vh', width: '100%' }}
              className="z-0"
            >
              <ChangeView center={userLocation} zoom={13} />
              <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
              <Marker
                position={userLocation}
                icon={L.icon({
                  iconUrl:
                    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                  iconSize: [25, 41],
                })}
              >
                <Popup>Vous êtes ici</Popup>
              </Marker>
              {centers.map((center) => (
                <Marker key={center.id} position={[Number(center.lat), Number(center.lng)]}>
                  <Popup>
                    <strong>{center.name}</strong>
                    <br />
                    {center.address}
                    <br />
                    {center.score != null && <>Score: {center.score}/10</>}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
            <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur rounded-lg shadow-md p-3 max-h-48 overflow-y-auto z-10">
              <h3 className="font-bold mb-2">Liste des centres</h3>
              {centers.length === 0 ? (
                <p className="text-sm text-gray-500">Aucun centre trouvé à proximité.</p>
              ) : (
                centers.map((c) => (
                  <div key={c.id} className="border-b py-2 flex justify-between gap-2">
                    <div className="min-w-0">
                      <strong>{c.name}</strong>
                      <br />
                      <span className="text-sm text-gray-600">{c.address}</span>
                    </div>
                    {c.score != null && (
                      <div className="text-red-600 font-bold shrink-0">{c.score}/10</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}

export default MapPagerecommandation;
