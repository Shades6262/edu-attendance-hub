import { useNavigate } from 'react-router-dom';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../../firebase';
import { googleAuth } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

const GoogleLogo = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

const GoogleButton = ({ role, disabled, onLoadingChange, onError, onInfo, onSuccess }) => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleClick = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      onLoadingChange?.(true);

      const idToken = await result.user.getIdToken();
      const res = await googleAuth({ idToken, ...(role ? { role } : {}) });

      if (res.data.token) {
        login(res.data.user, res.data.token);
        onSuccess?.(res.data.user);
        const r = res.data.user.role;
        navigate(r === 'admin' ? '/admin' : r === 'instructor' ? '/instructor' : '/student');
      } else {
        // new instructor/admin: pending approval, no token
        onInfo?.(res.data.message);
      }
    } catch (err) {
      console.error('Google sign-in error:', err.code, err.message, err.response?.data);
      const code = err.code;
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        return; // user just closed the popup, nothing to report
      }
      if (code === 'auth/popup-blocked') {
        onError?.('Your browser blocked the Google popup. Allow popups for this site and try again.');
      } else if (code === 'auth/network-request-failed' || (!err.response && !code)) {
        onError?.('Cannot reach the server. Check your connection and try again.');
      } else {
        onError?.(err.response?.data?.message || 'Google sign-in failed. Please try again.');
      }
    } finally {
      onLoadingChange?.(false);
      // my own JWT is the session; don't leave a Firebase session behind
      signOut(auth).catch(() => {});
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-100 text-sm font-semibold py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition"
    >
      <GoogleLogo />
      Continue with Google
    </button>
  );
};

export default GoogleButton;