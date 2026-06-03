// src/data/managerCenters.js
export const managerCenters = [
  {
    id: 1,
    name: "FitZone Bonapriso",
    address: "123 rue du stade, Bonapriso, Douala",
    lat: 4.0589,
    lng: 9.7025,
    status: "approved", // approved, pending, rejected
    submittedAt: "2025-05-01",
    type: "Salle de sport",
    price: "25€/mois",
    open: true,
  },
  {
    id: 2,
    name: "AquaFit Akwa",
    address: "45 avenue de la plage, Akwa, Douala",
    lat: 4.0462,
    lng: 9.6873,
    status: "pending",
    submittedAt: "2025-05-10",
    type: "Piscine",
    price: "30€/mois",
    open: true,
  },
  {
    id: 3,
    name: "PowerGym Ndokoti",
    address: "78 boulevard de l'indépendance, Ndokoti, Douala",
    lat: 4.0333,
    lng: 9.7400,
    status: "rejected",
    submittedAt: "2025-04-20",
    type: "Musculation",
    price: "20€/mois",
    open: false,
  },
];