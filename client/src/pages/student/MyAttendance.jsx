import { useState, useEffect } from 'react';
import { getMyAttendance } from '../../api/attendance';

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

  if (loading) return <p className="text-gray-500">Loading attendance...</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">My Attendance</h2>

      {error && (
        <div className="bg-red-100 text-red-700 text-sm p-3 rounded mb-4">{error}</div>
      )}

      {records.length === 0 ? (
        <div className="bg-white border rounded-lg p-8 text-center text-gray-500">
          No attendance records yet.
        </div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Sign In</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Sign Out</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r._id} className="border-b last:border-0">
                  <td className="px-4 py-3">{r.date}</td>
                  <td className="px-4 py-3 text-gray-600">{formatTime(r.signInTime)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatTime(r.signOutTime)}</td>
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