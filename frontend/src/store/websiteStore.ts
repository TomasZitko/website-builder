import { create } from 'zustand';

export type DeviceType = 'desktop' | 'tablet' | 'mobile';
export type ViewMode = 'preview' | 'code';

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

  setCode: (html: string, css: string, js: string) => void;
  setDeviceType: (device: DeviceType) => void;
  setViewMode: (mode: ViewMode) => void;
  setGenerating: (isGenerating: boolean) => void;
  setWebsiteInfo: (id: string, name: string, isPaid: boolean) => void;
}

export const useWebsiteStore = create<WebsiteState>((set) => ({
  htmlCode: '',
  cssCode: '',
  jsCode: '',
  deviceType: 'desktop',
  viewMode: 'preview',
  isGenerating: false,
  websiteId: null,
  websiteName: 'My Website',
  isPaid: false,

  setCode: (htmlCode, cssCode, jsCode) => set({ htmlCode, cssCode, jsCode }),
  setDeviceType: (deviceType) => set({ deviceType }),
  setViewMode: (viewMode) => set({ viewMode }),
  setGenerating: (isGenerating) => set({ isGenerating }),
  setWebsiteInfo: (websiteId, websiteName, isPaid) => set({ websiteId, websiteName, isPaid })
}));
