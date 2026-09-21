import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
  });
  const [error, setError] = useState('');
  const [pendingMessage, setPendingMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPendingMessage('');
    setLoading(true);

    try {
      const res = await registerUser(form);

      // students get a token immediately (auto-approved)
      if (res.data.token) {
        login(res.data.user, res.data.token);
        navigate('/student');
      } else {
        // instructor/admin — pending approval, no token returned
        setPendingMessage(res.data.message);
      }
    } catch (err) {
      if (!err.response) {
        setError('Cannot reach the server. Check your connection and try again.');
      } else {
        setError(err.response.data?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>

        {error && (
          <div className="bg-red-100 text-red-700 text-sm p-3 rounded mb-4">
            {error}
          </div>
        )}
        {pendingMessage && (
          <div className="bg-yellow-100 text-yellow-800 text-sm p-3 rounded mb-4">
            {pendingMessage}{' '}
            <Link to="/login" className="underline font-medium">
              Go to login
            </Link>
          </div>
        )}

        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
          minLength={6}
          className="w-full border rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">
          I am a...
        </label>
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="student">Student</option>
          <option value="instructor">Instructor</option>
          <option value="admin">Admin</option>
        </select>

        {(form.role === 'instructor' || form.role === 'admin') && (
          <p className="text-xs text-gray-500 mb-4 -mt-3">
            Instructor and admin accounts require approval from an existing admin
            before you can log in.
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>

        <p className="text-sm text-center mt-4 text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;