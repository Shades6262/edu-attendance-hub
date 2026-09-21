import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';

const links = [
  { to: '/instructor', label: 'My Groups', end: true },
  { to: '/instructor/submissions', label: 'Review Submissions' },
  { to: '/kiosk', label: 'Attendance Kiosk' },
];

const InstructorLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Instructor Dashboard" links={links} />
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default InstructorLayout;