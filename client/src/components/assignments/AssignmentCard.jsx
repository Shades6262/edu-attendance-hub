import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatDate';

export function AssignmentCard({ assignment, onDelete, showActions = false }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900">{assignment.title}</h3>
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
            Due: {formatDate(assignment.dueDate)}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{assignment.description}</p>
      </div>
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <Link
          to={`/student/assignments/${assignment._id}`}
          className="text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          View details &rarr;
        </Link>
        {showActions && onDelete && (
          <button
            onClick={() => onDelete(assignment._id)}
            className="text-sm text-red-600 hover:text-red-900"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
