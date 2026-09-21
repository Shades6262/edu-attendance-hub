import React, { useState, useEffect } from 'react';
import { getAllAttendanceByDate } from '../../api/attendance';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { AttendanceTable } from '../../components/attendance/AttendanceTable';

export default function AttendanceOverview() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAttendance = async (selectedDate) => {
    setLoading(true);
    try {
      const res = await getAllAttendanceByDate({ date: selectedDate });
      setAttendanceList(res.data);
    } catch (err) {
      setError('Failed to fetch attendance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance(date);
  }, [date]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Attendance Overview</h1>
      <ErrorMessage message={error} />

      <div className="mb-6 flex items-center space-x-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Select Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm bg-white"
          />
        </div>
      </div>

      {loading ? <LoadingSpinner /> : <AttendanceTable attendanceList={attendanceList} />}
    </div>
  );
}
