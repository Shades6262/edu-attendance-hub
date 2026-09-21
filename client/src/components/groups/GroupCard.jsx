import React from 'react';
import { Link } from 'react-router-dom';

export function GroupCard({ group, onDelete }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{group.name}</h3>
        <p className="text-sm text-gray-600 mb-4">Students enrolled: {group.students?.length || 0}</p>
      </div>
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <Link
          to={`/instructor/groups/${group._id}`}
          className="text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          Manage Group &rarr;
        </Link>
        {onDelete && (
          <button
            onClick={() => onDelete(group._id)}
            className="text-sm text-red-600 hover:text-red-900"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
