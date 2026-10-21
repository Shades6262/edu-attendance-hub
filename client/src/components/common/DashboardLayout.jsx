import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ProfileModal } from './ProfileModal';
import GeminiIcon from './GeminiIcon';
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Camera,
  ChevronDown,
  Sun,
  Moon,
  Monitor,
  BookOpen
} from 'lucide-react';

export const DashboardLayout = ({ title, links = [] }) => {
  const { user, logout } = useAuth();
  const { theme, changeTheme } = useTheme();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex transition-colors duration-200">
      {/* Sidebar */}
      <aside
        className={`bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 relative z-20 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-4">
          {!collapsed && (
            <span className="font-bold text-xl text-green-600 dark:text-green-400 font-magz tracking-wide flex items-center gap-2 truncate">
              <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
              EDUHUB
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition mx-auto"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-4 px-3 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition group relative ${
                      isActive
                        ? 'bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                    }`
                  }
                  title={collapsed ? link.label : undefined}
                >
                  {Icon && <Icon className="w-5 h-5 shrink-0" />}
                  {!collapsed && <span className="truncate">{link.label}</span>}
                </NavLink>
              );
            })}
          </div>

          {/* Ask Gemini pinned at bottom */}
          <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800">
            <NavLink
              to={`/${user?.role}/ask`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition group relative ${
                  isActive
                    ? 'bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-green-50/60 dark:hover:bg-green-950/30 hover:text-green-700 dark:hover:text-green-300'
                }`
              }
              title={collapsed ? 'Ask Gemini' : undefined}
            >
              <GeminiIcon size={20} className="shrink-0" />
              {!collapsed && <span className="truncate">Ask Gemini</span>}
            </NavLink>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 flex items-center justify-between z-10 sticky top-0 transition-colors duration-200">
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 truncate">{title}</h1>

          {/* User Profile & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 focus:outline-none p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden bg-green-100 dark:bg-green-900 flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-sm shrink-0">
                {user?.profilePictureUrl ? (
                  <img src={user.profilePictureUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-green-700 dark:text-green-300">{getInitials(user?.name)}</span>
                )}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-tight">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{user?.role}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 py-2 z-50 animate-fadeIn">
                <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-800 sm:hidden">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{user?.role}</p>
                </div>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    setProfileModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <Camera className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span>Update Profile Picture</span>
                </button>

                <div className="border-t border-gray-100 dark:border-gray-800 my-1"></div>

                {/* Theme Selector Section */}
                <div className="px-4 py-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Appearance
                </div>
                <div className="grid grid-cols-3 gap-1 px-3 py-1.5">
                  <button
                    onClick={() => changeTheme('light')}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium transition ${
                      theme === 'light'
                        ? 'bg-green-50 dark:bg-green-950/60 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    <span>Light</span>
                  </button>
                  <button
                    onClick={() => changeTheme('dark')}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium transition ${
                      theme === 'dark'
                        ? 'bg-green-50 dark:bg-green-950/60 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    <span>Dark</span>
                  </button>
                  <button
                    onClick={() => changeTheme('system')}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium transition ${
                      theme === 'system'
                        ? 'bg-green-50 dark:bg-green-950/60 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Monitor className="w-4 h-4" />
                    <span>System</span>
                  </button>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 my-1"></div>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-x-auto text-gray-900 dark:text-gray-100">
          <Outlet />
        </main>
      </div>

      {/* Profile Picture Upload Modal */}
      <ProfileModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
    </div>
  );
};
