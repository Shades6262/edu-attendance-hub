import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGroups } from '../../api/groups';
import { createTrackerReport } from '../../api/trackerReports';
import { SharedLoader } from '../../components/loaders/SharedLoader';
import { EmptyState } from '../../components/common/EmptyState';

const SubmitTrackerReport = () => {
  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', groupId: '' });
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await getGroups();
        setGroups(res.data);
        if (res.data.length === 1) {
          setForm((f) => ({ ...f, groupId: res.data[0]._id }));
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load groups');
      } finally {
        setLoadingGroups(false);
      }
    };
    fetchGroups();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.groupId) {
      setError('Select a group first');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await createTrackerReport(form);
      navigate('/instructor/reports');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingGroups) return <SharedLoader message="Loading..." />;

  return (
    <div className="max-w-lg">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Submit Tracker Report</h2>

      {groups.length === 0 ? (
        <EmptyState
          title="No groups assigned"
          description="You need a group assigned before you can submit a report."
        />
      ) : (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
          {error && (
            <div className="bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 text-sm p-3 rounded-xl mb-4">{error}</div>
          )}

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Group</label>
          <select
            name="groupId"
            value={form.groupId}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 mb-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-xs"
          >
            <option value="">Select a group...</option>
            {groups.map((g) => (
              <option key={g._id} value={g._id}>{g.name}</option>
            ))}
          </select>

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="e.g. Week 3 Progress Report"
            className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 mb-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-xs"
          />

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Report</label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            required
            rows={6}
            placeholder="Summarize attendance, progress, concerns, standout students..."
            className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 mb-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-inner"
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-green-600 text-white py-2.5 rounded-xl hover:bg-green-700 disabled:opacity-50 transition shadow-sm font-semibold"
          >
            {submitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      )}
    </div>
  );
};

export default SubmitTrackerReport;
