import { useState, useEffect } from 'react';
import { getAllUsers, updateUserRole, updateUserStatus, deleteUser } from '../../api/users';
import { useAuth } from '../../context/AuthContext';

const ROLES = ['student', 'instructor', 'admin'];
const STATUSES = ['pending', 'approved', 'rejected'];

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await getAllUsers(params);
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, statusFilter]);

  const handleRoleChange = async (id, newRole) => {
    setActionLoadingId(id);
    setError('');
    try {
      await updateUserRole(id, newRole);
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, role: newRole } : u)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update role');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    setActionLoadingId(id);
    setError('');
    try {
      await updateUserStatus(id, newStatus);
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, status: newStatus } : u)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    setActionLoadingId(id);
    setError('');
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">User Management</h2>

      <div className="flex gap-3 mb-4">
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm"
        >
          <option value="">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 text-sm p-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading users...</p>
      ) : users.length === 0 ? (
        <div className="bg-white border rounded-lg p-8 text-center text-gray-500">
          No users match these filters.
        </div>
      ) : (
        <div className="bg-white border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Barcode</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u._id === currentUser.id;
                return (
                  <tr key={u._id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      {u.name} {isSelf && <span className="text-xs text-gray-400">(you)</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        disabled={isSelf || actionLoadingId === u._id}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="border rounded px-2 py-1 text-xs disabled:opacity-50"
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
                        className="border rounded px-2 py-1 text-xs disabled:opacity-50"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {u.barcodeId || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(u._id, u.name)}
                        disabled={isSelf || actionLoadingId === u._id}
                        className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded hover:bg-red-100 disabled:opacity-50"
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
    </div>
  );
};

export default UserManagement;