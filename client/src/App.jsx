import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import AdminLayout from './layouts/AdminLayout';
import InstructorLayout from './layouts/InstructorLayout';
import StudentLayout from './layouts/StudentLayout';
import PendingApprovals from './pages/admin/PendingApprovals';
import UserManagement from './pages/admin/UserManagement';
import MyGroups from './pages/instructor/MyGroups';
import GroupDetail from './pages/instructor/GroupDetail';
import PostAssignment from './pages/instructor/PostAssignment';
import ReviewSubmissions from './pages/instructor/ReviewSubmissions';
import MyAssignments from './pages/student/MyAssignments';
import AssignmentDetail from './pages/student/AssignmentDetail';
import MyAttendance from './pages/student/MyAttendance';
import BarcodeKiosk from './pages/attendance/BarcodeKiosk';

// placeholder dashboard content — replaced with real pages in upcoming steps
const AdminHome = () => <div>Admin home content (coming soon)</div>;
const InstructorHome = () => <div>Instructor home content (coming soon)</div>;
const StudentHome = () => <div>Student home content (coming soon)</div>;

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-3">
    <p className="text-xl font-semibold">Page not found</p>
    <a href="/login" className="text-blue-600 hover:underline">
      Go to login
    </a>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['admin']}>
                  <AdminLayout />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<PendingApprovals />} />
            <Route path="users" element={<UserManagement />} />
          </Route>

          <Route
            path="/instructor"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['instructor']}>
                  <InstructorLayout />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<MyGroups />} />
            <Route path="groups" element={<MyGroups />} />
            <Route path="groups/:id" element={<GroupDetail />} />
            <Route path="assignments/new" element={<PostAssignment />} />
            <Route path="submissions" element={<ReviewSubmissions />} />
          </Route>

          <Route
            path="/student"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['student']}>
                  <StudentLayout />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<MyAssignments />} />
            <Route path="assignments" element={<MyAssignments />} />
            <Route path="assignments/:id" element={<AssignmentDetail />} />
            <Route path="attendance" element={<MyAttendance />} />
          </Route>

           <Route
            path="/kiosk"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['admin', 'instructor']}>
                  <BarcodeKiosk />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;