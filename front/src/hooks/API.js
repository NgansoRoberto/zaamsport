// Toujours absolu depuis la racine du site — évite les URL relatives à la page courante
const _raw = import.meta.env.VITE_API_BASE_URL ?? '/api';
export const API_BASE = _raw.startsWith('http') ? _raw : '/' + _raw.replace(/^\/+/, '');

async function parseError(response) {
  try {
    const data = await response.json();
    return data.error || data.message || `Erreur ${response.status}`;
  } catch {
    return `Erreur serveur (${response.status})`;
  }
}

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(!isFormData && options.body !== undefined && { 'Content-Type': 'application/json' }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  if (response.status === 204) return null;

  const text = await response.text();
  if (!text) return null;
  return JSON.parse(text);
}

export function getRoleDashboardPath(role) {
  switch (role) {
    case 'manager':
      return '/manager/dashboard';
    case 'admin':
      return '/admin/dashboard';
    default:
      return '/questionnaire';
  }
}

export function buildSessionFromAuthResponse(data, fallbackEmail = '') {
  const displayName =
    data.displayName ||
    (data.prenom && data.nom ? `${data.prenom} ${data.nom}`.trim() : undefined);

  return {
    token: data.token,
    role: data.role,
    userId: String(data.userId),
    email: data.email || fallbackEmail,
    displayName,
  };
}

export async function fetchClubsNearby(lat, lng, radius = 15) {
  return apiFetch(`/clubs?lat=${lat}&lng=${lng}&radius=${radius}`);
}
