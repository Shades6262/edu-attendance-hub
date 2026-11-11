import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfilePicture, removeProfilePicture, deleteAccount } from '../../api/auth';
import { useToast } from '../../context/ToastContext';
import { ConfirmModal } from './ConfirmModal';
import { X, Upload, Trash2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUser, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(user?.profilePictureUrl || '');
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      showToast('Please select an image first', 'error');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await updateProfilePicture(formData);
      updateUser(res.data.user);
      showToast('Profile picture updated successfully!', 'success');
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile picture', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      const res = await removeProfilePicture();
      updateUser(res.data.user);
      setPreview('');
      setFile(null);
      showToast('Profile picture removed successfully!', 'success');
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to remove profile picture', 'error');
    } finally {
      setRemoving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      logout();
      showToast('Your account has been permanently deleted.', 'info');
      navigate('/login', { replace: true });
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete account', 'error');
      setDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-scaleIn">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Manage Profile & Account</h3>

          <form onSubmit={handleSubmit} className="flex flex-col items-center">
            <div className="relative w-28 h-28 rounded-full overflow-hidden bg-green-100 dark:bg-green-900/60 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-md mb-6">
              {preview ? (
                <img src={preview} alt="Profile Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-green-700 dark:text-green-300">{getInitials(user?.name)}</span>
              )}
            </div>

            <label className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center cursor-pointer hover:border-green-600 dark:hover:border-green-500 transition mb-4 bg-gray-50 dark:bg-gray-800/50 flex flex-col items-center justify-center">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Click to select an image</span>
              <span className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB</span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>

            {user?.profilePictureUrl && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={removing}
                className="w-full mb-4 flex items-center justify-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-950/70 py-2.5 rounded-xl transition disabled:opacity-50 font-medium"
              >
                <Trash2 className="w-4 h-4" />
                <span>{removing ? 'Removing...' : 'Remove Profile Picture'}</span>
              </button>
            )}

            <div className="flex justify-end space-x-3 w-full mb-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !file}
                className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition shadow-sm"
              >
                {loading ? 'Uploading...' : 'Save Changes'}
              </button>
            </div>
          </form>

          {/* Danger Zone / Account Deletion */}
          <div className="border-t border-gray-200 dark:border-gray-800 pt-4 mt-2">
            <button
              type="button"
              onClick={() => setDeleteConfirmOpen(true)}
              className="w-full flex items-center justify-center gap-2 text-xs text-red-600 dark:text-red-400 hover:text-red-700 font-semibold py-2 transition"
            >
              <AlertTriangle size={14} />
              <span>Delete Account Permanently</span>
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteConfirmOpen}
        title="Delete Account"
        message="Are you absolutely sure you want to delete your account? All your data and AI chat conversations will be permanently deleted. This action cannot be undone."
        confirmText={deleting ? 'Deleting...' : 'Delete Permanently'}
        confirmColor="bg-red-600 hover:bg-red-700"
        onConfirm={handleDeleteAccount}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </>
  );
};
