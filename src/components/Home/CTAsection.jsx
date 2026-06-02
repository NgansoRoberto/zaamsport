// src/components/home/CTASection.jsx
import { Link } from 'react-router-dom';
import Button from '../common/Button';

 function CTAsection() {
  return (
    <section className="bg-blue-50 py-16 text-center">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-4">Prêt à trouver la salle idéale ?</h2>
        <p className="text-lg mb-6">Rejoignez notre communauté et bénéficiez de recommandations personnalisées.</p>
        <Link to="/inscription"><Button>Inscription gratuite</Button></Link>
      </div>
    </section>
  );
}
export default CTAsection