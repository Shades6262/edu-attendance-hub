import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTrackerReports } from '../../api/trackerReports';
import { SharedLoader } from '../../components/loaders/SharedLoader';
import { EmptyState } from '../../components/common/EmptyState';

const MyTrackerReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) return <SharedLoader message="Loading reports..." />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">My Tracker Reports</h2>
        <Link
          to="/instructor/reports/new"
          className="text-sm bg-green-600 text-white px-4 py-2.5 rounded-xl hover:bg-green-700 transition shadow-sm font-semibold"
        >
          + New Report
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 text-sm p-3 rounded-xl mb-4">{error}</div>
      )}

      {reports.length === 0 ? (
        <EmptyState
          title="No tracker reports yet"
          description="You haven't submitted any tracker reports yet."
        />
      ) : (
        <div className="space-y-3">
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
                {r.group?.name} · {new Date(r.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed bg-gray-50 dark:bg-gray-800 p-3.5 rounded-lg">{r.content}</p>

              {r.status === 'reviewed' && r.adminFeedback && (
                <div className="bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-xl p-4 mt-3">
                  <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1 uppercase tracking-wider">Admin Feedback</p>
                  <p className="text-sm text-green-900 dark:text-green-200">{r.adminFeedback}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTrackerReports;
