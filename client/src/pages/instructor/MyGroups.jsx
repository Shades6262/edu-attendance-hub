import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getGroups } from '../../api/groups';

const MyGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await getGroups();
        setGroups(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load groups');
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  if (loading) return <p className="text-gray-500">Loading groups...</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">My Groups</h2>

      {error && (
        <div className="bg-red-100 text-red-700 text-sm p-3 rounded mb-4">{error}</div>
      )}

      {groups.length === 0 ? (
        <div className="bg-white border rounded-lg p-8 text-center text-gray-500">
          You don't have any groups yet. Ask an admin to assign one to you.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => (
            <Link
              key={g._id}
              to={`/instructor/groups/${g._id}`}
              className="bg-white border rounded-lg p-4 hover:shadow-md transition"
            >
              <h3 className="font-medium text-gray-800">{g.name}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {g.students?.length || 0} student{g.students?.length === 1 ? '' : 's'}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyGroups;