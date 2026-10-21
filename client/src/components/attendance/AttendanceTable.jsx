import React from 'react';
import { EmptyState } from '../common/EmptyState';

export function AttendanceTable({ attendanceList }) {
  if (!attendanceList || attendanceList.length === 0) {
    return <EmptyState title="No attendance records" description="No attendance records found for this selection." />;
  }

  return (
    <div className="bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-800/80">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sign In Time</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sign Out Time</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800 text-gray-900 dark:text-gray-100">
          {attendanceList.map((record) => {
            const userObj = typeof record.user === 'object' && record.user !== null ? record.user : { name: 'Unknown Student', email: '' };
            return (
              <tr key={record._id || record.date + (userObj._id || '')} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{userObj.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{userObj.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{record.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {record.signInTime ? new Date(record.signInTime).toLocaleTimeString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {record.signOutTime ? new Date(record.signOutTime).toLocaleTimeString() : 'Not signed out'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
