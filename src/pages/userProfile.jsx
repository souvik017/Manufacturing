import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { User, Mail, Shield, Lock } from "lucide-react";

export default function UserProfile() {
  const { member: currentUser } = useSelector((state) => state.auth);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "",
  });

  useEffect(() => {
    if (currentUser) {
      setProfile({
        name: currentUser.name || "Admin User",
        email: currentUser.email || "admin@maco.com",
        role: currentUser.role || "admin",
      });
    }
  }, [currentUser]);

  if (!currentUser) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  const roleLabels = {
    admin: "Administrator",
    editor: "Editor",
    viewer: "Viewer",
  };

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Profile</h1>
        <p className="text-sm text-gray-500">
          Manage your account details
        </p>
      </div>

      {/* Card */}
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border p-6">

        {/* Top Section */}
        <div className="flex items-center gap-5 border-b pb-6 mb-6">

          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-[#1A1745] text-white flex items-center justify-center text-xl font-bold shadow">
            {profile.name?.charAt(0)}
          </div>

          {/* Info */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {profile.name}
            </h2>
            <p className="text-sm text-gray-500">{profile.email}</p>
            <span className="inline-block mt-1 text-xs px-2 py-1 bg-[#1A1745]/10 text-[#1A1745] rounded-full">
              {roleLabels[profile.role] || profile.role}
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Name */}
          <div className="flex items-start gap-3">
            <User size={18} className="text-gray-400 mt-1" />
            <div>
              <p className="text-xs text-gray-500">Full Name</p>
              <p className="text-sm font-medium text-gray-800">
                {profile.name}
              </p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-3">
            <Mail size={18} className="text-gray-400 mt-1" />
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm font-medium text-gray-800">
                {profile.email}
              </p>
            </div>
          </div>

          {/* Role */}
          <div className="flex items-start gap-3">
            <Shield size={18} className="text-gray-400 mt-1" />
            <div>
              <p className="text-xs text-gray-500">Role</p>
              <p className="text-sm font-medium text-gray-800">
                {roleLabels[profile.role] || profile.role}
              </p>
            </div>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t my-6" />

        {/* Password Section */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Lock size={16} /> Security
          </h3>

          <button className="text-sm px-4 py-2 bg-[#1A1745] text-white rounded-lg hover:bg-[#2A2765] transition">
            Change Password
          </button>
        </div>

      </div>
    </div>
  );
}