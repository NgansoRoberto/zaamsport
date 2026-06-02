// src/hooks/useGeolocation.js
import { useState } from 'react';

 function useGeolocalisation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        setError('La géolocalisation n’est pas supportée par votre navigateur.');
        reject(new Error('Geolocation not supported'));
        return;
      }
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
          setLoading(false);
          resolve(coords);
        },
        (err) => {
          let message = 'Impossible de récupérer votre position.';
          if (err.code === 1) message = 'Vous avez refusé la géolocalisation.';
          setError(message);
          setLoading(false);
          reject(new Error(message));
        }
      );
    });
  };

  return { getLocation, loading, error };
}
export default useGeolocalisation