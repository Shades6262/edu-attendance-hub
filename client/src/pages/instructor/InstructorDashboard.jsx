import React, { useState, useEffect } from 'react';
import { getGroups } from '../../api/groups';
import { getAssignments } from '../../api/assignments';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { Link } from 'react-router-dom';

export default function InstructorDashboard() {
  const [stats, setStats] = useState({ groupsCount: 0, assignmentsCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [groupsRes, assignmentsRes] = await Promise.all([getGroups(), getAssignments()]);
        setStats({
          groupsCount: groupsRes.data.length || 0,
          assignmentsCount: assignmentsRes.data.length || 0,
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Instructor Dashboard</h1>
      <ErrorMessage message={error} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-500">My Groups</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">{stats.groupsCount}</div>
          <Link to="/instructor/groups" className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-500">
            Manage groups &rarr;
          </Link>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Posted Assignments</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">{stats.assignmentsCount}</div>
          <Link to="/instructor/assignments/new" className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-500">
            Post new assignment &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
