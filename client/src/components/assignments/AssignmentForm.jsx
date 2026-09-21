import React, { useState } from 'react';

export function AssignmentForm({ groups, initialData = {}, onSubmit, isEditing = false }) {
  const [title, setTitle] = useState(initialData.title || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [group, setGroup] = useState(initialData.group?._id || initialData.group || '');
  const [dueDate, setDueDate] = useState(initialData.dueDate ? initialData.dueDate.split('T')[0] : '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ title, description, group, dueDate });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div>
        <label className="block text-sm font-medium text-gray-700">Assignment Title</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          rows={4}
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Instructor Group</label>
        <select
          required
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm bg-white"
        >
          <option value="">Select group...</option>
          {groups.map((g) => (
            <option key={g._id} value={g._id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Due Date</label>
        <input
          type="date"
          required
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
        />
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
      >
        {isEditing ? 'Update Assignment' : 'Post Assignment'}
      </button>
    </form>
  );
}
