import { useState, useEffect } from 'react';
import { getPendingUsers, approveUser } from '../../api/users';

const PendingApprovals = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchPending = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getPendingUsers();
      setPendingUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load pending users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleDecision = async (id, decision) => {
    setActionLoadingId(id);
    try {
      await approveUser(id, decision);
      // remove from list locally instead of re-fetching — faster feedback
      setPendingUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return <p className="text-gray-500">Loading pending users...</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Pending Approvals</h2>

      {error && (
        <div className="bg-red-100 text-red-700 text-sm p-3 rounded mb-4">
          {error}
        </div>
      )}

      {pendingUsers.length === 0 ? (
        <div className="bg-white border rounded-lg p-8 text-center text-gray-500">
          No pending approvals right now.
        </div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map((u) => (
                <tr key={u._id} className="border-b last:border-0">
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs uppercase">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDecision(u._id, 'approved')}
                        disabled={actionLoadingId === u._id}
                        className="text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleDecision(u._id, 'rejected')}
                        disabled={actionLoadingId === u._id}
                        className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded hover:bg-red-100 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PendingApprovals;