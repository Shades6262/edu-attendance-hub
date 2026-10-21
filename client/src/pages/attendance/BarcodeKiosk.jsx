import { useState, useRef, useEffect } from 'react';
import { scanAttendance } from '../../api/attendance';

const BarcodeKiosk = () => {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const refocus = () => {
    inputRef.current?.focus();
  };

  useEffect(() => {
    refocus();
    const interval = setInterval(refocus, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!feedback) return;
    const timeout = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(timeout);
  }, [feedback]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = barcodeInput.trim();
    if (!code || loading) return;

    setLoading(true);
    setBarcodeInput('');

    try {
      const res = await scanAttendance(code);
      setFeedback({
        type: 'success',
        message: res.data.message,
        action: res.data.action,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Scan failed — try again',
      });
    } finally {
      setLoading(false);
      refocus();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 transition-colors duration-200">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/admin" className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition">
            ← Exit kiosk
          </a>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Attendance Scanner</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Scan your barcode to sign in or out</p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            onBlur={refocus}
            autoFocus
            placeholder="Waiting for scan..."
            className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-center text-lg border-2 border-gray-300 dark:border-gray-700 rounded-xl px-4 py-4 focus:outline-none focus:border-green-600 dark:focus:border-green-500 shadow-sm transition"
          />
        </form>

        <div className="mt-6 min-h-25">
          {loading && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-center text-gray-500 dark:text-gray-400 text-sm shadow-sm">
              Processing...
            </div>
          )}

          {!loading && feedback && (
            <div
              className={`rounded-xl p-5 text-center shadow-sm ${
                feedback.type === 'success'
                  ? feedback.action === 'sign-in'
                    ? 'bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
                    : 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
              }`}
            >
              <p className="text-lg font-semibold">
                {feedback.type === 'success'
                  ? feedback.action === 'sign-in'
                    ? '✓ Signed In'
                    : '✓ Signed Out'
                  : '✗ Error'}
              </p>
              <p className="text-sm mt-1 opacity-90">{feedback.message}</p>
            </div>
          )}

          {!loading && !feedback && (
            <div className="text-center text-gray-400 dark:text-gray-500 text-sm pt-6">
              No recent scans
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BarcodeKiosk;
