// src/components/home/OffersCarousel.jsx
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import Card from '../common/Card';

const offers = [
  { id: 1, title: '-30% sur l’abonnement annuel', description: 'Dans tous les centres partenaires', badge: 'Populaire', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600' },
  { id: 2, title: 'Coaching offert (1 mois)', description: 'Pour tout nouvel adhérent', badge: 'Nouveau', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600' },
  { id: 3, title: 'Accès illimité à nos coachs IA', description: 'Suivi personnalisé 24/7', badge: 'Innovant', image: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=600' },
];

 function OffertsCarousel() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10">Meilleures offres du moment</h2>
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          spaceBetween={30}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation
        >
          {offers.map((offer) => (
            <SwiperSlide key={offer.id}>
              <Card image={offer.image} title={offer.title} description={offer.description} badge={offer.badge} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
export default OffertsCarousel