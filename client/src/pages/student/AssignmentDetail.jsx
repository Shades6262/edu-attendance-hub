import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAssignmentById } from '../../api/assignments';
import { createSubmission, getMySubmissions } from '../../api/submissions';

const AssignmentDetail = () => {
  const { id } = useParams();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await createSubmission({ assignmentId: id, content });
      await fetchData(); // refetch to show the new submission state
      setContent('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (error && !assignment) return <p className="text-red-600">{error}</p>;
  if (!assignment) return null;

  return (
    <div className="max-w-2xl">
      <Link to="/student/assignments" className="text-sm text-blue-600 hover:underline">
        ← Back to assignments
      </Link>

      <div className="bg-white border rounded-lg p-6 mt-3">
        <h2 className="text-xl font-semibold mb-1">{assignment.title}</h2>
        <p className="text-sm text-gray-500 mb-4">
          {assignment.dueDate
            ? `Due ${new Date(assignment.dueDate).toLocaleDateString()}`
            : 'No due date'}
          {' · '}Posted by {assignment.instructor?.name}
        </p>
        <p className="text-gray-700 whitespace-pre-wrap">{assignment.description}</p>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 text-sm p-3 rounded mt-4">{error}</div>
      )}

      {submission ? (
        <div className="bg-white border rounded-lg p-6 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-800">Your Submission</h3>
            <span
              className={`text-xs px-2 py-1 rounded ${
                submission.status === 'reviewed'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-yellow-50 text-yellow-700'
              }`}
            >
              {submission.status === 'reviewed' ? 'Reviewed' : 'Submitted — awaiting review'}
            </span>
          </div>
          <p className="text-sm text-gray-600 break-all mb-3">{submission.content}</p>

          {submission.status === 'reviewed' && submission.feedback && (
            <div className="bg-blue-50 border border-blue-100 rounded p-3 mt-2">
              <p className="text-xs font-medium text-blue-700 mb-1">Instructor Feedback</p>
              <p className="text-sm text-blue-900">{submission.feedback}</p>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-6 mt-4">
          <h3 className="font-medium text-gray-800 mb-3">Submit Your Work</h3>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Link or text submission
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="https://github.com/you/your-repo"
            rows={3}
            required
            className="w-full border rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Assignment'}
          </button>
        </form>
      )}
    </div>
  );
};

export default AssignmentDetail;