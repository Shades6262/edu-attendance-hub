import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../api/auth';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../utils/useDocumentTitle';
import { AuthThemeToggle } from '../../components/common/AuthThemeToggle';
import { BookOpen, ArrowLeft, MailCheck } from 'lucide-react';

const ForgotPassword = () => {
  useDocumentTitle('Forgot Password');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      await forgotPassword(email);
      setSubmitted(true);
      showToast('Password reset instructions sent if account exists.', 'success');
    } catch (err) {
      if (err.response?.status === 429) {
        showToast(err.response.data?.message || 'Too many requests. Please try again later.', 'error');
      } else {
        setSubmitted(true);
      }
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Forgot Password</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Enter your email to receive a password reset link</p>
        </div>

        {submitted ? (
          <div className="text-center py-4">
            <MailCheck className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Check your email</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              If an account exists with <span className="font-medium text-gray-800 dark:text-gray-200">{email}</span>, we have sent instructions to reset your password.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-sm font-semibold transition shadow-md"
            >
              <ArrowLeft size={16} />
              <span>Back to Login</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-600 shadow-inner text-sm transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-50 transition shadow-lg shadow-green-600/25 flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Sending link...' : 'Send Reset Link'}</span>
            </button>

            <div className="text-center mt-6">
              <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400 hover:underline font-medium">
                <ArrowLeft size={14} />
                <span>Return to Login</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
