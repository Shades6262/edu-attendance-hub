import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../utils/useDocumentTitle';
import { LoginLoader } from '../../components/loaders/LoginLoader';
import { AuthThemeToggle } from '../../components/common/AuthThemeToggle';
import { BookOpen, CheckCircle2 } from 'lucide-react';

const Login = () => {
  useDocumentTitle('Login');
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const [res] = await Promise.all([
        loginUser(form),
        new Promise((resolve) => setTimeout(resolve, 2000))
      ]);
      login(res.data.user, res.data.token);
      showToast('Welcome back, ' + res.data.user.name + '!', 'success');

      const role = res.data.user.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'instructor') navigate('/instructor');
      else navigate('/student');
    } catch (err) {
      const msg = !err.response
        ? 'Cannot reach the server. Check your connection and try again.'
        : err.response.data?.message || 'Login failed';
      showToast(msg, 'error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-gray-950 font-sans transition-colors relative">
      <AuthThemeToggle />

      {/* Left Brand Showcase Panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-green-50 via-emerald-100 to-green-200 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950 border-r border-green-200/50 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-green-600 flex items-center justify-center text-white shadow-lg shadow-green-600/30">
            <BookOpen className="w-6 h-6" />
          </div>
          <span className="text-3xl font-bold text-green-800 dark:text-green-400 font-magz tracking-wide">EDUHUB</span>
        </div>

        <div className="my-auto max-w-md">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight leading-tight mb-4">
            Seamless Attendance & Management.
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-8">
            Deploy, monitor, and manage school attendance, student groups, assignments, and tracker reports from a single powerful dashboard.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Real-time barcode & manual attendance tracking</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Secure role-based dashboards for Admin, Instructors, and Students</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Integrated group chat, submissions, and progress reports</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} EDUHUB Attendance System. All rights reserved.
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center text-white shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold text-green-800 dark:text-green-400 font-magz">EDUHUB</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Welcome back</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-600 shadow-inner text-sm transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-600 shadow-inner text-sm transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-50 transition shadow-lg shadow-green-600/25 flex items-center justify-center gap-2"
            >
              <span>Sign In</span>
            </button>
          </form>

          <p className="text-sm text-center mt-8 text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-green-600 dark:text-green-400 hover:underline font-semibold">
              Create one free
            </Link>
          </p>
        </div>
      </div>

      {loading && <LoginLoader />}
    </div>
  );
};

export default Login;
