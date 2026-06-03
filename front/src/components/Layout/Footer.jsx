import { Link } from 'react-router-dom';

 function Footer() {
  return (
  <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {/* Colonne 1 - Marque / JantSport */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">JantSport</h3>
            <p className="text-sm text-gray-400">
              Votre plateforme de recommandation géospatiale pour trouver la salle de sport idéale,
              accessible et proche de chez vous à Douala et dans toute l'Afrique.
            </p>
          </div>

          {/* Colonne 2 - Liens rapides (header) */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Navigation</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-red-500 transition">Accueil</Link></li>
              <li><Link to="/accessibilite" className="hover:text-red-500 transition">Accessibilité</Link></li>
              <li><Link to="/carte" className="hover:text-red-500 transition">Carte</Link></li>
              <li><Link to="/connexion" className="hover:text-red-500 transition">Connexion</Link></li>
              <li><Link to="/inscription" className="hover:text-red-500 transition">Inscription</Link></li>
            </ul>
          </div>

          {/* Colonne 3 - Contact */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li> Douala, Cameroun</li>
              <li> +237 6 52 89 95 09</li>
              <li> contact@zaamport.com</li>
            </ul>
            <div className="flex gap-4 mt-4">
              <a href="#" className="hover:text-red-500 transition"> Facebook</a>
              <a href="#" className="hover:text-red-500 transition"> Instagram</a>
              <a href="#" className="hover:text-red-500 transition"> Twitter</a>
            </div>
          </div>

          {/* Colonne 4 - Informations complémentaires (optionnelle) */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Informations</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/mentions-legales" className="hover:text-red-500 transition">Mentions légales</Link></li>
              <li><Link to="/confidentialite" className="hover:text-red-500 transition">Politique de confidentialité</Link></li>
              <li><Link to="/cgu" className="hover:text-red-500 transition">CGU</Link></li>
              <li><span className="text-gray-500">© 2025 JantSport</span></li>
            </ul>
          </div>
        </div>
      </div>
      {/* Barre de copyright simple sous les colonnes */}
      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        <p>JantSport – Tous droits réservés. Application de recommandation géospatiale pour l'accessibilité des centres de remise en forme.</p>
      </div>
    </footer>
  );
}
export default Footer