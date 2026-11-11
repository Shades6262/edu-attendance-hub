import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { resetPassword } from '../../api/auth';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../utils/useDocumentTitle';
import { AuthThemeToggle } from '../../components/common/AuthThemeToggle';
import { BookOpen, CheckCircle } from 'lucide-react';

const ResetPassword = () => {
  useDocumentTitle('Reset Password');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { showToast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      showToast('Reset token is missing', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ token, password });
      setSuccess(true);
      showToast('Password reset successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reset password. Link may be invalid or expired.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 transition-colors relative">
      <AuthThemeToggle />

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center text-white shadow-md">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold text-green-800 dark:text-green-400 font-magz">EDUHUB</span>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Reset Password</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Enter your new secure password below</p>
        </div>

        {success ? (
          <div className="text-center py-4">
            <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Password Reset Successful</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Your password has been reset successfully. You can now log in with your new credentials.
            </p>
            <Link
              to="/login"
              className="inline-block w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-sm font-semibold transition shadow-md"
            >
              Proceed to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-600 shadow-inner text-sm transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-600 shadow-inner text-sm transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-50 transition shadow-lg shadow-green-600/25 flex items-center justify-center gap-2 mt-2"
            >
              <span>{loading ? 'Resetting...' : 'Reset Password'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
