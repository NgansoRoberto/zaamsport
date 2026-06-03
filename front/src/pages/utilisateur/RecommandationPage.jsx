// src/pages/user/RecommandationsPage.jsx
import { Link } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';
import Button from '../../components/common/Button';

function RecommandationsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow p-6 max-w-md text-center">
          <div className="text-6xl mb-4">?</div>
          <h1 className="text-2xl font-bold text-green-600 mb-4">Profil enregistré !</h1>
          <p className="text-gray-600 mb-6">
            Vos préférences ont été prises en compte. Nous allons vous proposer des clubs adaptés à vos besoins.
          </p>
          <Link to="/carte?rec=true">
            <Button className="w-full">Voir mes recommandations</Button>
          </Link>
          <Link to="/" className="block mt-4 text-red-600 hover:underline">
            Revenir à l'accueil
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default RecommandationsPage;