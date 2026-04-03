import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Cloud, Save, Play, Download, Share2, Loader2, DollarSign, Upload } from 'lucide-react';
import { GradientButton } from '@/components/ui/GradientButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useStudioStore } from '@/store/useStore';
import { toast } from 'sonner';
import DeploymentModal from '@/components/studio/DeploymentModal';

interface StudioHeaderProps {
  projectId?: string | null;
  projectName?: string;
  onProjectNameChange?: (name: string) => void;
  onManualSave?: () => Promise<void>;
  saveStatus?: 'saved' | 'saving' | 'unsaved';
}

const StudioHeader: React.FC<StudioHeaderProps> = ({
  projectId,
  projectName: propProjectName,
  onProjectNameChange,
  onManualSave,
  saveStatus: propSaveStatus,
}) => {
  const { terraformCode, nodes, totalCost } = useStudioStore();
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>(propSaveStatus || 'saved');
  const [projectName, setProjectName] = useState(propProjectName || 'Untitled Project');

  useEffect(() => {
    setProjectName(propProjectName || 'Untitled Project');
  }, [propProjectName]);

  useEffect(() => {
    if (propSaveStatus) {
      setSaveStatus(propSaveStatus);
    }
  }, [propSaveStatus]);

  const handleSave = async () => {
    if (!onManualSave) {
      toast.error('Save function not available');
      return;
    }

    setIsSaving(true);
    setSaveStatus('saving');
    
    try {
      await onManualSave();
      setSaveStatus('saved');
      toast.success('Project saved successfully');
    } catch (error: any) {
      setSaveStatus('unsaved');
      toast.error('Failed to save project', {
        description: error.message || 'Please try again',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDeploy = () => {
    toast.info('Deployment started...');
    setTimeout(() => {
      toast.success('Infrastructure deployed successfully!');
    }, 2000);
  };
  
  const handleExport = () => {
    const blob = new Blob([terraformCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'main.tf';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Terraform file exported');
  };
  
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-14 bg-background border-b border-glass-border flex items-center justify-between px-4 shrink-0"
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <Link
          to="/dashboard"
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-glass/50 rounded-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-primary rounded-lg">
            <Cloud className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <div>
              <input
                type="text"
                value={projectName}
                onChange={(e) => {
                  const newName = e.target.value;
                  setProjectName(newName);
                  if (onProjectNameChange) {
                    onProjectNameChange(newName);
                  }
                  setSaveStatus('unsaved');
                }}
                className="font-semibold text-sm bg-transparent border-none outline-none focus:outline-none p-0 w-full"
                style={{ width: `${Math.max(projectName.length * 8, 150)}px` }}
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{nodes.length} resources</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-green-500" />
                <span className="font-semibold text-green-600">${totalCost.toFixed(2)}/mo</span>
              </div>
              <span>•</span>
              {saveStatus === 'saving' && (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Saving...</span>
                </>
              )}
              {saveStatus === 'saved' && (
                <StatusBadge variant="success" size="sm">
                  Saved
                </StatusBadge>
              )}
              {saveStatus === 'unsaved' && (
                <StatusBadge variant="warning" size="sm">
                  Unsaved
                </StatusBadge>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Section */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleExport}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-glass/50 rounded-lg transition-all"
        >
          <Download className="w-4 h-4" />
        </button>
        <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-glass/50 rounded-lg transition-all">
          <Share2 className="w-4 h-4" />
        </button>
        <GradientButton 
          variant="secondary" 
          size="sm" 
          icon={isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </GradientButton>
        {projectId && (
          <DeploymentModal projectId={projectId}>
            <GradientButton size="sm" icon={<Upload className="w-4 h-4" />}>
              Deploy
            </GradientButton>
          </DeploymentModal>
        )}
        {!projectId && (
          <GradientButton 
            size="sm" 
            icon={<Upload className="w-4 h-4" />} 
            onClick={() => toast.info('Save your project first to enable deployment')}
            disabled={true}
          >
            Deploy
          </GradientButton>
        )}
      </div>
    </motion.header>
  );
};

export default StudioHeader;