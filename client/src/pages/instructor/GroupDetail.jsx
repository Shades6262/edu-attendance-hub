import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getGroupById, removeStudentFromGroup, addStudentToGroup } from '../../api/groups';
import { getAllUsers } from '../../api/users';
import ChatPanel from '../../components/chat/ChatPanel';
import { useToast } from '../../context/ToastContext';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { EmptyState } from '../../components/common/EmptyState';
import { SharedLoader } from '../../components/loaders/SharedLoader';

const GroupDetail = () => {
  const { id } = useParams();
  const { showToast } = useToast();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [addingStudent, setAddingStudent] = useState(false);
  const [removeModal, setRemoveModal] = useState({ isOpen: false, studentId: null, name: '' });

  const fetchGroup = async () => {
    setLoading(true);
    try {
      const res = await getGroupById(id);
      setGroup(res.data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load group', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableStudents = async () => {
    try {
      const res = await getAllUsers({ role: 'student', status: 'approved' });
      setAvailableStudents(res.data);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchGroup();
    fetchAvailableStudents();
  }, [id]);

  const confirmRemove = async () => {
    if (!removeModal.studentId) return;
    const { studentId } = removeModal;
    setRemoveModal({ isOpen: false, studentId: null, name: '' });
    setRemovingId(studentId);
    try {
      await removeStudentFromGroup(id, studentId);
      setGroup((prev) => ({
        ...prev,
        students: prev.students.filter((s) => s._id !== studentId),
      }));
      showToast('Student removed from group', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to remove student', 'error');
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddStudent = async () => {
    if (!selectedStudentId) return;
    setAddingStudent(true);
    try {
      await addStudentToGroup(id, selectedStudentId);
      await fetchGroup();
      setSelectedStudentId('');
      showToast('Student added to group successfully', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add student', 'error');
    } finally {
      setAddingStudent(false);
    }
  };

  if (loading) return <SharedLoader message="Loading group details..." />;
  if (!group) return null;

  return (
    <div>
      <Link to="/instructor/groups" className="text-sm text-green-600 dark:text-green-400 hover:underline font-medium">
        ← Back to groups
      </Link>

      <div className="flex items-center justify-between mt-3 mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{group.name}</h2>
        <Link
          to={`/instructor/assignments/new?groupId=${group._id}`}
          className="text-sm bg-green-600 text-white px-4 py-2.5 rounded-xl hover:bg-green-700 transition shadow-sm font-semibold"
        >
          + Post Assignment
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 mb-6 flex items-center gap-3 shadow-sm">
        <select
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          className="border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm flex-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-inner"
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
          className="text-sm bg-green-600 text-white px-5 py-2.5 rounded-xl hover:bg-green-700 disabled:opacity-50 transition shadow-sm font-semibold"
        >
          {addingStudent ? 'Adding...' : 'Add'}
        </button>
      </div>

      <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Students</h3>

      {group.students.length === 0 ? (
        <EmptyState
          title="No students in this group"
          description="Add students to this instructor group using the selector above."
        />
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-x-auto shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Barcode</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-gray-900 dark:text-gray-100">
              {group.students.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{s.email}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{s.barcodeId || '—'}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setRemoveModal({ isOpen: true, studentId: s._id, name: s.name })}
                      disabled={removingId === s._id}
                      className="text-xs bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 px-3 py-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/50 disabled:opacity-50 transition"
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

      <div className="mt-8">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Group Chat</h3>
        <ChatPanel groupId={group._id} />
      </div>

      <ConfirmModal
        isOpen={removeModal.isOpen}
        title="Remove Student"
        message={`Are you sure you want to remove ${removeModal.name} from this group?`}
        confirmText="Remove"
        onConfirm={confirmRemove}
        onCancel={() => setRemoveModal({ isOpen: false, studentId: null, name: '' })}
      />
    </div>
  );
};

export default GroupDetail;
