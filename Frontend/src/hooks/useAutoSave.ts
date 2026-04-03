import { useEffect, useRef, useCallback } from 'react';
import { projectApi, ProjectData } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';

interface UseAutoSaveOptions {
  projectId: string | null;
  projectName: string;
  nodes: any[];
  generatedCode: string;
  debounceMs?: number;
  onSaveSuccess?: (projectId: string) => void | Promise<void>;
  onSaveStatusChange?: (status: 'saving' | 'saved' | 'unsaved') => void;
}

export const useAutoSave = ({
  projectId,
  projectName,
  nodes,
  generatedCode,
  debounceMs = 2000, // 2 seconds debounce
  onSaveSuccess,
  onSaveStatusChange,
}: UseAutoSaveOptions) => {
  const { isAuthenticated } = useAuthStore();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);
  const lastSavedRef = useRef<string>('');

  // Create a hash of the current state to avoid unnecessary saves
  const getStateHash = useCallback(() => {
    return JSON.stringify({ nodes, generatedCode, projectName });
  }, [nodes, generatedCode, projectName]);

  const saveToDatabase = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    const currentHash = getStateHash();
    if (currentHash === lastSavedRef.current) {
      return; // No changes to save
    }

    if (isSavingRef.current) {
      return; // Already saving
    }

    isSavingRef.current = true;
    if (onSaveStatusChange) {
      onSaveStatusChange('saving');
    }

    try {
      const projectData: ProjectData = {
        projectName,
        nodes,
        generatedCode,
      };

      let savedProjectId = projectId;

      if (projectId) {
        // Update existing project
        await projectApi.update(projectId, projectData);
      } else {
        // Create new project
        const response = await projectApi.create(projectData);
        savedProjectId = response.project._id;
        if (onSaveSuccess) {
          onSaveSuccess(savedProjectId);
        }
      }

      lastSavedRef.current = currentHash;
      isSavingRef.current = false;
      
      if (onSaveStatusChange) {
        onSaveStatusChange('saved');
      }

      // Show success toast (only occasionally to avoid spam)
      if (Math.random() < 0.1) {
        // 10% chance to show toast
        toast.success('Project saved', {
          duration: 1000,
        });
      }

      return savedProjectId;
    } catch (error: any) {
      isSavingRef.current = false;
      if (onSaveStatusChange) {
        onSaveStatusChange('unsaved');
      }
      console.error('Auto-save failed:', error);
      toast.error('Failed to save project', {
        description: error.message || 'Please try again',
      });
    }
  }, [isAuthenticated, projectId, projectName, nodes, generatedCode, getStateHash, onSaveSuccess]);

  // Auto-save effect with debouncing
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    if (nodes.length === 0 && !projectId) {
      // Don't save empty projects that don't exist yet
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(() => {
      saveToDatabase();
    }, debounceMs);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [nodes, generatedCode, projectName, isAuthenticated, debounceMs, saveToDatabase, projectId]);

  // Manual save function (can be called explicitly)
  const manualSave = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    return await saveToDatabase();
  }, [saveToDatabase]);

  return {
    manualSave,
    isSaving: isSavingRef.current,
  };
};

