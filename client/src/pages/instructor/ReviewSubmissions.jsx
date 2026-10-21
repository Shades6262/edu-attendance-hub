import { useState, useEffect } from 'react';
import { getAssignments } from '../../api/assignments';
import { getSubmissionsForAssignment, reviewSubmission } from '../../api/submissions';
import { SharedLoader } from '../../components/loaders/SharedLoader';
import { EmptyState } from '../../components/common/EmptyState';

const ReviewSubmissions = () => {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [error, setError] = useState('');
  const [feedbackDrafts, setFeedbackDrafts] = useState({});
  const [reviewingId, setReviewingId] = useState(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await getAssignments();
        setAssignments(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load assignments');
      } finally {
        setLoadingAssignments(false);
      }
    };
    fetchAssignments();
  }, []);

  const handleSelectAssignment = async (assignment) => {
    setSelectedAssignment(assignment);
    setLoadingSubmissions(true);
    setError('');
    try {
      const res = await getSubmissionsForAssignment(assignment._id);
      setSubmissions(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load submissions');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleReview = async (submissionId) => {
    const feedback = feedbackDrafts[submissionId] || '';
    setReviewingId(submissionId);
    try {
      const res = await reviewSubmission(submissionId, feedback);
      setSubmissions((prev) =>
        prev.map((s) => (s._id === submissionId ? res.data.submission : s))
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewingId(null);
    }
  };

  if (loadingAssignments) return <SharedLoader message="Loading assignments..." />;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Review Submissions</h2>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 text-sm p-3 rounded-xl mb-4">{error}</div>
      )}

      {assignments.length === 0 ? (
        <EmptyState
          title="No assignments posted"
          description="You haven't posted any assignments yet."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Your Assignments</h3>
            <div className="space-y-2">
              {assignments.map((a) => (
                <button
                  key={a._id}
                  onClick={() => handleSelectAssignment(a)}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition shadow-xs ${
                    selectedAssignment?._id === a._id
                      ? 'bg-green-50 dark:bg-green-950/50 border-green-500 text-green-800 dark:text-green-300'
                      : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  <p className="font-semibold">{a.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{a.group?.name}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            {!selectedAssignment ? (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 text-center text-gray-500 dark:text-gray-400 shadow-sm">
                Select an assignment to view its submissions.
              </div>
            ) : loadingSubmissions ? (
              <SharedLoader message="Loading submissions..." />
            ) : submissions.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 text-center text-gray-500 dark:text-gray-400 shadow-sm">
                No submissions yet for "{selectedAssignment.title}".
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((s) => (
                  <div key={s._id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{s.student?.name}</p>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          s.status === 'reviewed'
                            ? 'bg-green-50 dark:bg-green-950/60 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                            : 'bg-yellow-50 dark:bg-yellow-950/60 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800'
                        }`}
                      >
                        {s.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 break-all mb-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">{s.content}</p>

                    <textarea
                      placeholder="Leave feedback..."
                      value={feedbackDrafts[s._id] ?? s.feedback ?? ''}
                      onChange={(e) =>
                        setFeedbackDrafts((prev) => ({ ...prev, [s._id]: e.target.value }))
                      }
                      rows={2}
                      className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm mb-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-inner"
                    />

                    <button
                      onClick={() => handleReview(s._id)}
                      disabled={reviewingId === s._id}
                      className="text-xs bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50 transition shadow-sm"
                    >
                      {reviewingId === s._id ? 'Saving...' : 'Save Review'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewSubmissions;
