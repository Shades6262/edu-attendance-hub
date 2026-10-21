import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';

export const AuthThemeToggle = () => {
  const { theme, changeTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="absolute top-6 right-6 z-30" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 shadow-md hover:bg-white dark:hover:bg-gray-800 transition"
        title="Toggle theme"
      >
        {theme === 'dark' ? (
          <Moon className="w-5 h-5 text-green-500" />
        ) : theme === 'light' ? (
          <Sun className="w-5 h-5 text-amber-500" />
        ) : (
          <Monitor className="w-5 h-5 text-green-600 dark:text-green-400" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 py-1.5 z-50 animate-fadeIn">
          <button
            onClick={() => { changeTheme('light'); setOpen(false); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition ${
              theme === 'light' ? 'bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Light</span>
          </button>
          <button
            onClick={() => { changeTheme('dark'); setOpen(false); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition ${
              theme === 'dark' ? 'bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <Moon className="w-4 h-4 text-green-500" />
            <span>Dark</span>
          </button>
          <button
            onClick={() => { changeTheme('system'); setOpen(false); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition ${
              theme === 'system' ? 'bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <Monitor className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span>System</span>
          </button>
        </div>
      )}
    </div>
  );
};
