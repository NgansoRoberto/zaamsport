import { useState, useMemo, useEffect } from 'react';
import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';
import SideBar from '../../components/common/SideBar';
import MapView from '../../components/common/MapView';
import DetailPanel from '../../components/common/DetailPanel';
import { fetchClubsNearby } from '../../hooks/API';

const filtersList = ['Tous', 'Salle de sport', 'Piscine', 'Yoga', 'CrossFit'];
const DEFAULT_LAT = 4.0511;
const DEFAULT_LNG = 9.7679;

function AccessibilityPage() {
  const [allCenters, setAllCenters] = useState([]);
  const [selected, setSelected] = useState(null);
  const [activeFilter, setActiveFilter] = useState('Tous');
  const [pmrOnly, setPmrOnly] = useState(false);
  const [openOnly, setOpenOnly] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const stored = localStorage.getItem('tempLocation');
        let lat = DEFAULT_LAT;
        let lng = DEFAULT_LNG;
        if (stored) {
          const coords = JSON.parse(stored);
          lat = coords.lat;
          lng = coords.lng;
          setUserLocation(coords);
        }
        const data = await fetchClubsNearby(lat, lng, 20);
        const list = Array.isArray(data) ? data : [];
        setAllCenters(list);
        if (list.length > 0) setSelected(list[0]);
      } catch (err) {
        console.error(err);
        setAllCenters([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredCenters = useMemo(() => {
    return allCenters.filter((c) => {
      if (activeFilter !== 'Tous' && !c.type?.includes(activeFilter)) return false;
      if (pmrOnly && !c.pmr) return false;
      if (openOnly && !c.open) return false;
      return true;
    });
  }, [allCenters, activeFilter, pmrOnly, openOnly]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Chargement des centres...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-grow">
        <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-70px)]">
          <SideBar
            centers={filteredCenters}
            filters={filtersList}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            pmrOnly={pmrOnly}
            setPmrOnly={setPmrOnly}
            openOnly={openOnly}
            setOpenOnly={setOpenOnly}
            selected={selected}
            setSelected={setSelected}
          />
          <div className="flex-1 flex flex-col lg:flex-row min-h-[50vh]">
            <MapView centers={filteredCenters} selected={selected} userLocation={userLocation} />
            {selected && <DetailPanel center={selected} />}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default AccessibilityPage;
