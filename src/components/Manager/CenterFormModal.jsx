// src/components/manager/CenterFormModal.jsx
import { useState, useEffect } from 'react';
import Button from '../common/Button';
import { Image, X } from 'lucide-react';

const equipmentList = ["Cardio", "Musculation", "Piscine", "Sauna", "CrossFit", "Yoga", "Vestiaires", "Douches"];
const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

 function CenterFormModal({ isOpen, onClose, onSubmit, initialData }) {
  // Données du formulaire
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    lat: '',
    lng: '',
    type: 'Salle de sport',
    pmr: false,
    equipment: [],
    hours: {
      monday: '9h-21h', tuesday: '9h-21h', wednesday: '9h-21h',
      thursday: '9h-21h', friday: '9h-21h', saturday: '10h-18h', sunday: 'Fermé'
    },
    prices: { monthly: '', single: '', coaching: '' },
    images: []
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [addressQuery, setAddressQuery] = useState('');
  const [geocoding, setGeocoding] = useState(false);

  // Remplir le formulaire en mode édition / réinitialisation
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        hours: initialData.hours || formData.hours,
        prices: initialData.prices || formData.prices,
        images: initialData.images || []
      });
      setImageFiles([]);
      setAddressQuery('');
    } else {
      setFormData({
        name: '', address: '', lat: '', lng: '', type: 'Salle de sport', pmr: false,
        equipment: [],
        hours: { monday: '9h-21h', tuesday: '9h-21h', wednesday: '9h-21h',
                 thursday: '9h-21h', friday: '9h-21h', saturday: '10h-18h', sunday: 'Fermé' },
        prices: { monthly: '', single: '', coaching: '' },
        images: []
      });
      setImageFiles([]);
      setAddressQuery('');
    }
  }, [initialData, isOpen]);

  // Gestion des changements des champs standards
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox' && name !== 'equipment') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'equipment') {
      const selected = [...formData.equipment];
      if (checked) selected.push(value);
      else {
        const idx = selected.indexOf(value);
        if (idx !== -1) selected.splice(idx, 1);
      }
      setFormData(prev => ({ ...prev, equipment: selected }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleHourChange = (day, value) => {
    setFormData(prev => ({ ...prev, hours: { ...prev.hours, [day]: value } }));
  };

  const handlePriceChange = (key, value) => {
    setFormData(prev => ({ ...prev, prices: { ...prev.prices, [key]: value } }));
  };

  // Gestion des images
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);
    const previews = files.map(file => URL.createObjectURL(file));
    setFormData(prev => ({ ...prev, images: [...prev.images, ...previews] }));
  };

  const removeImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData(prev => ({ ...prev, images: newImages }));
    if (imageFiles.length) {
      const newFiles = [...imageFiles];
      newFiles.splice(index, 1);
      setImageFiles(newFiles);
    }
  };

  // Géocodage d’une adresse / quartier (Nominatim)
  const geocodeAddress = async (query) => {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ", Douala, Cameroun")}&format=json&limit=1`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
      throw new Error("Adresse non trouvée");
    } catch (err) {
      alert("Impossible de géolocaliser cette adresse. Vérifiez le quartier.");
      return null;
    }
  };

  const handleGeocode = async () => {
    if (!addressQuery.trim()) return;
    setGeocoding(true);
    const coords = await geocodeAddress(addressQuery);
    if (coords) {
      setFormData(prev => ({ ...prev, lat: coords.lat, lng: coords.lng }));
      alert(`Coordonnées trouvées : ${coords.lat}, ${coords.lng}`);
    }
    setGeocoding(false);
  };

  // Soumission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.address) {
      alert("Nom et adresse sont obligatoires.");
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('address', formData.address);
    formDataToSend.append('lat', formData.lat);
    formDataToSend.append('lng', formData.lng);
    formDataToSend.append('type', formData.type);
    formDataToSend.append('pmr', formData.pmr ? '1' : '0');
    formDataToSend.append('equipment', JSON.stringify(formData.equipment));
    formDataToSend.append('hours', JSON.stringify(formData.hours));
    formDataToSend.append('prices', JSON.stringify(formData.prices));
    imageFiles.forEach(file => {
      formDataToSend.append('images[]', file);
    });
    onSubmit(formDataToSend);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">{initialData ? 'Modifier le centre' : 'Ajouter un centre'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informations générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom du centre *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 w-full border rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select name="type" value={formData.type} onChange={handleChange} className="mt-1 w-full border rounded-md p-2">
                <option>Salle de sport</option>
                <option>Piscine</option>
                <option>CrossFit</option>
                <option>Yoga</option>
                <option>Musculation</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Adresse *</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} required className="mt-1 w-full border rounded-md p-2" />
            </div>
            {/* Géocodage */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Quartier / Adresse (pour la carte) *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: PK8, Douala"
                  value={addressQuery}
                  onChange={(e) => setAddressQuery(e.target.value)}
                  className="flex-1 border rounded-md p-2"
                />
                <Button type="button" variant="secondary" onClick={handleGeocode} disabled={geocoding}>
                  {geocoding ? "Recherche..." : "puis cliquer ici Géolocaliser"}
                </Button>
              </div>
              {formData.lat && formData.lng && (
                <p className="text-xs text-green-600 mt-1">
                  Coordonnées : {formData.lat}, {formData.lng}
                </p>
              )}
            </div>
          </div>

          {/* PMR */}
          <div className="flex items-center gap-2">
            <input type="checkbox" name="pmr" checked={formData.pmr} onChange={handleChange} id="pmr" />
            <label htmlFor="pmr" className="text-sm font-medium text-gray-700">Accès PMR</label>
          </div>

          {/* Équipements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Équipements</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {equipmentList.map(eq => (
                <label key={eq} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" value={eq} checked={formData.equipment.includes(eq)} onChange={handleChange} name="equipment" />
                  {eq}
                </label>
              ))}
            </div>
          </div>

          {/* Horaires */}
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Horaires d'ouverture</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {days.map((day, idx) => (
                <div key={day}>
                  <label className="block text-xs text-gray-500">{dayNames[idx]}</label>
                  <input type="text" value={formData.hours[day]} onChange={(e) => handleHourChange(day, e.target.value)} className="w-full border rounded-md p-1 text-sm" />
                </div>
              ))}
            </div>
          </div>

          {/* Tarifs */}
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Tarifs (en FCFA)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs">Abonnement mensuel</label>
                <input type="text" value={formData.prices.monthly} onChange={(e) => handlePriceChange('monthly', e.target.value)} className="w-full border rounded-md p-1" />
              </div>
              <div>
                <label className="block text-xs">Séance libre</label>
                <input type="text" value={formData.prices.single} onChange={(e) => handlePriceChange('single', e.target.value)} className="w-full border rounded-md p-1" />
              </div>
              <div>
                <label className="block text-xs">Coaching (séance)</label>
                <input type="text" value={formData.prices.coaching} onChange={(e) => handlePriceChange('coaching', e.target.value)} className="w-full border rounded-md p-1" />
              </div>
            </div>
          </div>

          {/* Photos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Photos du centre</label>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 transition">
                <Image size={18} />
                <span>Choisir des photos</span>
                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
              <span className="text-xs text-gray-500">(jpg, png – jusqu’à 5 photos)</span>
            </div>
            {formData.images.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="relative w-20 h-20 group">
                    <img src={img} alt={`photo ${idx + 1}`} className="w-full h-full object-cover rounded-lg shadow-md border border-gray-200" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700 transition shadow-sm"
                      title="Supprimer cette photo"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">Cliquez sur le bouton rouge pour sélectionner des images depuis votre appareil.</p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
            <Button type="submit">Enregistrer</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default CenterFormModal