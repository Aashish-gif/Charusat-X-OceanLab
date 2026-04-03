import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

interface CreateProjectCardProps {
  onClick: () => void;
}

const CreateProjectCard: React.FC<CreateProjectCardProps> = ({ onClick }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="h-full min-h-[200px] w-full rounded-2xl border-2 border-dashed border-glass-border hover:border-primary/50 bg-glass/30 hover:bg-glass/50 transition-all duration-300 flex flex-col items-center justify-center gap-4 group"
    >
      <motion.div
        whileHover={{ rotate: 90 }}
        transition={{ duration: 0.3 }}
        className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow"
      >
        <Plus className="w-7 h-7 text-primary-foreground" />
      </motion.div>
      <div className="text-center">
        <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
          Create New Project
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Start designing your infrastructure
        </p>
      </div>
    </motion.button>
  );
};

export default CreateProjectCard;
