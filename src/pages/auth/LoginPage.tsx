import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Loader2, GitBranch } from "lucide-react";
import logo from "../../assets/logo.png";
import { useAuthStore } from "../../store/authStore";
import { type UserRole, roleLabels, users } from "../../data/users";

export function LoginPage() {
  const { isAuthenticated, login } = useAuthStore();
  const [selectedRole, setSelectedRole] =
    useState<UserRole>("care_coordinator");
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const selectedUser = users.find((u) => u.role === selectedRole);

  const handleLogin = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    login(selectedRole);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={logo} alt="RxCEI" className="h-28 object-contain" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
        <p className="text-sm text-gray-500 mb-6">
          Select your role to continue
        </p>

        {/* Role Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Sign in as
          </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as UserRole)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {(Object.keys(roleLabels) as UserRole[]).map((role) => (
              <option key={role} value={role}>
                {roleLabels[role]}
              </option>
            ))}
          </select>
        </div>

        {/* User Preview */}
        {selectedUser && (
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg mb-6">
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {selectedUser.avatar}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {selectedUser.name}
              </p>
              <p className="text-xs text-gray-500">{selectedUser.email}</p>
              <p className="text-xs text-blue-600">{selectedUser.department}</p>
            </div>
          </div>
        )}

        {/* Sign In Button */}
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-70"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <GitBranch className="h-4 w-4" />
          )}
          {isLoading ? "Authenticating..." : "Sign in with OpenFn"}
        </button>

        <p className="mt-4 text-xs text-center text-gray-400">
          This is a prototype. No real authentication required.
        </p>
      </div>
    </div>
  );
}
