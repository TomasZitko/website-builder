import { create } from 'zustand';
import { websitesApi } from '@/api/websites';

export type DeviceType = 'desktop' | 'tablet' | 'mobile';
export type ViewMode = 'preview' | 'code' | 'split';

export interface WebsiteVersion {
  id: string;
  website_id: string;
  version_number: number;
  html_code: string;
  css_code: string;
  js_code: string;
  change_description: string;
  created_at: string;
}

interface WebsiteState {
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  deviceType: DeviceType;
  viewMode: ViewMode;
  isGenerating: boolean;
  websiteId: string | null;
  websiteName: string;
  isPaid: boolean;
  versions: WebsiteVersion[];
  isLoadingVersions: boolean;
  isSaving: boolean;

  setCode: (html: string, css: string, js: string) => void;
  setDeviceType: (device: DeviceType) => void;
  setViewMode: (mode: ViewMode) => void;
  setGenerating: (isGenerating: boolean) => void;
  setWebsiteInfo: (id: string, name: string, isPaid: boolean) => void;

  // Version management
  loadVersions: (websiteId: string) => Promise<void>;
  saveVersion: (websiteId: string, changeDescription?: string) => Promise<void>;
  restoreVersion: (websiteId: string, versionId: string) => Promise<void>;
}

export const useWebsiteStore = create<WebsiteState>((set, get) => ({
  htmlCode: '',
  cssCode: '',
  jsCode: '',
  deviceType: 'desktop',
  viewMode: 'preview',
  isGenerating: false,
  websiteId: null,
  websiteName: 'My Website',
  isPaid: false,
  versions: [],
  isLoadingVersions: false,
  isSaving: false,

  setCode: (htmlCode, cssCode, jsCode) => set({ htmlCode, cssCode, jsCode }),
  setDeviceType: (deviceType) => set({ deviceType }),
  setViewMode: (viewMode) => set({ viewMode }),
  setGenerating: (isGenerating) => set({ isGenerating }),
  setWebsiteInfo: (websiteId, websiteName, isPaid) => set({ websiteId, websiteName, isPaid }),

  // Load version history
  loadVersions: async (websiteId: string) => {
    set({ isLoadingVersions: true });
    try {
      const data = await websitesApi.getVersions(websiteId);
      set({ versions: data.versions || [] });
    } catch (error) {
      console.error('Failed to load versions:', error);
    } finally {
      set({ isLoadingVersions: false });
    }
  },

  // Save current code as new version
  saveVersion: async (websiteId: string, changeDescription?: string) => {
    const { htmlCode, cssCode, jsCode } = get();
    set({ isSaving: true });
    try {
      await websitesApi.createVersion(websiteId, {
        html_code: htmlCode,
        css_code: cssCode,
        js_code: jsCode,
        change_description: changeDescription
      });

      // Reload versions after saving
      await get().loadVersions(websiteId);
    } catch (error) {
      console.error('Failed to save version:', error);
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },

  // Restore a specific version
  restoreVersion: async (websiteId: string, versionId: string) => {
    try {
      const data = await websitesApi.restoreVersion(websiteId, versionId);
      const version = data.version;

      // Update current code
      set({
        htmlCode: version.html_code,
        cssCode: version.css_code,
        jsCode: version.js_code
      });

      // Reload versions
      await get().loadVersions(websiteId);
    } catch (error) {
      console.error('Failed to restore version:', error);
      throw error;
    }
  }
}));
