import { useEffect } from 'react';

export const useDocumentTitle = (title) => {
  useEffect(() => {
    document.title = title ? `${title} - EduAttendance` : 'EduAttendance - School Attendance & Management';
  }, [title]);
};
