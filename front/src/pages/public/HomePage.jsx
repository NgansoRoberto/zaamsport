import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';
import HeroSection from '../../components/Home/HeroSection';
import OffertsCarousel from '../../components/Home/OffertsCarousel';
import HowWord from '../../components/Home/HowWord';
import MinMap from '../../components/Home/MinMap';
import CTAsection from '../../components/Home/CTAsection';

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <OffertsCarousel />
        <div className="relative">
          <HowWord />
          <div className="static md:absolute md:bottom-8 md:right-8 w-full md:w-64 z-10 px-4 md:px-0 pb-8 md:pb-0">
            <MinMap />
            <p className="text-xs text-center text-gray-500 mt-1">Aperçu de votre zone</p>
          </div>
        </div>
        <CTAsection />
      </main>
      <Footer />
    </div>
  );
}

export default HomePage;
