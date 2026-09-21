import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ title, links = [] }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-800">{title}</h1>

        <div className="flex items-center gap-4">
          {user && (
            <div className="text-sm text-gray-600 hidden sm:block">
              <span className="font-medium text-gray-800">{user.name}</span>
              <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded text-xs uppercase tracking-wide text-gray-500">
                {user.role}
              </span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="text-sm bg-red-50 text-red-600 px-3 py-1.5 rounded hover:bg-red-100 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {links.length > 0 && (
        <div className="px-6 flex gap-1 border-t bg-gray-50">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `px-3 py-2 text-sm border-b-2 transition ${
                  isActive
                    ? 'border-blue-600 text-blue-600 font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;