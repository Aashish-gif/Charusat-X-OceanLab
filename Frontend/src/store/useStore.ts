import { create } from 'zustand';
import { Node, Edge } from 'reactflow';
import { estimateTotalCost } from '@/lib/costEstimator';
import { generateTerraformWithRag } from '@/lib/ragTerraformGenerator';

export interface Project {
  id: string;
  name: string;
  description: string;
  lastEdited: string;
  resourceCount: number;
  status: 'draft' | 'deployed' | 'syncing';
}

export interface AWSResource {
  id: string;
  name: string;
  type: string;
  category: 'network' | 'compute' | 'storage' | 'database' | 'security' | 'integration';
  icon: string;
  terraformType: string;
}

interface StudioState {
  // Diagram state
  nodes: Node[];
  edges: Edge[];
  selectedNode: string | null;

  // Cost estimation
  totalCost: number;
  costBreakdown: Record<string, number>;

  // Terraform state
  terraformCode: string;
  isEditing: boolean;
  syncStatus: 'synced' | 'syncing' | 'error';

  // UI state
  isSidebarCollapsed: boolean;
  isCodePanelCollapsed: boolean;
  isToolsPanelCollapsed: boolean;

  // Actions
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (node: Node) => void;
  removeNode: (nodeId: string) => void;
  setSelectedNode: (nodeId: string | null) => void;
  setTerraformCode: (code: string) => void;
  setIsEditing: (isEditing: boolean) => void;
  setSyncStatus: (status: 'synced' | 'syncing' | 'error') => void;
  setTotalCost: (cost: number) => void;
  setCostBreakdown: (breakdown: Record<string, number>) => void;
  toggleSidebar: () => void;
  toggleCodePanel: () => void;
  toggleToolsPanel: () => void;
  updateNodeParent: (nodeId: string, parentId: string | null) => void;
  generateTerraform: () => Promise<void>;
  calculateCosts: () => void;
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
}

// Update the generateTerraformFromNodes function to calculate costs as well
const generateTerraformFromNodes = async (nodes: Node[], edges?: any[]): Promise<string> => {
  // Use the RAG-based generator instead of the hardcoded implementation
  return await generateTerraformWithRag(nodes, edges);
};

export const useStudioStore = create<StudioState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  totalCost: 0,
  costBreakdown: {},
  terraformCode: '# Loading...',
  isEditing: false,
  syncStatus: 'synced',
  isSidebarCollapsed: false,
  isCodePanelCollapsed: false,
  isToolsPanelCollapsed: false,

  setNodes: (nodes) => {
    const currentNodes = get().nodes;
    // Simple length and ID check to avoid unnecessary updates
    if (nodes.length === currentNodes.length && nodes.every((n, i) => n.id === currentNodes[i]?.id && n.position.x === currentNodes[i]?.position.x && n.position.y === currentNodes[i]?.position.y)) {
      return;
    }

    // Use structuredClone for deep copy to avoid reference issues
    const newNodes = nodes.map(node => ({
      ...node,
      data: { ...node.data },
      position: { ...node.position }
    }));
    set({ nodes: newNodes });
    get().calculateCosts();

    // Only auto-generate if we are NOT manually editing code
    if (!get().isEditing) {
      setTimeout(() => {
        get().generateTerraform();
      }, 0);
    }
  },
  setEdges: (edges) => {
    set({ edges });
    setTimeout(() => {
      get().generateTerraform();
    }, 0);
  },
  addNode: (node) => {
    const nodes = [...get().nodes, node];
    set({ nodes });
    get().calculateCosts(); // Recalculate costs when adding a node
    // Use setTimeout to avoid blocking the UI during async operation
    setTimeout(() => {
      get().generateTerraform();
    }, 0);
  },
  removeNode: (nodeId) => {
    const nodes = get().nodes.filter((n) => n.id !== nodeId);
    const edges = get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId);
    set({ nodes, edges, selectedNode: null });
    get().calculateCosts(); // Recalculate costs when removing a node
    // Use setTimeout to avoid blocking the UI during async operation
    setTimeout(() => {
      get().generateTerraform();
    }, 0);
  },
  setSelectedNode: (nodeId) => set({ selectedNode: nodeId }),
  setTerraformCode: (code) => set({ terraformCode: code }),
  setIsEditing: (isEditing) => set({ isEditing }),
  setSyncStatus: (status) => set({ syncStatus: status }),
  setTotalCost: (cost) => set({ totalCost: cost }),
  setCostBreakdown: (breakdown) => set({ costBreakdown: breakdown }),
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  toggleCodePanel: () => set((state) => ({ isCodePanelCollapsed: !state.isCodePanelCollapsed })),
  toggleToolsPanel: () => set((state) => ({ isToolsPanelCollapsed: !state.isToolsPanelCollapsed })),
  updateNodeParent: (nodeId: string, parentId: string | null) => {
    set(state => ({
      nodes: state.nodes.map(node =>
        node.id === nodeId
          ? { ...node, parentNode: parentId, extent: parentId ? 'parent' as const : undefined }
          : node
      )
    }));
    get().calculateCosts(); // Recalculate costs when updating parent
    // Use setTimeout to avoid blocking the UI during async operation
    setTimeout(() => {
      get().generateTerraform();
    }, 0);
  },
  calculateCosts: () => {
    const nodes = get().nodes;
    const resources = nodes
      .filter(node => node.data?.type && node.data?.config)
      .map(node => ({
        type: node.data.type,
        config: node.data.config
      }));

    const costResult = estimateTotalCost(resources);

    set({
      totalCost: costResult.monthly,
      costBreakdown: costResult.breakdown
    });
  },
  async generateTerraform() {
    // CRITICAL: Do not overwrite code if the user is currently editing it!
    if (get().isEditing) return;

    set({ syncStatus: 'syncing' });
    try {
      const code = await generateTerraformFromNodes(get().nodes, get().edges);
      set({ terraformCode: code, syncStatus: 'synced' });
    } catch (error) {
      console.error('Error generating Terraform:', error);
      set({
        syncStatus: 'error'
      });
    }
  },
}));

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [
    {
      id: '1',
      name: 'Production Infrastructure',
      description: 'Main production environment with auto-scaling',
      lastEdited: '2 hours ago',
      resourceCount: 12,
      status: 'deployed',
    },
    {
      id: '2',
      name: 'Staging Environment',
      description: 'Pre-production testing infrastructure',
      lastEdited: '1 day ago',
      resourceCount: 8,
      status: 'syncing',
    },
    {
      id: '3',
      name: 'Data Pipeline',
      description: 'ETL and analytics infrastructure',
      lastEdited: '3 days ago',
      resourceCount: 15,
      status: 'draft',
    },
  ],
  currentProject: null,

  setProjects: (projects) => set({ projects }),
  setCurrentProject: (project) => set({ currentProject: project }),
  addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),
  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
    })),
}));