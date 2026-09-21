import React, { useState, useEffect } from 'react';
import { getAllUsers, getPendingUsers } from '../../api/users';
import { getAllAttendanceByDate } from '../../api/attendance';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, pendingCount: 0, todayAttendance: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, pendingRes, attendanceRes] = await Promise.all([
          getAllUsers(),
          getPendingUsers(),
          getAllAttendanceByDate({ date: new Date().toISOString().split('T')[0] }).catch(() => ({ data: [] })),
        ]);
        setStats({
          totalUsers: usersRes.data.length || 0,
          pendingCount: pendingRes.data.length || 0,
          todayAttendance: attendanceRes.data.length || 0,
        });
      } catch (err) {
        setError('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
      <ErrorMessage message={error} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Total Users</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">{stats.totalUsers}</div>
          <Link to="/admin/users" className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-500">
            Manage users &rarr;
          </Link>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Pending Approvals</div>
          <div className="mt-2 text-3xl font-bold text-amber-600">{stats.pendingCount}</div>
          <Link to="/admin/pending" className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-500">
            Review pending &rarr;
          </Link>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Today's Attendance</div>
          <div className="mt-2 text-3xl font-bold text-green-600">{stats.todayAttendance}</div>
          <Link to="/admin/attendance" className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-500">
            View attendance &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
