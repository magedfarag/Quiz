import { FileText, User, Clock } from 'lucide-react';
import AdminLayout from '@components/AdminLayout';

export default function AdminAuditLogs() {
  const logs = [
    { id: 1, action: "Created new quiz", user: "Admin", timestamp: "2023-10-15 14:30" },
    { id: 2, action: "Updated user permissions", user: "Admin", timestamp: "2023-10-14 09:15" }
  ];

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Audit Logs</h1>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Action</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">User</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-6 py-4">{log.action}</td>
                <td className="px-6 py-4">{log.user}</td>
                <td className="px-6 py-4">{log.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
