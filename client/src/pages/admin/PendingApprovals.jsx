import { useState, useEffect } from 'react';
import { getPendingUsers, approveUser } from '../../api/users';
import { useToast } from '../../context/ToastContext';
import { EmptyState } from '../../components/common/EmptyState';
import { SharedLoader } from '../../components/loaders/SharedLoader';

const PendingApprovals = () => {
  const { showToast } = useToast();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await getPendingUsers();
      setPendingUsers(res.data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load pending users', 'error');
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
      setPendingUsers((prev) => prev.filter((u) => u._id !== id));
      showToast(`User ${decision} successfully`, 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return <SharedLoader message="Loading pending users..." />;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Pending Approvals</h2>

      {pendingUsers.length === 0 ? (
        <EmptyState
          title="No pending approvals"
          description="All instructor and admin accounts have been processed."
        />
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-x-auto shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Role</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-gray-900 dark:text-gray-100">
              {pendingUsers.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 rounded text-xs uppercase font-medium">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDecision(u._id, 'approved')}
                        disabled={actionLoadingId === u._id}
                        className="text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 disabled:opacity-50 transition shadow-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleDecision(u._id, 'rejected')}
                        disabled={actionLoadingId === u._id}
                        className="text-xs bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 px-3 py-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/50 disabled:opacity-50 transition"
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
