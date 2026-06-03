// src/components/home/HowItWorks.jsx
import { MapPin, Sliders, ThumbsUp, Calendar } from 'lucide-react';

const steps = [
  { icon: MapPin, title: '1. Géo-localisez-vous', description: 'Cliquez sur "Me localiser" ou entrez votre adresse.' },
  { icon: Sliders, title: '2. Filtrez vos critères', description: 'Accessibilité PMR, parking, transport, budget...' },
  { icon: ThumbsUp, title: '3. Recevez les meilleurs scores', description: 'Nos algorithmes vous classent les salles.' },
  { icon: Calendar, title: '4. Réservez votre séance', description: 'En quelques clics, trouvez votre bonheur.' },
];

 function HowWord() {
  return (
    <section className="py-16 bg-white ">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10">Comment ça fonctionne ?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="text-center bg-black text-white p-6 rounded-xl 
            shadow-md hover:shadow-lg transition">
              <step.icon size={48} className="mx-auto text-red-900 mb-4 " />
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-white-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
export default HowWord