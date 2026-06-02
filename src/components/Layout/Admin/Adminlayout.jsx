// src/layouts/AdminLayout.jsx
import { Outlet } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';
import AdminSidebar from '../../admin/AdminSidebar';
function AdminLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />  {/* Ici s'afficheront les pages enfants : Dashboard, Users, etc. */}
        </main>
      </div>
      <Footer />
    </div>
  );
}
export default AdminLayout