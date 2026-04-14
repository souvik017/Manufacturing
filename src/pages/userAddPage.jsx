// pages/users/AddUser.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, ArrowLeft, Shield, Mail, User as UserIcon } from "lucide-react";
import useUser from "../hooks/useUser";

const ROLES = [
  { value: "admin", label: "Admin – full access" },
  { value: "editor", label: "Editor – can edit content" },
  { value: "viewer", label: "Viewer – read only" },
];

const PERMISSIONS = [
  { id: "can_view_reports", label: "View reports" },
  { id: "can_edit_users", label: "Edit users (admin only)" },
  { id: "can_delete_projects", label: "Delete projects" },
];

export default function AddUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { createUser, updateUser, getUserById, loading } = useUser();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "viewer",
    permissions: [],
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchUser = async () => {
        const result = await getUserById(id);
        if (result.success) {
          setFormData({
            name: result.data.name,
            email: result.data.email,
            role: result.data.role,
            permissions: result.data.permissions || [],
          });
        } else {
          alert("User not found");
          navigate("/users");
        }
      };
      fetchUser();
    }
  }, [id, getUserById, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      if (name === "permissions") {
        const permId = value;
        setFormData((prev) => ({
          ...prev,
          permissions: checked
            ? [...prev.permissions, permId]
            : prev.permissions.filter((p) => p !== permId),
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.role) newErrors.role = "Please select a role";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    const payload = { ...formData };
    const result = id
      ? await updateUser(id, payload)
      : await createUser(payload);
    setIsLoading(false);
    if (result.success) {
      navigate("/users");
    } else {
      alert(result.message || "Operation failed");
    }
  };

  const isEdit = !!id;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate("/users")} className="p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-semibold text-gray-800">
          {isEdit ? "Edit User" : "Add New User"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <UserIcon size={14} className="inline mr-1" /> Full Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full border ${errors.name ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#017e84]`}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Mail size={14} className="inline mr-1" /> Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full border ${errors.email ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2`}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Shield size={14} className="inline mr-1" /> Role
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            {ROLES.map((role) => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>
          {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
        </div>

        {/* Permissions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Additional Permissions</label>
          <div className="space-y-2">
            {PERMISSIONS.map((perm) => (
              <label key={perm.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="permissions"
                  value={perm.id}
                  checked={formData.permissions.includes(perm.id)}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-[#017e84] focus:ring-[#017e84]"
                />
                {perm.label}
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">These can be extended or replaced with your backend logic.</p>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate("/users")}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || loading}
            className="bg-[#017e84] text-white px-5 py-2 rounded-md flex items-center gap-2 hover:bg-[#015f64] disabled:opacity-50"
          >
            <Save size={16} />
            {isLoading ? "Saving..." : (isEdit ? "Update User" : "Create User")}
          </button>
        </div>
      </form>
    </div>
  );
}