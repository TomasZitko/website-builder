/**
 * PROJECTS STORE
 * Zustand store for agency project management
 */

import { create } from 'zustand';
import { agencyApi } from '@/api/agency';
import type {
  AgencyProject,
  AgencyProjectWithRelations,
  CreateProjectFormData,
  UpdateProjectFormData,
  ProjectsFilterState
} from '@/types/agency';

interface ProjectsState {
  // State
  projects: AgencyProjectWithRelations[];
  selectedProject: AgencyProjectWithRelations | null;
  filters: ProjectsFilterState;
  loading: boolean;
  error: string | null;

  // Actions
  fetchProjects: () => Promise<void>;
  fetchProject: (projectId: string) => Promise<void>;
  fetchClientProjects: (clientId: string) => Promise<void>;
  createProject: (data: CreateProjectFormData) => Promise<AgencyProject>;
  updateProject: (projectId: string, data: UpdateProjectFormData) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  generateWebsite: (projectId: string, prompt: string) => Promise<void>;
  linkWebsite: (projectId: string, websiteId: string) => Promise<void>;
  setSelectedProject: (project: AgencyProjectWithRelations | null) => void;
  setFilters: (filters: ProjectsFilterState) => void;
  clearProjects: () => void;
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  // Initial state
  projects: [],
  selectedProject: null,
  filters: {},
  loading: false,
  error: null,

  // Fetch all projects
  fetchProjects: async () => {
    try {
      set({ loading: true, error: null });
      const { filters } = get();
      const projects = await agencyApi.getProjects(filters);
      set({ projects, loading: false });
    } catch (error: any) {
      console.error('Failed to fetch projects:', error);
      set({
        error: error.response?.data?.error || 'Failed to fetch projects',
        loading: false
      });
    }
  },

  // Fetch single project
  fetchProject: async (projectId: string) => {
    try {
      set({ loading: true, error: null });
      const project = await agencyApi.getProject(projectId);
      set({ selectedProject: project, loading: false });
    } catch (error: any) {
      console.error('Failed to fetch project:', error);
      set({
        error: error.response?.data?.error || 'Failed to fetch project',
        loading: false
      });
    }
  },

  // Fetch projects for a specific client
  fetchClientProjects: async (clientId: string) => {
    try {
      set({ loading: true, error: null });
      const projects = await agencyApi.getClientProjects(clientId);
      set({ projects, loading: false });
    } catch (error: any) {
      console.error('Failed to fetch client projects:', error);
      set({
        error: error.response?.data?.error || 'Failed to fetch client projects',
        loading: false
      });
    }
  },

  // Create new project
  createProject: async (data: CreateProjectFormData) => {
    try {
      set({ loading: true, error: null });
      const newProject = await agencyApi.createProject(data);

      // Add to projects list
      set((state) => ({
        projects: [newProject as AgencyProjectWithRelations, ...state.projects],
        loading: false
      }));

      return newProject;
    } catch (error: any) {
      console.error('Failed to create project:', error);
      set({
        error: error.response?.data?.error || 'Failed to create project',
        loading: false
      });
      throw error;
    }
  },

  // Update project
  updateProject: async (projectId: string, data: UpdateProjectFormData) => {
    try {
      set({ loading: true, error: null });
      const updatedProject = await agencyApi.updateProject(projectId, data);

      // Update in projects list
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === projectId ? { ...p, ...updatedProject } : p
        ),
        selectedProject:
          state.selectedProject?.id === projectId
            ? { ...state.selectedProject, ...updatedProject }
            : state.selectedProject,
        loading: false
      }));
    } catch (error: any) {
      console.error('Failed to update project:', error);
      set({
        error: error.response?.data?.error || 'Failed to update project',
        loading: false
      });
      throw error;
    }
  },

  // Delete project
  deleteProject: async (projectId: string) => {
    try {
      set({ loading: true, error: null });
      await agencyApi.deleteProject(projectId);

      // Remove from projects list
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== projectId),
        selectedProject:
          state.selectedProject?.id === projectId ? null : state.selectedProject,
        loading: false
      }));
    } catch (error: any) {
      console.error('Failed to delete project:', error);
      set({
        error: error.response?.data?.error || 'Failed to delete project',
        loading: false
      });
      throw error;
    }
  },

  // Generate website for project
  generateWebsite: async (projectId: string, prompt: string) => {
    try {
      set({ loading: true, error: null });
      await agencyApi.generateProjectWebsite(projectId, prompt);

      // Update project status to 'generating'
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === projectId ? { ...p, status: 'generating' as const } : p
        ),
        selectedProject:
          state.selectedProject?.id === projectId
            ? { ...state.selectedProject, status: 'generating' as const }
            : state.selectedProject,
        loading: false
      }));
    } catch (error: any) {
      console.error('Failed to generate website:', error);
      set({
        error: error.response?.data?.error || 'Failed to generate website',
        loading: false
      });
      throw error;
    }
  },

  // Link website to project
  linkWebsite: async (projectId: string, websiteId: string) => {
    try {
      set({ loading: true, error: null });
      const updatedProject = await agencyApi.linkWebsiteToProject(projectId, websiteId);

      // Update in projects list
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === projectId ? { ...p, ...updatedProject } : p
        ),
        selectedProject:
          state.selectedProject?.id === projectId
            ? { ...state.selectedProject, ...updatedProject }
            : state.selectedProject,
        loading: false
      }));
    } catch (error: any) {
      console.error('Failed to link website:', error);
      set({
        error: error.response?.data?.error || 'Failed to link website',
        loading: false
      });
      throw error;
    }
  },

  // Set selected project
  setSelectedProject: (project: AgencyProjectWithRelations | null) => {
    set({ selectedProject: project });
  },

  // Set filters
  setFilters: (filters: ProjectsFilterState) => {
    set({ filters });
    // Re-fetch projects with new filters
    get().fetchProjects();
  },

  // Clear projects data (on logout)
  clearProjects: () => {
    set({
      projects: [],
      selectedProject: null,
      filters: {},
      error: null
    });
  }
}));
