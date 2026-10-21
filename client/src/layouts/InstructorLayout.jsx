import { DashboardLayout } from '../components/common/DashboardLayout';
import { Users, CheckSquare, FileText, QrCode } from 'lucide-react';
import { useDocumentTitle } from '../utils/useDocumentTitle';

const links = [
  { to: '/instructor', label: 'My Groups', end: true, icon: Users },
  { to: '/instructor/submissions', label: 'Review Submissions', icon: CheckSquare },
  { to: '/instructor/reports', label: 'Tracker Reports', icon: FileText },
  { to: '/kiosk', label: 'Attendance Kiosk', icon: QrCode },
];

const InstructorLayout = () => {
  useDocumentTitle('Instructor Dashboard');
  return <DashboardLayout title="Instructor Dashboard" links={links} />;
};

export default InstructorLayout;
