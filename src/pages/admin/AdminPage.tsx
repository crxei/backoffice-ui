import { users, roleLabels } from '../../data/users'
import { PageHeader } from '../../components/shared/PageHeader'
import { toast } from '../../components/shared/Toast'

export function AdminPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="User Management" description="Manage system users and permissions" />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                      {user.avatar}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{user.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">{roleLabels[user.role]}</span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{user.department}</td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-green-700">
                    <span className="h-2 w-2 rounded-full bg-green-500" /> Active
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => toast('info', 'Edit User', 'User edit coming soon')} className="text-xs text-blue-600 border border-blue-200 px-2 py-1 rounded hover:bg-blue-50">Edit</button>
                    <button onClick={() => toast('warning', 'Disable User', 'User management coming soon')} className="text-xs text-gray-500 border border-gray-200 px-2 py-1 rounded hover:bg-gray-50">Disable</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
