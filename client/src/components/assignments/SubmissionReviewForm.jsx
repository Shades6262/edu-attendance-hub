import React, { useState } from 'react';
import { reviewSubmission } from '../../api/submissions';

export function SubmissionReviewForm({ submission, onReviewed }) {
  const [feedback, setFeedback] = useState(submission.feedback || '');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await reviewSubmission(submission._id, { feedback, status: 'reviewed' });
      if (onReviewed) onReviewed();
    } catch (err) {
      setError('Failed to submit review.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-md border border-gray-200 mt-4">
      <h4 className="text-sm font-semibold text-gray-900 mb-2">Review Submission</h4>
      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 mb-1">Feedback</label>
        <textarea
          rows={3}
          required
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
        />
      </div>
      <button
        type="submit"
        className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
      >
        Save Review & Feedback
      </button>
    </form>
  );
}
