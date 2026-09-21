import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';

const links = [
  { to: '/student', label: 'Assignments', end: true },
  { to: '/student/attendance', label: 'My Attendance' },
];

const StudentLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Student Dashboard" links={links} />
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;