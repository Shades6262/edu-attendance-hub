import React, { useState, useRef, useEffect } from 'react';
import { scanAttendance } from '../../api/attendance';
import { ErrorMessage } from '../common/ErrorMessage';
import { Link } from 'react-router-dom';

export default function BarcodeScanner() {
  const [barcodeId, setBarcodeId] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!barcodeId.trim()) return;
    setLoading(true);
    setError('');
    setMessage(null);
    try {
      const res = await scanAttendance(barcodeId.trim());
      setMessage(res.data.message || 'Attendance recorded successfully!');
      setBarcodeId('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record attendance. Invalid barcode.');
    } finally {
      setLoading(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center px-4">
      <div className="absolute top-4 left-4">
        <Link to="/login" className="text-sm font-medium text-gray-400 hover:text-white">
          &larr; Back to Login
        </Link>
      </div>

      <div className="max-w-md w-full bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Barcode Attendance Kiosk</h1>
        <p className="text-sm text-gray-400 mb-6">Scan your barcode ID or enter it below and press Enter</p>

        <ErrorMessage message={error} />
        {message && (
          <div className="bg-green-900 border border-green-700 text-green-100 p-4 mb-6 rounded-md">
            <p className="text-lg font-semibold">{message}</p>
          </div>
        )}

        <form onSubmit={handleScan}>
          <input
            ref={inputRef}
            type="text"
            value={barcodeId}
            onChange={(e) => setBarcodeId(e.target.value)}
            placeholder="Scan barcode here..."
            disabled={loading}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white text-center text-xl tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>
      </div>
    </div>
  );
}
