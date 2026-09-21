import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { createAssignment } from '../../api/assignments';

const PostAssignment = () => {
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get('groupId');
  const navigate = useNavigate();

  const [form, setForm] = useState({ title: '', description: '', dueDate: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!groupId) {
    return (
      <div className="bg-yellow-100 text-yellow-800 text-sm p-4 rounded">
        No group selected. Go to{' '}
        <Link to="/instructor/groups" className="underline">
          My Groups
        </Link>{' '}
        and choose a group first.
      </div>
    );
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createAssignment({ ...form, groupId });
      navigate(`/instructor/groups/${groupId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg">
      <h2 className="text-xl font-semibold mb-4">Post Assignment</h2>

      <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-6">
        {error && (
          <div className="bg-red-100 text-red-700 text-sm p-3 rounded mb-4">{error}</div>
        )}

        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          required
          rows={4}
          className="w-full border rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
        <input
          type="date"
          name="dueDate"
          value={form.dueDate}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Posting...' : 'Post Assignment'}
        </button>
      </form>
    </div>
  );
};

export default PostAssignment;