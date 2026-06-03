// src/pages/user/CenterDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';
import Button from '../../components/common/Button';

function ImageCarousel({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    if (!images?.length) return;
    const interval = setInterval(() => setCurrentIndex(prev => (prev + 1) % images.length), 3000);
    return () => clearInterval(interval);
  }, [images]);
  if (!images?.length) return null;
  return (
    <div className="relative">
      <img src={images[currentIndex]} alt="club" className="w-full h-64 object-cover rounded-lg" />
      {images.length > 1 && (
        <>
          <button onClick={() => setCurrentIndex(prev => (prev - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-8 h-8">‹</button>
          <button onClick={() => setCurrentIndex(prev => (prev + 1) % images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-8 h-8">›</button>
        </>
      )}
    </div>
  );
}

 function CenterDetailPage() {
  const { id } = useParams();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [userReview, setUserReview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
  const fetchClub = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/clubs/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    let data = await res.json();
    // Transformation des images (comme dans ClubsPage)
    if (data.images && Array.isArray(data.images)) {
      data.images = data.images.map(img => img.startsWith('http') ? img : `${window.location.origin}/${img}`);
    }
    setClub(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/reviews?center_id=${id}`);
        const data = await res.json();
        setReviews(data);
        const token = localStorage.getItem('token');
        if (token) {
          const userId = localStorage.getItem('userId');
          const my = data.find(r => r.user_id == userId);
          if (my) {
            setUserReview(my);
            setNewRating(my.rating);
            setNewComment(my.comment);
          }
        }
      } catch (err) { console.error(err); }
    };
    fetchClub();
    fetchReviews();
  }, [id]);

  const submitReview = async () => {
    const token = localStorage.getItem('token');
    if (!token) return alert('Veuillez vous connecter pour noter');
    if (!newComment.trim()) return alert('Veuillez saisir un commentaire');
    setSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ center_id: id, rating: parseInt(newRating), comment: newComment })
      });
      if (res.ok) {
        alert('Merci pour votre avis !');
        // Rafraîchir les avis
        const newRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/reviews?center_id=${id}`);
        const data = await newRes.json();
        setReviews(data);
        const userId = localStorage.getItem('userId');
        const my = data.find(r => r.user_id == userId);
        if (my) {
          setUserReview(my);
          setNewRating(my.rating);
          setNewComment(my.comment);
        } else {
          setUserReview(null);
          setNewRating(5);
          setNewComment('');
        }
      } else {
        throw new Error();
      }
    } catch (err) {
      alert('Erreur lors de l\'envoi');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">Erreur : {error}</div>;
  if (!club) return <div className="min-h-screen flex items-center justify-center">Club non trouvé</div>;

  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        <Link to="/carte" className="text-red-600 mb-4 inline-block">&larr; Retour</Link>
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">{club.name}</h1>
          {club.images?.length > 0 && <ImageCarousel images={club.images} />}
          <div className="space-y-4 mt-4">
            <div><strong>Adresse :</strong> {club.address}</div>
            <div><strong>Équipements :</strong> {club.equipment?.join(', ') || 'Non renseigné'}</div>
            <div><strong>Horaires :</strong>
              <div className="ml-4">
                {club.hours && Object.entries(club.hours).map(([d, h]) => <div key={d}>{d}: {h}</div>)}
              </div>
            </div>
            <div><strong>Tarifs :</strong>
              <ul className="list-disc ml-6">
                {club.prices?.monthly && <li>Abonnement mensuel : {club.prices.monthly} FCFA</li>}
                {club.prices?.single && <li>Séance libre : {club.prices.single} FCFA</li>}
                {club.prices?.coaching && <li>Coaching : {club.prices.coaching} FCFA</li>}
              </ul>
            </div>
            <div><strong>Accessibilité PMR :</strong> {club.pmr ? '✅ Oui' : '❌ Non'}</div>
            <div><strong>Note moyenne :</strong> {club.avg_rating ? `${club.avg_rating}/5` : 'Pas encore noté'}</div>
          </div>
          <div className="mt-6">
            <a href={`https://www.google.com/maps/search/?api=1&query=${club.lat},${club.lng}`} target="_blank" rel="noreferrer" className="inline-block bg-red-600 text-white px-4 py-2 rounded">Itinéraire →</a>
          </div>

          {/* SECTION AVIS */}
          <div className="mt-8 border-t pt-4">
            <h2 className="text-xl font-semibold mb-3">Avis des utilisateurs</h2>
            <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
              {reviews.length === 0 && <p className="text-gray-500">Aucun avis pour le moment.</p>}
              {reviews.map(rev => (
                <div key={rev.id} className="border-b pb-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{rev.prenom} {rev.nom}</span>
                    <span className="text-yellow-500">{'★'.repeat(rev.rating)}</span>
                  </div>
                  <p className="text-gray-700">{rev.comment}</p>
                  <p className="text-xs text-gray-400">{new Date(rev.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>

            {isLoggedIn ? (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <h3 className="font-medium mb-2">{userReview ? 'Modifier mon avis' : 'Donnez votre avis'}</h3>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700">Note</label>
                  <select value={newRating} onChange={e => setNewRating(e.target.value)} className="border rounded p-1">
                    {[1,2,3,4,5].map(n => <option key={n}>{n} étoile{n>1?'s':''}</option>)}
                  </select>
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700">Commentaire</label>
                  <textarea
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    rows="3"
                    className="w-full border p-2 rounded"
                    placeholder="Votre expérience dans ce club..."
                  />
                </div>
                <Button onClick={submitReview} disabled={submitting} className="w-full">
                  {submitting ? 'Envoi...' : (userReview ? 'Modifier mon avis' : 'Envoyer')}
                </Button>
              </div>
            ) : (
              <div className="mt-4 p-4 bg-gray-50 rounded text-center">
                <p className="text-gray-600">
                  <Link to="/connexion" className="text-red-600 font-semibold">Connectez-vous</Link> pour laisser un avis.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
export default CenterDetailPage