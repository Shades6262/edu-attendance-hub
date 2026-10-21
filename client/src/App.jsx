import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';
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
import SubmitTrackerReport from './pages/instructor/SubmitTrackerReport';
import MyTrackerReports from './pages/instructor/MyTrackerReports';
import ReviewTrackerReports from './pages/admin/ReviewTrackerReports';
import MyChat from './pages/student/MyChat';
import AskGemini from './pages/shared/AskGemini';

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
      <ThemeProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route
                path="/"
                element={
                  <PublicRoute>
                    <Navigate to="/login" replace />
                  </PublicRoute>
                }
              />
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />

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
                <Route path="reports" element={<ReviewTrackerReports />} />
                <Route path="ask" element={<AskGemini />} />
                <Route path="ask/:conversationId" element={<AskGemini />} />
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
                <Route path="reports" element={<MyTrackerReports />} />
                <Route path="reports/new" element={<SubmitTrackerReport />} />
                <Route path="ask" element={<AskGemini />} />
                <Route path="ask/:conversationId" element={<AskGemini />} />
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
                <Route path="chat" element={<MyChat />} />
                <Route path="ask" element={<AskGemini />} />
                <Route path="ask/:conversationId" element={<AskGemini />} />
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
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
