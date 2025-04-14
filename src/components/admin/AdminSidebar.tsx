import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { IconType } from 'react-icons';
import { 
  RiDashboardLine, 
  RiQuestionLine,
  RiUserLine,
  RiSettings4Line,
  RiFileChartLine 
} from 'react-icons/ri';

interface NavItemProps {
  to: string;
  icon: IconType;
  label: string;
}

const NavItem = ({ to, icon: Icon, label }: NavItemProps) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center px-4 py-3 text-gray-600 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors ${
        isActive ? 'bg-primary-50 text-primary-600' : ''
      }`
    }
  >
    <Icon className="w-5 h-5 mr-3" />
    <span>{label}</span>
  </NavLink>
);

export const AdminSidebar = () => {
  const navItems = [
    { to: '/admin', icon: RiDashboardLine, label: 'Dashboard' },
    { to: '/admin/questions', icon: RiQuestionLine, label: 'Questions' },
    { to: '/admin/users', icon: RiUserLine, label: 'Users' },
    { to: '/admin/analytics', icon: RiFileChartLine, label: 'Analytics' },
    { to: '/admin/settings', icon: RiSettings4Line, label: 'Settings' },
  ];

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 bg-white h-screen fixed left-0 top-0 shadow-lg p-4"
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary-600">Quiz Admin</h1>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>
    </motion.div>
  );
};
