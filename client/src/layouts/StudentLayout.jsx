import { DashboardLayout } from '../components/common/DashboardLayout';
import { BookOpen, CalendarCheck, MessageSquare } from 'lucide-react';
import { useDocumentTitle } from '../utils/useDocumentTitle';

const links = [
  { to: '/student', label: 'Assignments', end: true, icon: BookOpen },
  { to: '/student/attendance', label: 'My Attendance', icon: CalendarCheck },
  { to: '/student/chat', label: 'Chat', icon: MessageSquare },
];

const StudentLayout = () => {
  useDocumentTitle('Student Dashboard');
  return <DashboardLayout title="Student Dashboard" links={links} />;
};

export default StudentLayout;
