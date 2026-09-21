import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAssignments } from '../../api/assignments';
import { getMySubmissions } from '../../api/submissions';

const MyAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assignmentsRes, submissionsRes] = await Promise.all([
          getAssignments(),
          getMySubmissions(),
        ]);
        setAssignments(assignmentsRes.data);
        setSubmissions(submissionsRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load assignments');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getSubmissionFor = (assignmentId) =>
    submissions.find((s) => s.assignment?._id === assignmentId || s.assignment === assignmentId);

  if (loading) return <p className="text-gray-500">Loading assignments...</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">My Assignments</h2>

      {error && (
        <div className="bg-red-100 text-red-700 text-sm p-3 rounded mb-4">{error}</div>
      )}

      {assignments.length === 0 ? (
        <div className="bg-white border rounded-lg p-8 text-center text-gray-500">
          No assignments yet. Once you're assigned to a group, assignments will show up
          here.
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => {
            const submission = getSubmissionFor(a._id);
            return (
              <Link
                key={a._id}
                to={`/student/assignments/${a._id}`}
                className="block bg-white border rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800">{a.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {a.dueDate
                        ? `Due ${new Date(a.dueDate).toLocaleDateString()}`
                        : 'No due date'}
                    </p>
                  </div>

                  {submission ? (
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        submission.status === 'reviewed'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-yellow-50 text-yellow-700'
                      }`}
                    >
                      {submission.status === 'reviewed' ? 'Reviewed' : 'Submitted'}
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                      Not submitted
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyAssignments;