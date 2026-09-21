import React, { useState } from 'react';
import { addStudent, removeStudent } from '../../api/groups';

export function StudentListManager({ groupId, students, allStudents, onUpdate }) {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [error, setError] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) return;
    try {
      await addStudent(groupId, selectedStudentId);
      setSelectedStudentId('');
      onUpdate();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add student.');
    }
  };

  const handleRemove = async (studentId) => {
    try {
      await removeStudent(groupId, studentId);
      onUpdate();
    } catch (err) {
      setError('Failed to remove student.');
    }
  };

  const enrolledIds = students.map((s) => (typeof s === 'string' ? s : s._id));
  const availableStudents = allStudents.filter((s) => s.role === 'student' && !enrolledIds.includes(s._id));

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Manage Group Students</h3>
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleAdd} className="flex space-x-3 mb-6">
        <select
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-md text-sm bg-white"
        >
          <option value="">Select student to add...</option>
          {availableStudents.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name} ({s.email})
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
        >
          Add Student
        </button>
      </form>

      <ul className="divide-y divide-gray-200">
        {students.map((student) => {
          const sObj = typeof student === 'object' ? student : { _id: student, name: 'Student', email: '' };
          return (
            <li key={sObj._id} className="py-3 flex justify-between items-center">
              <div>
                <div className="text-sm font-medium text-gray-900">{sObj.name}</div>
                <div className="text-xs text-gray-500">{sObj.email}</div>
              </div>
              <button
                onClick={() => handleRemove(sObj._id)}
                className="text-sm text-red-600 hover:text-red-900"
              >
                Remove
              </button>
            </li>
          );
        })}
        {students.length === 0 && <p className="text-sm text-gray-500 py-4">No students in this group yet.</p>}
      </ul>
    </div>
  );
}
