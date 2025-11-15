import { Plus, User, FolderOpen, Settings, Code } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface BuilderSidebarProps {
  onNewChat?: () => void;
}

export function BuilderSidebar({ onNewChat }: BuilderSidebarProps) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const sidebarItems = [
    {
      icon: Plus,
      label: 'New Chat',
      onClick: onNewChat || (() => navigate('/builder')),
    },
    {
      icon: User,
      label: 'Profile',
      onClick: () => navigate('/settings'),
    },
    {
      icon: FolderOpen,
      label: 'Projects',
      onClick: () => navigate('/dashboard'),
    },
    {
      icon: Settings,
      label: 'Settings',
      onClick: () => navigate('/settings'),
    },
    {
      icon: Code,
      label: 'Templates',
      onClick: () => {}, // TODO: Templates modal
    },
  ];

  return (
    <div className="w-[50px] h-full border-r border-border bg-white flex flex-col relative">
      {/* Sidebar Icons */}
      <div className="flex flex-col items-center py-3 gap-1 border-b border-border">
        {sidebarItems.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-all group relative"
            aria-label={item.label}
          >
            <item.icon className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors" />

            {/* Tooltip on hover */}
            <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50 shadow-lg">
              {item.label}
            </div>
          </button>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User Avatar at Bottom */}
      <div className="p-2 border-t border-border">
        <button
          onClick={() => navigate('/settings')}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all group relative"
        >
          <span className="text-sm font-bold text-gray-700">
            {user?.firstName?.[0] || 'T'}
          </span>

          {/* Tooltip on hover */}
          <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50 shadow-lg">
            {user?.firstName} {user?.lastName}
          </div>
        </button>
      </div>
    </div>
  );
}
