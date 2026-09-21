import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getGroupById, removeStudentFromGroup, addStudentToGroup } from '../../api/groups';
import { getAllUsers } from '../../api/users';

const GroupDetail = () => {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState(null);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [addingStudent, setAddingStudent] = useState(false);

  const fetchGroup = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getGroupById(id);
      setGroup(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load group');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableStudents = async () => {
    try {
      const res = await getAllUsers({ role: 'student', status: 'approved' });
      console.log('AVAILABLE STUDENTS:', res.data); // temp debug
      setAvailableStudents(res.data);
    } catch (err) {
      console.log('FETCH STUDENTS ERROR:', err); // temp debug
    }
  };

  useEffect(() => {
    fetchGroup();
    fetchAvailableStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleRemove = async (studentId, name) => {
    if (!window.confirm(`Remove ${name} from this group?`)) return;
    setRemovingId(studentId);
    try {
      await removeStudentFromGroup(id, studentId);
      setGroup((prev) => ({
        ...prev,
        students: prev.students.filter((s) => s._id !== studentId),
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove student');
    } finally {
      setRemovingId(null);
    }
  };

    const handleAddStudent = async () => {
      if (!selectedStudentId) return;
      setAddingStudent(true);
      setError('');
      try {
        await addStudentToGroup(id, selectedStudentId);
        await fetchGroup();
        setSelectedStudentId('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to add student');
      } finally {
        setAddingStudent(false);
      }
    };

    

  if (loading) return <p className="text-gray-500">Loading group...</p>;
  if (error && !group) return <p className="text-red-600">{error}</p>;
  if (!group) return null;

  return (
    <div>
      <Link to="/instructor/groups" className="text-sm text-blue-600 hover:underline">
        ← Back to groups
      </Link>

      <div className="flex items-center justify-between mt-3 mb-4">
        <h2 className="text-xl font-semibold">{group.name}</h2>
        <Link
          to={`/instructor/assignments/new?groupId=${group._id}`}
          className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Post Assignment
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 text-sm p-3 rounded mb-4">{error}</div>
      )}

      <div className="bg-white border rounded-lg p-4 mb-4 flex items-center gap-3">
        <select
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          className="border rounded px-3 py-2 text-sm flex-1"
        >
          <option value="">Select a student to add...</option>
          {availableStudents
            .filter((s) => !group.students.some((gs) => gs._id === s._id))
            .map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} ({s.email})
              </option>
            ))}
        </select>
        <button
          onClick={handleAddStudent}
          disabled={!selectedStudentId || addingStudent}
          className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {addingStudent ? 'Adding...' : 'Add'}
        </button>
      </div>

      <h3 className="font-medium text-gray-700 mb-2">Students</h3>

      {group.students.length === 0 ? (
        <div className="bg-white border rounded-lg p-6 text-center text-gray-500">
          No students in this group yet.
        </div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Barcode</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {group.students.map((s) => (
                <tr key={s._id} className="border-b last:border-0">
                  <td className="px-4 py-3">{s.name}</td>
                  <td className="px-4 py-3 text-gray-500">{s.email}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{s.barcodeId || '—'}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleRemove(s._id, s.name)}
                      disabled={removingId === s._id}
                      className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded hover:bg-red-100 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GroupDetail;