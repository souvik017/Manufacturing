// pages/UserProfile.jsx
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { User, Mail, Shield, Lock, X } from "lucide-react";
import useAuth from "../hooks/useAuth";

export default function UserProfile() {
  const { member: currentUser } = useSelector((state) => state.auth);
  const { resetPassword, resetPasswordLoading } = useAuth();

  const [profile, setProfile] = useState({ name: "", email: "", role: "" });
  const [showModal, setShowModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (currentUser) {
      setProfile({
        name: currentUser.name || "Admin User",
        email: currentUser.user_login_id || currentUser.email || "admin@example.com",
        role: currentUser.user_type === 1 ? "admin" : "user",
      });
    }

    console.log(currentUser.id)
  }, [currentUser]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (passwordData.new_password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    setPasswordError("");

    const result = await resetPassword({
      id: currentUser.id,              // user ID from Redux
      old_password: passwordData.old_password,
      new_password: passwordData.new_password,
    });

    if (result.success) {
      setShowModal(false);
      setPasswordData({ old_password: "", new_password: "", confirm_password: "" });
    }
  };

  if (!currentUser) return <div className="p-6 text-center">Loading...</div>;

  const roleLabels = { admin: "Administrator", user: "User" };

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Profile</h1>
        <p className="text-sm text-gray-500">Manage your account details</p>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border p-6">
        {/* Avatar & Info */}
        <div className="flex items-center gap-5 border-b pb-6 mb-6">
          <div className="w-16 h-16 rounded-full bg-[#1A1745] text-white flex items-center justify-center text-xl font-bold shadow">
            {profile.name?.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{profile.name}</h2>
            <p className="text-sm text-gray-500">{profile.email}</p>
            <span className="inline-block mt-1 text-xs px-2 py-1 bg-[#1A1745]/10 text-[#1A1745] rounded-full">
              {roleLabels[profile.role] || profile.role}
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <User size={18} className="text-gray-400 mt-1" />
            <div><p className="text-xs text-gray-500">Full Name</p><p className="text-sm font-medium">{profile.name}</p></div>
          </div>
          <div className="flex items-start gap-3">
            <Mail size={18} className="text-gray-400 mt-1" />
            <div><p className="text-xs text-gray-500">Email</p><p className="text-sm font-medium">{profile.email}</p></div>
          </div>
          <div className="flex items-start gap-3">
            <Shield size={18} className="text-gray-400 mt-1" />
            <div><p className="text-xs text-gray-500">Role</p><p className="text-sm font-medium">{roleLabels[profile.role]}</p></div>
          </div>
        </div>

        <div className="border-t my-6" />

        {/* Security Section */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Lock size={16} /> Security
          </h3>
          <button
            onClick={() => setShowModal(true)}
            className="text-sm px-4 py-2 bg-[#1A1745] text-white rounded-lg hover:bg-[#2A2765] transition"
          >
            Change Password
          </button>
        </div>
      </div>

      {/* Reset Password Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Change Password</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleResetPassword}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Old Password *</label>
                <input
                  type="password"
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:ring-[#1A1745] focus:border-[#1A1745]"
                  value={passwordData.old_password}
                  onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password *</label>
                <input
                  type="password"
                  required
                  className="w-full border rounded-lg px-3 py-2"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  className="w-full border rounded-lg px-3 py-2"
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                />
              </div>
              {passwordError && <p className="text-red-500 text-sm mb-3">{passwordError}</p>}
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={resetPasswordLoading} className="px-4 py-2 bg-[#1A1745] text-white rounded-lg hover:bg-[#2A2765] disabled:opacity-50">
                  {resetPasswordLoading ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}