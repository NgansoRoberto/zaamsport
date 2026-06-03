// src/pages/user/QuestionnairePage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';
import Button from '../../components/common/Button';
import { API_BASE } from '../../hooks/API';

function QuestionnairePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    location: { lat: null, lng: null, address: '' },
    transport: '',
    goal: '',
    accessibility: [],
    budget: '',
    hours: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const questions = [
    {
      id: 'location',
      title: 'Où habitez-vous ?',
      description: 'Nous utiliserons cette position pour trouver des centres à proximité.',
      required: true,
      component: (
        <div>
          <button
            className="bg-red-600 text-white px-4 py-2 rounded mb-4"
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((pos) => {
                  setAnswers({ ...answers, location: { lat: pos.coords.latitude, lng: pos.coords.longitude, address: '' } });
                });
              }
            }}
          >
             Utiliser ma position actuelle
          </button>
          <input
            type="text"
            placeholder="Ou saisissez une adresse"
            className="w-full p-2 border rounded"
            onChange={(e) => setAnswers({ ...answers, location: { ...answers.location, address: e.target.value } })}
          />
          {answers.location.lat && answers.location.lng && (
            <p className="text-green-600 text-sm mt-2">✓ Position enregistrée</p>
          )}
        </div>
      ),
    },
    {
      id: 'transport',
      title: 'Comment vous déplacez-vous généralement ?',
      options: ['Voiture', 'Transport en commun', 'Vélo', 'Marche'],
      required: true,
    },
    {
      id: 'goal',
      title: 'Quel est votre objectif principal ?',
      options: ['Prise de masse', 'Perte de poids', 'Remise en forme', 'Rééducation', 'Autre'],
      required: true,
    },
    {
      id: 'accessibility',
      title: 'Quels critères d’accessibilité sont indispensables pour vous ?',
      options: ['Accès PMR(acces pour les personnes à mobilités reduite)', 'Ascenseur', 'Sanitaires adaptés', 'parking'],
      multiple: true,
      required: false,
    },
    {
      id: 'budget',
      title: 'Quel est votre budget mensuel ?',
      options: ['Moins de 2000f', '2000-4000f', '4000fcfa-6000fcfa', 'Plus de 6000fcfa'],
      required: true,
    },
    {
      id: 'hours',
      title: 'À quels horaires souhaitez-vous vous entraîner ?',
      options: ['Matin (6h-10h)', 'Midi (10h-14h)', 'Après-midi (14h-18h)', 'Soir (18h-22h)'],
      required: true,
    },
  ];

  const current = questions[step];
  const isMultiple = current.multiple;
  const isRequired = current.required;

  const updateAnswer = (value) => {
    if (isMultiple) {
      const currentVals = answers[current.id] || [];
      const newVals = currentVals.includes(value)
        ? currentVals.filter(v => v !== value)
        : [...currentVals, value];
      setAnswers({ ...answers, [current.id]: newVals });
    } else {
      setAnswers({ ...answers, [current.id]: value });
    }
  };

  const handleNext = async () => {
    // Vérifier que la question obligatoire est répondue
    if (isRequired) {
      if (current.id === 'location') {
        if (!answers.location.lat || !answers.location.lng) {
          alert('Veuillez indiquer votre position (cliquez sur "Utiliser ma position" ou saisissez une adresse)');
          return;
        }
      } else {
        if (!answers[current.id]) {
          alert('Veuillez répondre à cette question avant de continuer');
          return;
        }
      }
    }

    if (step === questions.length - 1) {
      // Dernière étape : tout vérifier
      if (!answers.transport || !answers.goal || !answers.budget || !answers.hours || !answers.location.lat) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
      }
      setSubmitting(true);
      // Sauvegarde locale
      localStorage.setItem('userProfile', JSON.stringify(answers));
      // Sauvegarde en base (si connecté)
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await fetch(`${API_BASE}/profile`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(answers)
          });
        } catch (err) {
          console.error('Erreur sauvegarde profil', err);
        }
      }
      setSubmitting(false);
      navigate('/recommandations');
    } else {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-100 py-6 sm:py-12 px-4">
        <div className="container mx-auto max-w-2xl bg-white rounded-xl shadow-md p-5 sm:p-8">
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-red-600 h-2 rounded-full" style={{ width: `${((step + 1) / questions.length) * 100}%` }}></div>
            </div>
            <p className="text-right text-sm text-gray-500 mt-2">Question {step + 1} / {questions.length}</p>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">{current.title}</h2>
          <p className="text-gray-600 mb-6">{current.description}</p>
          {current.component ? (
            current.component
          ) : (
            <div className="space-y-3">
              {current.options.map(opt => (
                <label key={opt} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type={isMultiple ? 'checkbox' : 'radio'}
                    name={current.id}
                    value={opt}
                    checked={isMultiple ? (answers[current.id] || []).includes(opt) : answers[current.id] === opt}
                    onChange={() => updateAnswer(opt)}
                    className="h-4 w-4 text-red-600"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          )}
          <div className="mt-8 flex flex-col-reverse sm:flex-row justify-between gap-3">
            {step > 0 && (
              <Button variant="secondary" onClick={handlePrev} className="w-full sm:w-auto">
                Précédent
              </Button>
            )}
            <Button onClick={handleNext} disabled={submitting} className="w-full sm:w-auto sm:ml-auto">
              {submitting ? 'Enregistrement...' : (step === questions.length - 1 ? 'Terminer' : 'Suivant')}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default QuestionnairePage;