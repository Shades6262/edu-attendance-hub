import { DashboardLayout } from '../components/common/DashboardLayout';
import { UserCheck, Users, FileText, QrCode } from 'lucide-react';
import { useDocumentTitle } from '../utils/useDocumentTitle';

const links = [
  { to: '/admin', label: 'Pending Approvals', end: true, icon: UserCheck },
  { to: '/admin/users', label: 'All Users', icon: Users },
  { to: '/admin/reports', label: 'Tracker Reports', icon: FileText },
  { to: '/kiosk', label: 'Attendance Kiosk', icon: QrCode },
];

const AdminLayout = () => {
  useDocumentTitle('Admin Dashboard');
  return <DashboardLayout title="Admin Dashboard" links={links} />;
};

export default AdminLayout;
