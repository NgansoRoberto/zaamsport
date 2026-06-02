import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './Contexts/AuthContext';
import HomePage from './pages/public/HomePage';
import RegisterPage from './pages/public/RegisterPage';
import LoginPage from './pages/public/LoginPage';
import MapPagerecommandation from './pages/utilisateur/MapPagerecommandation';
import DashboardPage from './pages/manager/DashboardPage';
import QuestionnairePage from './pages/utilisateur/QuestionnairePage';
import ClubsPage from './pages/public/Clubs';
import AdminDashboard from './pages/Admin/AdminDashboard';
import PrivateRoute from './components/common/PrivateRoute';
import CenterDetailPage from './pages/utilisateur/CenterDetailPage';
import RecommandationsPage from './pages/utilisateur/RecommandationPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/inscription" element={<RegisterPage />} />
          <Route path="/connexion" element={<LoginPage />} />
          <Route path="/carte" element={<ClubsPage />} />
          <Route path="/clubspage" element={<ClubsPage />} />
          <Route path="/Clubspage" element={<Navigate to="/clubspage" replace />} />
  <Route path="/club/:id" element={<CenterDetailPage />} /> 
  <Route path="/recommandations" element={<RecommandationsPage />} />
          <Route
            path="/questionnaire"
            element={
              <PrivateRoute allowedRoles={['user']}>
                <QuestionnairePage />
              </PrivateRoute>
            }
          />
          <Route path="/utilisateur/recommandation" element={<MapPagerecommandation />} />
          <Route
            path="/manager/dashboard"
            element={
              <PrivateRoute allowedRoles={['manager']}>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route path="/admin/dashboardAdmin" element={<Navigate to="/admin/dashboard" replace />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
