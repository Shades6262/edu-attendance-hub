import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfilePicture, removeProfilePicture } from '../../api/auth';
import { useToast } from '../../context/ToastContext';
import { X, Upload, Trash2 } from 'lucide-react';

export const ProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(user?.profilePictureUrl || '');
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState(false);

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

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl relative animate-scaleIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-gray-900 mb-4">Manage Profile Picture</h3>

        <form onSubmit={handleSubmit} className="flex flex-col items-center">
          <div className="relative w-28 h-28 rounded-full overflow-hidden bg-green-100 flex items-center justify-center border-4 border-white shadow-md mb-6">
            {preview ? (
              <img src={preview} alt="Profile Preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-green-700">{getInitials(user?.name)}</span>
            )}
          </div>

          <label className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-green-600 transition mb-4 bg-gray-50 flex flex-col items-center justify-center">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm font-medium text-gray-700">Click to select an image</span>
            <span className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB</span>
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>

          {user?.profilePictureUrl && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={removing}
              className="w-full mb-4 flex items-center justify-center gap-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 py-2 rounded-lg transition disabled:opacity-50 font-medium"
            >
              <Trash2 className="w-4 h-4" />
              <span>{removing ? 'Removing...' : 'Remove Profile Picture'}</span>
            </button>
          )}

          <div className="flex justify-end space-x-3 w-full">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !file}
              className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition shadow-sm"
            >
              {loading ? 'Uploading...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
