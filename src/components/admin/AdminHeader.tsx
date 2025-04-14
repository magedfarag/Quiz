import { motion } from 'framer-motion';
import { RiNotificationLine, RiUserLine } from 'react-icons/ri';

export const AdminHeader = () => {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white shadow-sm px-6 py-4 flex justify-between items-center"
    >
      <div className="flex-1" />
      <div className="flex items-center space-x-4">
        <button className="p-2 hover:bg-gray-100 rounded-full relative">
          <RiNotificationLine className="w-6 h-6 text-gray-600" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-700">Admin User</span>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <RiUserLine className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>
    </motion.header>
  );
};
