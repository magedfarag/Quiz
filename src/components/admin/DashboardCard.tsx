import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface DashboardCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export const DashboardCard = ({ title, children, className = '' }: DashboardCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 ${className}`}
    >
      <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
        {title}
      </h2>
      {children}
    </motion.div>
  );
};
