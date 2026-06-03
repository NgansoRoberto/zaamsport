import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import useGeolocation from '../../hooks/useGeolocalisation';
import heroae from '../../assets/heroae.png';

function HeroSection() {
  const navigate = useNavigate();
  const { getLocation, loading, error } = useGeolocation();

  const handleLocate = async () => {
    try {
      const coords = await getLocation();
      localStorage.setItem('tempLocation', JSON.stringify(coords));
      navigate('/carte');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section
      className="relative bg-cover bg-center bg-no-repeat min-h-[50vh] sm:min-h-[60vh]"
      style={{ backgroundImage: `url(${heroae})` }}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative container mx-auto text-center text-white py-16 sm:py-24 md:py-32 px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
          Trouvez la salle de sport <br className="hidden sm:block" />
          parfaitement accessible
        </h1>
        <p className="text-base sm:text-xl md:text-2xl mb-6 sm:mb-8 max-w-2xl mx-auto">
          Recommandations géospatiales basées sur vos besoins d&apos;accessibilité
        </p>
        <Button
          onClick={handleLocate}
          disabled={loading}
          className="text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 w-full sm:w-auto max-w-xs mx-auto"
        >
          {loading ? 'Localisation...' : 'Me localiser'}
        </Button>
        {error && <p className="text-red-300 mt-4 text-sm">{error}</p>}
      </div>
    </section>
  );
}

export default HeroSection;
