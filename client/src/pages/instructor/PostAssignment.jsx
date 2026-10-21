import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { createAssignment } from '../../api/assignments';
import { useToast } from '../../context/ToastContext';

const PostAssignment = () => {
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get('groupId');
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState({ title: '', description: '', dueDate: '' });
  const [loading, setLoading] = useState(false);

  if (!groupId) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-950/50 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800 text-sm p-4 rounded-xl">
        No group selected. Go to{' '}
        <Link to="/instructor/groups" className="underline font-medium">
          My Groups
        </Link>{' '}
        and choose a group first.
      </div>
    );
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createAssignment({ ...form, groupId });
      showToast('Assignment posted successfully!', 'success');
      navigate(`/instructor/groups/${groupId}`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to post assignment', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Post Assignment</h2>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 mb-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-xs"
        />

        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          required
          rows={4}
          className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 mb-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-xs"
        />

        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
        <input
          type="date"
          name="dueDate"
          value={form.dueDate}
          onChange={handleChange}
          className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 mb-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-xs"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2.5 rounded-xl hover:bg-green-700 disabled:opacity-50 transition shadow-sm font-semibold"
        >
          {loading ? 'Posting...' : 'Post Assignment'}
        </button>
      </form>
    </div>
  );
};

export default PostAssignment;
