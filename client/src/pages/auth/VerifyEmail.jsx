import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { verifyEmail, resendVerification } from '../../api/auth';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../utils/useDocumentTitle';
import { AuthThemeToggle } from '../../components/common/AuthThemeToggle';
import { SharedLoader } from '../../components/loaders/SharedLoader';
import { BookOpen, CheckCircle, AlertCircle } from 'lucide-react';

const VerifyEmail = () => {
  useDocumentTitle('Verify Email');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { showToast } = useToast();

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [emailForResend, setEmailForResend] = useState('');
  const [resending, setResending] = useState(false);
  const verifiedRef = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Verification token is missing.');
      return;
    }

    if (verifiedRef.current) return;
    verifiedRef.current = true;

    verifyEmail(token)
      .then(() => {
        setStatus('success');
        showToast('Email verified successfully!', 'success');
      })
      .catch((err) => {
        setStatus('error');
        setErrorMessage(err.response?.data?.message || 'Invalid or expired verification link.');
      });
  }, [token, showToast]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!emailForResend.trim()) {
      showToast('Please enter your email address', 'error');
      return;
    }

    setResending(true);
    try {
      await resendVerification(emailForResend);
      showToast('If an account exists with this email, a verification link has been sent.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to resend verification email', 'error');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 transition-colors relative">
      <AuthThemeToggle />

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center text-white shadow-md">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold text-green-800 dark:text-green-400 font-magz">EDUHUB</span>
        </div>

        {status === 'loading' && (
          <div>
            <SharedLoader message="Verifying your email address..." />
          </div>
        )}

        {status === 'success' && (
          <div className="py-4">
            <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Email Verified!</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Your email has been successfully verified. You can now log in to your account.
            </p>
            <Link
              to="/login"
              className="inline-block w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-sm font-semibold transition shadow-md"
            >
              Continue to Login
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="py-4">
            <AlertCircle className="w-16 h-16 text-red-600 dark:text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Verification Failed</h2>
            <p className="text-sm text-red-600 dark:text-red-400 mb-6">{errorMessage}</p>

            <div className="border-t border-gray-200 dark:border-gray-800 pt-6 mt-4 text-left">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Resend Verification Email</h3>
              <form onSubmit={handleResend} className="space-y-3">
                <input
                  type="email"
                  value={emailForResend}
                  onChange={(e) => setEmailForResend(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="submit"
                  disabled={resending}
                  className="w-full bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 text-white py-2.5 rounded-xl text-xs font-semibold transition disabled:opacity-50"
                >
                  {resending ? 'Sending...' : 'Resend Verification Link'}
                </button>
              </form>
            </div>

            <div className="mt-6">
              <Link to="/login" className="text-sm text-green-600 dark:text-green-400 hover:underline font-medium">
                Return to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
