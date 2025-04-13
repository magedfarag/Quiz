import { motion } from 'framer-motion';

export const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center h-full">
      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full"
      />
    </div>
  );
};
