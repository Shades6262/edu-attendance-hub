import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAssignmentById } from '../../api/assignments';
import { createSubmission, getMySubmissions } from '../../api/submissions';
import { useToast } from '../../context/ToastContext';
import { SharedLoader } from '../../components/loaders/SharedLoader';

const AssignmentDetail = () => {
  const { id } = useParams();
  const { showToast } = useToast();
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [assignmentRes, submissionsRes] = await Promise.all([
        getAssignmentById(id),
        getMySubmissions(),
      ]);
      setAssignment(assignmentRes.data);

      const existing = submissionsRes.data.find(
        (s) => (s.assignment?._id || s.assignment) === id
      );
      setSubmission(existing || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load assignment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await createSubmission({ assignmentId: id, content });
      await fetchData();
      setContent('');
      showToast('Assignment submitted successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <SharedLoader message="Loading assignment..." />;
  if (error && !assignment) return <p className="text-red-600 dark:text-red-400">{error}</p>;
  if (!assignment) return null;

  return (
    <div className="max-w-2xl">
      <Link to="/student/assignments" className="text-sm text-green-600 dark:text-green-400 hover:underline font-medium">
        ← Back to assignments
      </Link>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 mt-3 shadow-sm">
        <h2 className="text-xl font-bold mb-1 text-gray-900 dark:text-gray-100">{assignment.title}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {assignment.dueDate
            ? `Due ${new Date(assignment.dueDate).toLocaleDateString()}`
            : 'No due date'}
          {' · '}Posted by {assignment.instructor?.name}
        </p>
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{assignment.description}</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 text-sm p-3 rounded-xl mt-4">{error}</div>
      )}

      {submission ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 mt-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Your Submission</h3>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                submission.status === 'reviewed'
                  ? 'bg-green-50 dark:bg-green-950/60 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                  : 'bg-yellow-50 dark:bg-yellow-950/60 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800'
              }`}
            >
              {submission.status === 'reviewed' ? 'Reviewed' : 'Submitted — awaiting review'}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 break-all mb-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">{submission.content}</p>

          {submission.status === 'reviewed' && submission.feedback && (
            <div className="bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-xl p-4 mt-3">
              <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1 uppercase tracking-wider">Instructor Feedback</p>
              <p className="text-sm text-green-900 dark:text-green-200">{submission.feedback}</p>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 mt-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Submit Your Work</h3>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Link or text submission
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="https://github.com/you/your-repo"
            rows={3}
            required
            className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 mb-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-inner"
          />
          <button
            type="submit"
            disabled={submitting}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition shadow-sm"
          >
            {submitting ? 'Submitting...' : 'Submit Assignment'}
          </button>
        </form>
      )}
    </div>
  );
};

export default AssignmentDetail;
