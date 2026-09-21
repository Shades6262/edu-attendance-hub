import { useState, useEffect } from 'react';
import { getAssignments } from '../../api/assignments';
import { getSubmissionsForAssignment, reviewSubmission } from '../../api/submissions';

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

  if (loadingAssignments) return <p className="text-gray-500">Loading assignments...</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Review Submissions</h2>

      {error && (
        <div className="bg-red-100 text-red-700 text-sm p-3 rounded mb-4">{error}</div>
      )}

      {assignments.length === 0 ? (
        <div className="bg-white border rounded-lg p-8 text-center text-gray-500">
          You haven't posted any assignments yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Your Assignments</h3>
            <div className="space-y-2">
              {assignments.map((a) => (
                <button
                  key={a._id}
                  onClick={() => handleSelectAssignment(a)}
                  className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition ${
                    selectedAssignment?._id === a._id
                      ? 'bg-blue-50 border-blue-400'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <p className="font-medium text-gray-800">{a.title}</p>
                  <p className="text-xs text-gray-500">{a.group?.name}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            {!selectedAssignment ? (
              <div className="bg-white border rounded-lg p-8 text-center text-gray-500">
                Select an assignment to view its submissions.
              </div>
            ) : loadingSubmissions ? (
              <p className="text-gray-500">Loading submissions...</p>
            ) : submissions.length === 0 ? (
              <div className="bg-white border rounded-lg p-8 text-center text-gray-500">
                No submissions yet for "{selectedAssignment.title}".
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((s) => (
                  <div key={s._id} className="bg-white border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-800">{s.student?.name}</p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          s.status === 'reviewed'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-yellow-50 text-yellow-700'
                        }`}
                      >
                        {s.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 break-all mb-3">{s.content}</p>

                    <textarea
                      placeholder="Leave feedback..."
                      value={feedbackDrafts[s._id] ?? s.feedback ?? ''}
                      onChange={(e) =>
                        setFeedbackDrafts((prev) => ({ ...prev, [s._id]: e.target.value }))
                      }
                      rows={2}
                      className="w-full border rounded px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />

                    <button
                      onClick={() => handleReview(s._id)}
                      disabled={reviewingId === s._id}
                      className="text-xs bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
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