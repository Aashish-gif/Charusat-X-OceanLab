import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { motion } from 'framer-motion';
import { Trash2, Network, Server, HardDrive, Database, Shield, Workflow, Layers, Globe, ArrowLeftRight, Scale, Zap, Container, Boxes, Folder, Files, Table, Cpu, Key, Lock, MessageSquare, Bell, Webhook } from 'lucide-react';
import { useStudioStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Network, Server, HardDrive, Database, Shield, Workflow, Layers, Globe, ArrowLeftRight, Scale, Zap, Container, Boxes, Folder, Files, Table, Cpu, Key, Lock, MessageSquare, Bell, Webhook
};

interface AWSNodeData {
  label: string;
  resourceType: string;
  icon: string;
  category: string;
}

const categoryColors: Record<string, string> = {
  network: 'border-primary/50 hover:border-primary',
  compute: 'border-accent/50 hover:border-accent',
  storage: 'border-success/50 hover:border-success',
  database: 'border-warning/50 hover:border-warning',
  security: 'border-destructive/50 hover:border-destructive',
  integration: 'border-primary/50 hover:border-primary',
};

const categoryBg: Record<string, string> = {
  network: 'bg-primary/10',
  compute: 'bg-accent/10',
  storage: 'bg-success/10',
  database: 'bg-warning/10',
  security: 'bg-destructive/10',
  integration: 'bg-primary/10',
};

const AWSNode: React.FC<NodeProps<AWSNodeData>> = ({ id, data, selected }) => {
  const { removeNode } = useStudioStore();
  
  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent className="w-5 h-5" /> : null;
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeNode(id);
  };
  
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        'relative group',
        selected && 'node-selected rounded-2xl'
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-primary !border-2 !border-background"
      />
      
      <div
        className={cn(
          'relative px-4 py-3 rounded-xl border-2 bg-glass backdrop-blur-sm transition-all duration-200 min-w-[140px]',
          categoryColors[data.category],
          selected && 'border-primary shadow-glow'
        )}
      >
        {/* Delete Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: selected ? 1 : 0, scale: selected ? 1 : 0.8 }}
          whileHover={{ scale: 1.1 }}
          onClick={handleDelete}
          className="absolute -top-2 -right-2 p-1.5 bg-destructive rounded-lg text-destructive-foreground shadow-lg z-10"
        >
          <Trash2 className="w-3 h-3" />
        </motion.button>
        
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            categoryBg[data.category]
          )}>
            {getIcon(data.icon)}
          </div>
          <div>
            <p className="font-medium text-sm">{data.label}</p>
            <p className="text-xs text-muted-foreground">{data.resourceType}</p>
          </div>
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-primary !border-2 !border-background"
      />
    </motion.div>
  );
};

export default memo(AWSNode);
