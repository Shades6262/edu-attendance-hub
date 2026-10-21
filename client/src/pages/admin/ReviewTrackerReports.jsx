import { useState, useEffect } from 'react';
import { getTrackerReports, reviewTrackerReport } from '../../api/trackerReports';
import { SharedLoader } from '../../components/loaders/SharedLoader';
import { EmptyState } from '../../components/common/EmptyState';

const ReviewTrackerReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedbackDrafts, setFeedbackDrafts] = useState({});
  const [reviewingId, setReviewingId] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await getTrackerReports();
        setReports(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleReview = async (id) => {
    const feedback = feedbackDrafts[id] || '';
    setReviewingId(id);
    try {
      const res = await reviewTrackerReport(id, feedback);
      setReports((prev) => prev.map((r) => (r._id === id ? res.data.report : r)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save review');
    } finally {
      setReviewingId(null);
    }
  };

  if (loading) return <SharedLoader message="Loading reports..." />;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Tracker Reports</h2>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 text-sm p-3 rounded-xl mb-4">{error}</div>
      )}

      {reports.length === 0 ? (
        <EmptyState
          title="No tracker reports submitted"
          description="There are no tracker reports submitted yet."
        />
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <div key={r._id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{r.title}</h3>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    r.status === 'reviewed'
                      ? 'bg-green-50 dark:bg-green-950/60 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                      : 'bg-yellow-50 dark:bg-yellow-950/60 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800'
                  }`}
                >
                  {r.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                {r.instructor?.name} · {r.group?.name} ·{' '}
                {new Date(r.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed mb-4 bg-gray-50 dark:bg-gray-800 p-3.5 rounded-lg">{r.content}</p>

              <textarea
                placeholder="Leave feedback..."
                value={feedbackDrafts[r._id] ?? r.adminFeedback ?? ''}
                onChange={(e) =>
                  setFeedbackDrafts((prev) => ({ ...prev, [r._id]: e.target.value }))
                }
                rows={2}
                className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm mb-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-inner"
              />

              <button
                onClick={() => handleReview(r._id)}
                disabled={reviewingId === r._id}
                className="text-xs bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50 transition shadow-sm"
              >
                {reviewingId === r._id ? 'Saving...' : 'Save Review'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewTrackerReports;
