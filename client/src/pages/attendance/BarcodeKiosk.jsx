import { useState, useRef, useEffect } from 'react';
import { scanAttendance } from '../../api/attendance';

const BarcodeKiosk = () => {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', message }
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  // keep the input focused at all times so the scanner's keystrokes always land here,
  // even if someone accidentally clicks elsewhere on the page
  const refocus = () => {
    inputRef.current?.focus();
  };

  useEffect(() => {
    refocus();
    const interval = setInterval(refocus, 1000);
    return () => clearInterval(interval);
  }, []);

  // auto-clear feedback after a few seconds so the kiosk resets for the next person
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
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/admin" className="text-xs text-gray-500 hover:text-gray-300">
            ← Exit kiosk
          </a>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Attendance Scanner</h1>
          <p className="text-gray-400 text-sm">Scan your barcode to sign in or out</p>
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
            className="w-full bg-gray-800 text-white text-center text-lg border-2 border-gray-700 rounded-lg px-4 py-4 focus:outline-none focus:border-blue-500"
          />
        </form>

        <div className="mt-6 min-h-25">
          {loading && (
            <div className="bg-gray-800 rounded-lg p-4 text-center text-gray-400 text-sm">
              Processing...
            </div>
          )}

          {!loading && feedback && (
            <div
              className={`rounded-lg p-5 text-center ${
                feedback.type === 'success'
                  ? feedback.action === 'sign-in'
                    ? 'bg-green-900/40 border border-green-600'
                    : 'bg-blue-900/40 border border-blue-600'
                  : 'bg-red-900/40 border border-red-600'
              }`}
            >
              <p
                className={`text-lg font-semibold ${
                  feedback.type === 'success'
                    ? feedback.action === 'sign-in'
                      ? 'text-green-400'
                      : 'text-blue-400'
                    : 'text-red-400'
                }`}
              >
                {feedback.type === 'success'
                  ? feedback.action === 'sign-in'
                    ? '✓ Signed In'
                    : '✓ Signed Out'
                  : '✗ Error'}
              </p>
              <p className="text-gray-300 text-sm mt-1">{feedback.message}</p>
            </div>
          )}

          {!loading && !feedback && (
            <div className="text-center text-gray-600 text-sm pt-6">
              No recent scans
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BarcodeKiosk;