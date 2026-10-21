import { useState, useEffect } from 'react';
import { getAllUsers, updateUserRole, updateUserStatus, deleteUser } from '../../api/users';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { EmptyState } from '../../components/common/EmptyState';
import { SharedLoader } from '../../components/loaders/SharedLoader';

const ROLES = ['student', 'instructor', 'admin'];
const STATUSES = ['pending', 'approved', 'rejected'];

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getAllUsers({ role: roleFilter, status: statusFilter });
      setUsers(res.data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    setActionLoadingId(id);
    try {
      await updateUserRole(id, newRole);
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, role: newRole } : u)));
      showToast('User role updated successfully', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update role', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    setActionLoadingId(id);
    try {
      await updateUserStatus(id, newStatus);
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, status: newStatus } : u)));
      showToast('User status updated successfully', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    const { id } = deleteModal;
    setDeleteModal({ isOpen: false, id: null, name: '' });
    setActionLoadingId(id);
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      showToast('User deleted successfully', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete user', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">User Management</h2>

      <div className="flex gap-3 mb-4">
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border border-gray-300 dark:border-gray-700 rounded px-3 py-1.5 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
        >
          <option value="">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 dark:border-gray-700 rounded px-3 py-1.5 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <SharedLoader message="Loading users..." />
      ) : users.length === 0 ? (
        <EmptyState
          title="No users found"
          description="There are no users matching your current filter criteria."
        />
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-x-auto shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Role</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Barcode</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-gray-900 dark:text-gray-100">
              {users.map((u) => {
                const isSelf = u._id === currentUser.id;
                return (
                  <tr key={u._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 font-medium">
                      {u.name} {isSelf && <span className="text-xs text-gray-400 font-normal">(you)</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{u.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        disabled={isSelf || actionLoadingId === u._id}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-xs disabled:opacity-50 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.status}
                        disabled={isSelf || actionLoadingId === u._id}
                        onChange={(e) => handleStatusChange(u._id, e.target.value)}
                        className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-xs disabled:opacity-50 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                      {u.barcodeId || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, id: u._id, name: u.name })}
                        disabled={isSelf || actionLoadingId === u._id}
                        className="text-xs bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 px-3 py-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/50 disabled:opacity-50 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete User"
        message={`Are you sure you want to delete ${deleteModal.name}? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
      />
    </div>
  );
};

export default UserManagement;
