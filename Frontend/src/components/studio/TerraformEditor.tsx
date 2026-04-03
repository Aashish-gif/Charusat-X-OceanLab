import React from 'react';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Copy, Check, RefreshCw, PanelRightClose, PanelRight, Edit2, Eye, DollarSign, GitBranch } from 'lucide-react';
import { useStudioStore } from '@/store/useStore';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { parseHCLtoNodes } from '@/logic/TerraformParser';

const TerraformEditor: React.FC = () => {
  const {
    terraformCode,
    isEditing,
    syncStatus,
    isCodePanelCollapsed,
    setIsEditing,
    toggleCodePanel,
    totalCost,
    setNodes,
    setEdges
  } = useStudioStore();

  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(terraformCode);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCode = () => {
    toast.success('Code formatted');
  };

  const syncDiagramFromCode = React.useCallback(() => {
    try {
      const { nodes, edges } = parseHCLtoNodes(terraformCode);
      setNodes(nodes);
      setEdges(edges);
      // We don't want to show a toast for every keystroke, 
      // maybe only for manual sync or major changes.
    } catch (error) {
      console.error('Error parsing HCL code:', error);
    }
  }, [terraformCode, setNodes, setEdges]);

  // Real-time bi-directional sync (Code -> Diagram)
  React.useEffect(() => {
    if (!isEditing) return;

    const timeoutId = setTimeout(() => {
      syncDiagramFromCode();
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [terraformCode, isEditing, syncDiagramFromCode]);

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCodePanelCollapsed ? 56 : 450 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-full bg-background-secondary border-l border-glass-border flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-glass-border">
        <button
          onClick={toggleCodePanel}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-glass/50 rounded-lg transition-all"
        >
          {isCodePanelCollapsed ? (
            <PanelRight className="w-4 h-4" />
          ) : (
            <PanelRightClose className="w-4 h-4" />
          )}
        </button>

        {!isCodePanelCollapsed && (
          <>
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">Terraform</span>
              <StatusBadge
                variant={syncStatus === 'synced' ? 'success' : syncStatus === 'syncing' ? 'warning' : 'danger'}
                size="sm"
              >
                {syncStatus === 'syncing' && <RefreshCw className="w-3 h-3 mr-1 animate-spin" />}
                {syncStatus}
              </StatusBadge>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-1 bg-green-500/10 rounded-md">
                <DollarSign className="w-3 h-3 text-green-500" />
                <span className="text-xs font-semibold text-green-600">${totalCost.toFixed(2)}/mo</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={cn(
                    'p-2 rounded-lg transition-all',
                    isEditing
                      ? 'bg-primary/20 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-glass/50'
                  )}
                >
                  {isEditing ? <Edit2 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={formatCode}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-glass/50 rounded-lg transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={syncDiagramFromCode}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-glass/50 rounded-lg transition-all"
                  title="Sync Diagram from Code"
                >
                  <GitBranch className="w-4 h-4" />
                </button>
                <button
                  onClick={copyToClipboard}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-glass/50 rounded-lg transition-all"
                >
                  {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Editor */}
      <AnimatePresence>
        {!isCodePanelCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-hidden"
          >
            <Editor
              height="100%"
              defaultLanguage="hcl"
              value={terraformCode}
              theme="vs-dark"
              onChange={(value) => {
                // Update the store with the new code
                useStudioStore.getState().setTerraformCode(value || '');
              }}
              options={{
                readOnly: !isEditing,
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: 'JetBrains Mono, Fira Code, monospace',
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
                renderLineHighlight: 'line',
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                smoothScrolling: true,
                tabSize: 2,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed State */}
      {isCodePanelCollapsed && (
        <div className="flex-1 flex flex-col items-center pt-4">
          <Code className="w-5 h-5 text-muted-foreground mb-2" />
          <span className="text-xs text-muted-foreground writing-mode-vertical rotate-180" style={{ writingMode: 'vertical-rl' }}>
            Terraform Code
          </span>
        </div>
      )}
    </motion.aside>
  );
};

export default TerraformEditor;