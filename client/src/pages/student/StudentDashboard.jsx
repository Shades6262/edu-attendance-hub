import React, { useState, useEffect } from 'react';
import { getAssignments } from '../../api/assignments';
import { getMyAttendance } from '../../api/attendance';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { Link } from 'react-router-dom';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ assignmentsCount: 0, attendanceCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [assignmentsRes, attendanceRes] = await Promise.all([
          getAssignments(),
          getMyAttendance().catch(() => ({ data: [] })),
        ]);
        setStats({
          assignmentsCount: assignmentsRes.data.length || 0,
          attendanceCount: attendanceRes.data.length || 0,
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
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome, {user?.name}</h1>
      <p className="text-sm text-gray-600 mb-6">Barcode ID: <span className="font-mono font-bold text-gray-900">{user?.barcodeId || 'N/A'}</span></p>
      <ErrorMessage message={error} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Available Assignments</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">{stats.assignmentsCount}</div>
          <Link to="/student/assignments" className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-500">
            View assignments &rarr;
          </Link>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Attendance Records</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">{stats.attendanceCount}</div>
          <Link to="/student/attendance" className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-500">
            View attendance history &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
