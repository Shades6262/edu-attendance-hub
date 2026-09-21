import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';

const links = [
  { to: '/admin', label: 'Pending Approvals', end: true },
  { to: '/admin/users', label: 'All Users' },
  { to: '/kiosk', label: 'Attendance Kiosk' },
];

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Admin Dashboard" links={links} />
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;