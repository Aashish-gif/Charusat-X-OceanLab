import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Layers, MoreHorizontal, Trash2, Edit2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Project } from '@/store/useStore';

interface ProjectCardProps {
  project: Project;
  onDelete?: (id: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDelete }) => {
  const [showMenu, setShowMenu] = React.useState(false);
  
  const statusVariant = {
    deployed: 'success' as const,
    syncing: 'warning' as const,
    draft: 'outline' as const,
  };
  
  return (
    <Link to={`/studio/${project.id}`}>
      <GlassCard variant="interactive" className="relative h-full">
        {/* Menu Button */}
        <div className="absolute top-4 right-4">
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowMenu(!showMenu);
            }}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-glass-highlight rounded-lg transition-all"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute right-0 top-10 w-40 py-2 bg-glass border border-glass-border rounded-xl shadow-glass-lg z-10"
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-muted-foreground hover:text-foreground hover:bg-glass-highlight flex items-center gap-2 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Rename
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onDelete?.(project.id);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </motion.div>
          )}
        </div>
        
        {/* Content */}
        <div className="pr-12">
          <StatusBadge variant={statusVariant[project.status]} className="mb-4">
            {project.status}
          </StatusBadge>
          
          <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
            {project.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {project.description}
          </p>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {project.lastEdited}
            </span>
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              {project.resourceCount} resources
            </span>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
};

export default ProjectCard;
