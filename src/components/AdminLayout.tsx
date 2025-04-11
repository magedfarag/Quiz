import { Outlet } from 'react-router-dom';
import { 
  LayoutDashboard,
  Book,
  Users,
  LineChart,
  Settings,
  FileText
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const AdminLayout = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800">Quizzy Admin</h2>
        </div>
        <nav className="space-y-1 p-2">
          <NavLink 
            to="/admin/dashboard"
            className={({ isActive }) => 
              `flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink 
            to="/admin/quiz-management"
            className={({ isActive }) => 
              `flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <Book className="w-5 h-5" />
            <span>Quiz Management</span>
          </NavLink>
          <NavLink 
            to="/admin/user-management"
            className={({ isActive }) => 
              `flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <Users className="w-5 h-5" />
            <span>User Management</span>
          </NavLink>
          <NavLink 
            to="/admin/analytics"
            className={({ isActive }) => 
              `flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <LineChart className="w-5 h-5" />
            <span>Analytics</span>
          </NavLink>
          <NavLink 
            to="/admin/settings"
            className={({ isActive }) => 
              `flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </NavLink>
          <NavLink 
            to="/admin/audit-logs"
            className={({ isActive }) => 
              `flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <FileText className="w-5 h-5" />
            <span>Audit Logs</span>
          </NavLink>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-8">
        <Outlet />
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
