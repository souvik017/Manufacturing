// pages/users/UserList.jsx
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import useUser from "../hooks/useUser";

const PAGE_SIZE = 20;
const ROLE_LABELS = {
  admin:  { label: "Admin",   className: "bg-purple-100 text-purple-700" },
  editor: { label: "Editor",  className: "bg-blue-100 text-blue-700" },
  viewer: { label: "Viewer",  className: "bg-gray-100 text-gray-700" },
};

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);
  const { getUsers, deleteUser, loading } = useUser();
  const { member: currentUser } = useSelector((state) => state.auth);

  const fetchUsers = async () => {
    const result = await getUsers();
    if (result.success) {
      setUsers(result.data);
      setCurrentPage(1);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user? This action cannot be undone.")) return;
    setDeletingId(id);
    const result = await deleteUser(id);
    setDeletingId(null);
    if (result.success) {
      const newUsers = users.filter((u) => u.id !== id);
      setUsers(newUsers);
      const newTotalPages = Math.ceil(newUsers.length / PAGE_SIZE);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    } else {
      alert(result.message || "Failed to delete user");
    }
  };

  // Pagination logic (same as before)
  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const paginatedUsers = users.slice(startIndex, startIndex + PAGE_SIZE);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (safePage > 3) pages.push("...");
    for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) {
      pages.push(i);
    }
    if (safePage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const canManageUsers = currentUser?.role === "admin";

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Users</h1>
          {!loading && users.length > 0 && (
            <p className="text-sm text-gray-400 mt-0.5">
              {users.length} {users.length === 1 ? "user" : "users"} total
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchUsers}
            disabled={loading}
            title="Refresh"
            className="border border-gray-300 text-gray-600 px-3 py-2 rounded-md flex items-center gap-2 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          {canManageUsers && (
            <Link
              to="/users/add"
              className="bg-[#017e84] text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-[#015f64]"
            >
              <Plus size={18} /> Add User
            </Link>
          )}
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-16">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading && users.length === 0 ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-6" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-36" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-48" /></td>
                  <td className="px-6 py-4"><div className="h-5 bg-gray-200 rounded-full w-16" /></td>
                  <td className="px-6 py-4 flex justify-end gap-3"><div className="h-4 bg-gray-200 w-8" /><div className="h-4 bg-gray-200 w-8" /></td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500">No users found. {canManageUsers && 'Click "Add User" to create one.'}</td></tr>
            ) : (
              paginatedUsers.map((user, idx) => {
                const isDeleting = deletingId === user.id;
                const role = ROLE_LABELS[user.role] ?? { label: user.role, className: "bg-gray-100 text-gray-600" };
                return (
                  <tr key={user.id} className={isDeleting ? "opacity-50" : "hover:bg-gray-50"}>
                    <td className="px-6 py-4 text-sm text-gray-400">{startIndex + idx + 1}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 text-sm"><span className={`px-2 py-1 rounded-full text-xs font-medium ${role.className}`}>{role.label}</span></td>
                    <td className="px-6 py-4 text-right text-sm">
                      {canManageUsers && (
                        <>
                          <Link to={`/users/edit/${user.id}`} className="inline-flex items-center mr-3 text-blue-600 hover:text-blue-800">
                            <Edit size={16} />
                          </Link>
                          <button onClick={() => handleDelete(user.id)} disabled={isDeleting} className="inline-flex items-center text-red-600 hover:text-red-800 disabled:opacity-40">
                            {isDeleting ? <RefreshCw size={16} className="animate-spin" /> : <Trash2 size={16} />}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!loading && users.length > PAGE_SIZE && (
        <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
          <p className="text-sm text-gray-500">Showing {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, users.length)} of {users.length}</p>
          <div className="flex items-center gap-1">
            <button onClick={() => goToPage(safePage - 1)} disabled={safePage === 1} className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-40">
              <ChevronLeft size={16} />
            </button>
            {getPageNumbers().map((page, i) => page === "..." ? <span key={`ell-${i}`} className="px-2 text-gray-400">…</span> : (
              <button key={page} onClick={() => goToPage(page)} className={`min-w-[36px] h-9 rounded-md text-sm font-medium border ${safePage === page ? "bg-[#017e84] text-white border-[#017e84]" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>{page}</button>
            ))}
            <button onClick={() => goToPage(safePage + 1)} disabled={safePage === totalPages} className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-40">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}