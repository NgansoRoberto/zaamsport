// src/pages/user/ClubsPage.jsx
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';
import Button from '../../components/common/Button';
import Toggle from '../../components/common/Toggle';
import FilterBar from '../../components/common/FilterBar';
import CenterCard from '../../components/common/CenterCard';


function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

const clubTypes = ["Tous", "Salle de sport", "Piscine", "CrossFit", "Yoga", "Musculation"];

function ImageCarousel({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    if (!images || images.length === 0) return;
    const interval = setInterval(() => setCurrentIndex((prev) => (prev + 1) % images.length), 3000);
    return () => clearInterval(interval);
  }, [images]);
  if (!images || images.length === 0) return null;
  return (
    <div className="relative">
      <img src={images[currentIndex]} alt="club" className="w-full h-48 object-cover rounded-lg" />
      {images.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 cursor-pointer"
          >
            ‹
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 cursor-pointer"
          >
            ›
          </button>
        </>
      )}
    </div>
  );
}

function Clubs() {
  const [userLocation, setUserLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Tous");
  const [pmrOnly, setPmrOnly] = useState(false);
  const [openOnly, setOpenOnly] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [userReview, setUserReview] = useState(null);
  const [isMobile, setIsMobile] = useState(false);


  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const fetchClubs = async (lat, lng, radius = 10) => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      let url = `${import.meta.env.VITE_API_BASE_URL}/clubs?lat=${lat}&lng=${lng}&radius=${radius}`;
      if (userId) url += `&user_id=${userId}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      let data = await response.json();
      if (Array.isArray(data)) {
        const baseUrl = window.location.origin;
        data = data.map(center => ({
          ...center,
          images: center.images && Array.isArray(center.images)
            ? center.images.map(img => img.startsWith('http') ? img : `${baseUrl}/${img}`)
            : []
        }));
      }
      setCenters(data);
      if (data.length > 0) setSelectedCenter(data[0]);
    } catch (err) {
      console.error("Erreur fetchClubs:", err);
      alert("Impossible de charger les clubs à proximité.");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (centerId) => {
    if (!centerId) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/reviews?center_id=${centerId}`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      setReviews(data);
      const token = localStorage.getItem('token');
      if (token) {
        const userId = localStorage.getItem('userId');
        const myReview = data.find(r => r.user_id == userId);
        if (myReview) {
          setUserReview(myReview);
          setNewRating(myReview.rating);
          setNewComment(myReview.comment);
        } else {
          setUserReview(null);
          setNewRating(5);
          setNewComment('');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const submitReview = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Veuillez vous connecter pour noter');
      return;
    }
    if (!selectedCenter) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          center_id: selectedCenter.id,
          rating: parseInt(newRating),
          comment: newComment
        })
      });
      if (response.ok) {
        const resData = await response.json();
        await fetchReviews(selectedCenter.id);
        alert('Merci pour votre avis !');
        const updatedCenters = centers.map(c =>
          c.id === selectedCenter.id ? { ...c, avg_rating: resData?.avg_rating || c.avg_rating } : c
        );
        setCenters(updatedCenters);
      } else {
        throw new Error();
      }
    } catch (err) {
      console.error(err);
      alert('Erreur lors de l\'envoi de l\'avis');
    }
  };

  const handleLocate = () => {
    setLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(coords);
          fetchClubs(coords.lat, coords.lng);
          setLoadingLocation(false);
        },
        (error) => {
          console.error(error);
          setLoadingLocation(false);
          const defaultCoords = { lat: 4.051056, lng: 9.767869 };
          setUserLocation(defaultCoords);
          fetchClubs(defaultCoords.lat, defaultCoords.lng);
          alert("Position fixe appliquée : Douala");
        }
      );
    } else {
      alert("Géolocalisation non supportée");
      const defaultCoords = { lat: 4.051056, lng: 9.767869 };
      setUserLocation(defaultCoords);
      fetchClubs(defaultCoords.lat, defaultCoords.lng);
      setLoadingLocation(false);
    }
  };

  const geocodeQuarter = async (quarter) => {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(quarter + ", Douala, Cameroun")}&format=json&limit=1`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.length > 0) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      throw new Error("Quartier non trouvé");
    } catch (err) {
      alert("Quartier non trouvé");
      return null;
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    const coords = await geocodeQuarter(searchQuery);
    if (coords) {
      setUserLocation(coords);
      fetchClubs(coords.lat, coords.lng);
    }
  };

  const filteredCenters = useMemo(() => {
    return centers.filter(c => {
      if (activeFilter !== "Tous" && c.type !== activeFilter) return false;
      if (pmrOnly && !c.pmr) return false;
      return true;
    });
  }, [centers, activeFilter, pmrOnly]);

  useEffect(() => {
    const stored = localStorage.getItem("tempLocation");
    if (stored) {
      const coords = JSON.parse(stored);
      setUserLocation(coords);
      fetchClubs(coords.lat, coords.lng);
    } else {
      handleLocate();
    }
  }, []);

  useEffect(() => {
    if (selectedCenter?.id) fetchReviews(selectedCenter.id);
  }, [selectedCenter]);

  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Header />
        <main className="flex-1 flex flex-col">
          <div className="h-[40vh] relative">
            {userLocation ? (
              <MapContainer center={[userLocation.lat, userLocation.lng]} zoom={13} className="h-full w-full">
                <ChangeView center={[userLocation.lat, userLocation.lng]} zoom={13} />
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                <Marker position={[userLocation.lat, userLocation.lng]}><Popup>Votre position</Popup></Marker>
                {filteredCenters.map(center => (
                  <Marker key={center.id} position={[center.lat, center.lng]} eventHandlers={{ click: () => setSelectedCenter(center) }}>
                    <Popup>{center.name}</Popup>
                  </Marker>
                ))}
              </MapContainer>
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-200">Chargement...</div>
            )}
          </div>
          <div className="p-4 bg-white border-b">
            <div className="flex gap-2 mb-2">
              <input type="text" placeholder="Votre quartier (ex: Bonapriso)" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg" />
              <Button onClick={handleSearch} variant="secondary">Rechercher</Button>
              <Button onClick={handleLocate} disabled={loadingLocation} className="cursor-pointer">me localiser</Button>
            </div>
            <FilterBar filters={clubTypes} activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
            <div className="flex gap-4 mt-2">
              <Toggle label="Accès PMR" value={pmrOnly} onChange={setPmrOnly} />
              <Toggle label="Ouvert maintenant" value={openOnly} onChange={setOpenOnly} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading && <div className="text-center py-4">Chargement...</div>}
            {filteredCenters.map(center => (
              <div key={center.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{center.name}</h3>
                    <p className="text-sm text-gray-600">{center.address}</p>
                    <p className="text-sm text-gray-500">Distance: {center.distance_km} km</p>
                  </div>
                  {center.pmr && <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">PMR</span>}
                </div>
                <div className="flex gap-2 mt-3">
                  <Link to={`/club/${center.id}`} className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-semibold text-center cursor-pointer hover:bg-red-700 transition">Voir détails</Link>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${center.lat},${center.lng}`} target="_blank" rel="noreferrer" className="flex-1 bg-gray-200 text-gray-800 text-center py-2 rounded-lg text-sm font-semibold cursor-pointer hover:bg-gray-300 transition">Itinéraire</a>
                </div>
              </div>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-grow">
        <div className="flex flex-col lg:flex-row h-[calc(100vh-70px)]">
          <div className="lg:w-96 bg-white border-r border-gray-200 flex flex-col shadow-sm">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-3">Trouver une salle</h2>
              <div className="flex gap-2 mb-3">
                <input type="text" placeholder="Votre quartier (ex: Bonapriso)" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg" />
                <Button onClick={handleSearch} variant="secondary">Rechercher</Button>
              </div>
              <Button onClick={handleLocate} disabled={loadingLocation} className="w-full mb-3 cursor-pointer">{loadingLocation ? "Localisation..." : " Utiliser ma position"}</Button>
              <FilterBar filters={clubTypes} activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
              <div className="flex gap-4 mt-3">
                <Toggle label="Accès PMR" value={pmrOnly} onChange={setPmrOnly} />
                <Toggle label="Ouvert maintenant" value={openOnly} onChange={setOpenOnly} />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <div className="text-sm text-gray-500 mb-2"><strong className="text-gray-800">{filteredCenters.length}</strong> centre(s) trouvé(s)</div>
              {loading && <div className="text-center py-4">Chargement...</div>}
              {filteredCenters.map(center => (
                <CenterCard key={center.id} center={{ ...center, distance: center.distance_km ? `${center.distance_km} km` : "?" }} isSelected={selectedCenter?.id === center.id} onSelect={setSelectedCenter} />
              ))}
            </div>
          </div>
          <div className="flex-1 relative">
            {userLocation ? (
              <MapContainer center={[userLocation.lat, userLocation.lng]} zoom={13} className="h-full w-full">
                <ChangeView center={[userLocation.lat, userLocation.lng]} zoom={13} />
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                <Marker position={[userLocation.lat, userLocation.lng]}><Popup>Votre position</Popup></Marker>
                {filteredCenters.map(center => (
                  <Marker key={center.id} position={[center.lat, center.lng]} eventHandlers={{ click: () => setSelectedCenter(center) }}>
                    <Popup><strong>{center.name}</strong><br />Distance: {center.distance_km} km</Popup>
                  </Marker>
                ))}
              </MapContainer>
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-200">Chargement de la carte...</div>
            )}
          </div>
          {selectedCenter && (
            <div className="lg:w-96 bg-white border-l border-gray-200 overflow-y-auto shadow-lg">
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">{selectedCenter.name}</h2>
                  <button onClick={() => setSelectedCenter(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
                </div>
                {selectedCenter.images?.length > 0 && <ImageCarousel images={selectedCenter.images} />}
                <div className="space-y-4">
                  <div><h3 className="font-semibold">Adresse</h3><p>{selectedCenter.address}</p></div>
                  <div><h3 className="font-semibold">Équipements</h3><ul className="list-disc list-inside">{selectedCenter.equipment?.map((e,i)=><li key={i}>{e}</li>)}</ul></div>
                  <div><h3 className="font-semibold">Horaires</h3><div className="text-sm">{selectedCenter.hours && Object.entries(selectedCenter.hours).map(([day, hours]) => <div key={day}>{day}: {hours}</div>)}</div></div>
                  <div><h3 className="font-semibold">Tarifs</h3><ul className="list-disc list-inside">{selectedCenter.prices?.monthly && <li>Abonnement mensuel : {selectedCenter.prices.monthly} FCFA</li>}{selectedCenter.prices?.single && <li>Séance libre : {selectedCenter.prices.single} FCFA</li>}</ul></div>
                  <div><h3 className="font-semibold">Accessibilité PMR</h3><p>{selectedCenter.pmr ? "✅ Oui" : "❌ Non"}</p></div>
                  <div><h3 className="font-semibold">Note moyenne</h3><p>{selectedCenter.avg_rating ? `${selectedCenter.avg_rating}/5` : 'Pas encore noté'}</p></div>
                </div>
                <div className="mt-6"><a href={`https://www.google.com/maps/search/?api=1&query=${selectedCenter.lat},${selectedCenter.lng}`} target="_blank" rel="noreferrer" className="block w-full bg-red-600 text-white text-center py-2 rounded-lg font-semibold hover:bg-red-700 cursor-pointer">Itinéraire →</a></div>
                <div className="mt-6 border-t pt-4">
                  <h3 className="font-semibold text-gray-800">Avis des utilisateurs</h3>
                  <div className="max-h-40 overflow-y-auto space-y-2 mt-2">
                    {reviews.length === 0 && <p className="text-sm text-gray-500">Aucun avis pour le moment.</p>}
                    {reviews.map(rev => (
                      <div key={rev.id} className="border-b pb-2">
                        <div className="flex justify-between"><span className="font-medium text-sm">{rev.prenom} {rev.nom}</span><span className="text-yellow-500 text-sm">{'★'.repeat(rev.rating)}</span></div>
                        <p className="text-sm text-gray-600">{rev.comment}</p>
                        <p className="text-xs text-gray-400">{new Date(rev.created_at).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <h4 className="font-medium text-sm">{userReview ? 'Modifier mon avis' : 'Donnez votre avis'}</h4>
                    <select value={newRating} onChange={e => setNewRating(e.target.value)} className="border rounded p-1 my-1 text-sm w-full">
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} étoile{n>1?'s':''}</option>)}
                    </select>
                    <textarea value={newComment} onChange={e => setNewComment(e.target.value)} className="w-full border rounded p-1 my-1 text-sm" rows="2" placeholder="Votre commentaire..." />
                    <Button onClick={submitReview} className="w-full text-sm py-1 cursor-pointer">{userReview ? 'Modifier mon avis' : 'Envoyer'}</Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Clubs;