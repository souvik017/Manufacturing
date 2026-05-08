// pages/Settings.jsx
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Loader, ChevronLeft, ChevronRight } from "lucide-react";
import useAuth from "../hooks/useAuth";

export default function Settings() {
  const {
    fetchUsers,
    addUser,
    updateUser,
    deleteUser,
    updateUserStatus,    // <-- new: used for inline status change
    fetchUsersLoading,
    addUserLoading,
    updateUserLoading,
    deleteUserLoading,
    updateUserStatusLoading,
  } = useAuth();

  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    user_login_id: "",
    password: "",
    name: "",
    user_type: 1,
    status: "Active",
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const limit = 10; // items per page

  // Load users with pagination
  const loadUsers = async (page = currentPage) => {
    const result = await fetchUsers(page, limit);
    if (result.success) {
      setUsers(result.users);
      setTotalUsers(result.total);
      setTotalPages(Math.ceil(result.total / limit));
      setCurrentPage(result.page);
    }
  };

  useEffect(() => {
    loadUsers(1);
  }, []);

  // Handle page change
  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    loadUsers(page);
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({
      user_login_id: "",
      password: "",
      name: "",
      user_type: 1,
      status: "Active",
    });
    setModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      user_login_id: user.user_login_id,
      password: "",
      name: user.name,
      user_type: user.user_type,
      status: user.status || "Active",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let result;

    if (editingUser) {
      const updatePayload = {
        user_id: editingUser.id,        // note: API uses "id" from response
        user_login_id: formData.user_login_id,
        name: formData.name,
        password: formData.password || undefined,
        status: formData.status,
      };
      if (!updatePayload.password) delete updatePayload.password;
      result = await updateUser(updatePayload);
    } else {
      result = await addUser({
        emp_id: 22,
        user_login_id: formData.user_login_id,
        password: formData.password,
        name: formData.name,
        user_type: formData.user_type,
      });
    }

    if (result.success) {
      setModalOpen(false);
      loadUsers(currentPage);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const result = await deleteUser({ user_id: deleteConfirm.id }); // use "id"
    if (result.success) {
      setDeleteConfirm(null);
      loadUsers(currentPage);
    }
  };

  // Inline status change handler
  const handleStatusChange = async (user, newStatus) => {
    const result = await updateUserStatus({ user_id: user.id, status: newStatus });
    if (result.success) {
      // Refresh current page to reflect the change
      loadUsers(currentPage);
    }
  };

  const getRoleLabel = (type) => (type === 1 ? "Admin" : "User");

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">User Management</h1>
            <p className="text-sm text-gray-500">
              Add, edit, or remove system users | Total: {totalUsers}
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-[#1A1745] text-white rounded-lg hover:bg-[#2A2765] transition"
          >
            <Plus size={18} /> Add User
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {fetchUsersLoading ? (
            <div className="p-8 text-center">
              <Loader className="animate-spin inline-block" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th> */}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Login ID</th>
                      {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee ID</th> */}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        {/* <td className="px-6 py-4 text-sm text-gray-600">{user.id}</td> */}
                        <td className="px-6 py-4 font-medium text-gray-800">{user.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{user.user_login_id}</td>
                        {/* <td className="px-6 py-4 text-sm text-gray-600">{user.emp_id || "-"}</td> */}
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.user_type === 1
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}>
                            {getRoleLabel(user.user_type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <select
                            value={user.status}
                            onChange={(e) => handleStatusChange(user, e.target.value)}
                            disabled={updateUserStatusLoading}
                            className="border rounded px-2 py-1 text-sm focus:ring-[#1A1745] focus:border-[#1A1745]"
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(user)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center px-6 py-4 border-t">
                  <div className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages} (Total {totalUsers} users)
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingUser ? "Edit User" : "Add User"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    required
                    className="w-full border rounded-lg px-3 py-2"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Login ID *</label>
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    className="w-full border rounded-lg px-3 py-2"
                    value={formData.user_login_id}
                    onChange={(e) => setFormData({ ...formData, user_login_id: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {editingUser ? "New Password (leave blank to keep)" : "Password *"}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    autoComplete="new-password"
                    className="w-full border rounded-lg px-3 py-2"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    className="w-full border rounded-lg px-3 py-2"
                    value={formData.user_type}
                    onChange={(e) => setFormData({ ...formData, user_type: parseInt(e.target.value) })}
                  >
                    <option value={1}>Admin</option>
                    <option value={2}>User</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    className="w-full border rounded-lg px-3 py-2"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-lg">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addUserLoading || updateUserLoading}
                  className="px-4 py-2 bg-[#1A1745] text-white rounded-lg disabled:opacity-50"
                >
                  {addUserLoading || updateUserLoading ? "Saving..." : editingUser ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete user <strong>{deleteConfirm.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border rounded-lg">
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteUserLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleteUserLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}