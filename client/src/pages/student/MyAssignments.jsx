import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAssignments } from '../../api/assignments';
import { getMySubmissions } from '../../api/submissions';
import { SharedLoader } from '../../components/loaders/SharedLoader';
import { EmptyState } from '../../components/common/EmptyState';

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

  if (loading) return <SharedLoader message="Loading assignments..." />;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">My Assignments</h2>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 text-sm p-3 rounded-xl mb-4">{error}</div>
      )}

      {assignments.length === 0 ? (
        <EmptyState
          title="No assignments yet"
          description="Once you're assigned to a group, assignments will show up here."
        />
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => {
            const submission = getSubmissionFor(a._id);
            return (
              <Link
                key={a._id}
                to={`/student/assignments/${a._id}`}
                className="block bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:shadow-md dark:hover:border-gray-700 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{a.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {a.dueDate
                        ? `Due ${new Date(a.dueDate).toLocaleDateString()}`
                        : 'No due date'}
                    </p>
                  </div>

                  {submission ? (
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        submission.status === 'reviewed'
                          ? 'bg-green-50 dark:bg-green-950/60 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                          : 'bg-yellow-50 dark:bg-yellow-950/60 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800'
                      }`}
                    >
                      {submission.status === 'reviewed' ? 'Reviewed' : 'Submitted'}
                    </span>
                  ) : (
                    <span className="text-xs px-3 py-1 rounded-full font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
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
