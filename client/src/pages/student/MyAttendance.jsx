import { useState, useEffect } from 'react';
import { getMyAttendance } from '../../api/attendance';
import { SharedLoader } from '../../components/loaders/SharedLoader';
import { EmptyState } from '../../components/common/EmptyState';

const formatTime = (isoString) => {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const MyAttendance = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await getMyAttendance();
        setRecords(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load attendance');
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  if (loading) return <SharedLoader message="Loading attendance..." />;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">My Attendance</h2>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 text-sm p-3 rounded-xl mb-4">{error}</div>
      )}

      {records.length === 0 ? (
        <EmptyState
          title="No attendance records"
          description="You don't have any attendance records yet."
        />
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-x-auto shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Sign In</th>
                <th className="text-left px-4 py-3 font-medium">Sign Out</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-gray-900 dark:text-gray-100">
              {records.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 font-medium">{r.date}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{formatTime(r.signInTime)}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{formatTime(r.signOutTime)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyAttendance;
