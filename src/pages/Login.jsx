// pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, Mail, Lock } from "lucide-react"; // Factory removed, we'll use logo instead
import useAuth from "../hooks/useAuth";
// Import your logo (adjust path and filename as needed)
import companyLogo from "../assets/logo.png"; // or .svg

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { loginUser, loading, error: apiError } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await loginUser({ username, password });
    if (result.success) {
      navigate("/requisitions/add");
    }
  };

  const displayError = apiError;

  return (
    <div className="min-h-screen flex">
      {/* LEFT SIDE - with logo */}
      <div className="hidden md:flex w-1/2 bg-[#1A1745] text-white flex-col justify-between p-10">
        <div>
          <div className="flex items-center gap-3 mb-6">
            {/* Use logo image instead of Factory icon */}
            <img src={companyLogo} alt="Company Logo" className="h-12 w-auto" />
            {/* <h1 className="text-2xl font-bold">IMS</h1> */}
          </div>
          <h2 className="text-4xl font-semibold leading-tight">
            Smart Manufacturing
            <br /> Starts Here
          </h2>
          <p className="text-gray-300 mt-4 max-w-md">
            Manage BOM, requisitions, and products with a streamlined workflow
            built for modern manufacturing teams.
          </p>
        </div>
        <div className="text-sm text-gray-400">
          © 2026 MACO Industries
        </div>
      </div>

      {/* RIGHT SIDE (unchanged) */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border">
          <h2 className="text-2xl font-semibold text-gray-800 mb-1">
            Sign in
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Access your manufacturing dashboard
          </p>

          {displayError && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">
              {displayError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">Username</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1A1745] outline-none"
                  placeholder="admin"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1A1745] outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A1745] hover:bg-[#2A2765] text-white py-2 rounded-lg flex items-center justify-center gap-2 transition"
            >
              {loading ? "Signing in..." : <><LogIn size={16} /> Sign In</>}
            </button>
          </form>

          <p className="text-xs text-gray-400 mt-6 text-center">
            Demo: admin / your_password
          </p>
        </div>
      </div>
    </div>
  );
}