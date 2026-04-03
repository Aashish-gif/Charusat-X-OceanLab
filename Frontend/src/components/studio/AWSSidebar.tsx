import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, GripVertical, PanelLeftClose, PanelLeft, Network, Server, HardDrive, Database, Shield, Workflow, Layers, Globe, ArrowLeftRight, Scale, Zap, Container, Boxes, Folder, Files, Table, Cpu, Key, Lock, MessageSquare, Bell, Webhook } from 'lucide-react';
import { awsResources, resourceCategories } from '@/data/awsResources';
import { useStudioStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Network, Server, HardDrive, Database, Shield, Workflow, Layers, Globe, ArrowLeftRight, Scale, Zap, Container, Boxes, Folder, Files, Table, Cpu, Key, Lock, MessageSquare, Bell, Webhook
};

const AWSSidebar: React.FC = () => {
  const { isSidebarCollapsed, toggleSidebar } = useStudioStore();
  const [expandedCategories, setExpandedCategories] = React.useState<string[]>(['network', 'compute']);
  
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };
  
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, resource: typeof awsResources[0]) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(resource));
    event.dataTransfer.effectAllowed = 'move';
  };
  
  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent className="w-4 h-4" /> : null;
  };
  
  return (
    <motion.aside
      initial={false}
      animate={{ width: isSidebarCollapsed ? 56 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-full bg-sidebar border-r border-sidebar-border flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!isSidebarCollapsed && (
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="font-semibold text-sm"
          >
            AWS Resources
          </motion.h2>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent rounded-lg transition-all"
        >
          {isSidebarCollapsed ? (
            <PanelLeft className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>
      
      {/* Resource Categories */}
      <div className="flex-1 overflow-y-auto p-2">
        {resourceCategories.map((category) => {
          const isExpanded = expandedCategories.includes(category.id);
          const categoryResources = awsResources.filter((r) => r.category === category.id);
          
          return (
            <div key={category.id} className="mb-2">
              <button
                onClick={() => toggleCategory(category.id)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent',
                  isExpanded && 'text-foreground'
                )}
              >
                {getIcon(category.icon)}
                {!isSidebarCollapsed && (
                  <>
                    <span className="flex-1 text-left">{category.name}</span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </>
                )}
              </button>
              
              <AnimatePresence>
                {isExpanded && !isSidebarCollapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="py-1 space-y-1">
                      {categoryResources.map((resource) => (
                        <div
                          key={resource.id}
                          draggable
                          onDragStart={(e) => onDragStart(e, resource)}
                          className="flex items-center gap-3 px-3 py-2.5 ml-2 rounded-lg cursor-grab active:cursor-grabbing bg-transparent hover:bg-sidebar-accent/50 border border-transparent hover:border-glass-border transition-all group"
                        >
                          <GripVertical className="w-3 h-3 text-muted-foreground/50 group-hover:text-muted-foreground" />
                          <div className="w-8 h-8 rounded-lg bg-gradient-glass border border-glass-border flex items-center justify-center group-hover:border-primary/30 group-hover:shadow-glow transition-all">
                            {getIcon(resource.icon)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{resource.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{resource.type}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      
      {/* Hint */}
      {!isSidebarCollapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-muted-foreground text-center">
            Drag resources to the canvas
          </p>
        </div>
      )}
    </motion.aside>
  );
};

export default AWSSidebar;
