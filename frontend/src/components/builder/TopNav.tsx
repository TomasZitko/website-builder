import { Home, Plus, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

const Logo = () => (
  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-foreground/15 to-foreground/8 flex items-center justify-center">
    <svg className="h-4 w-4 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  </div>
);

export function TopNav() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-[72px] w-full border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left Section - Logo & Brand */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Logo />
            <span className="text-2xl font-bold text-foreground tracking-tight">
              WebChat<span className="text-muted-foreground">.ai</span>
            </span>
          </button>

          <div className="h-8 w-px bg-border" />

          {/* New Website Button - Glass Style */}
          <div className="glass-button-wrap rounded-full relative cursor-pointer">
            <button
              onClick={() => navigate('/builder')}
              className="glass-button relative z-10 text-sm font-medium"
            >
              <span className="glass-button-text relative block select-none tracking-tighter px-5 py-2">
                <span className="flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  New
                </span>
              </span>
            </button>
            <div className="glass-button-shadow rounded-full pointer-events-none"></div>
          </div>
        </div>

        {/* Right Section - Profile & Actions */}
        <div className="flex items-center gap-3">
          {/* User Profile Button */}
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-3 px-4 py-2 rounded-full hover:bg-foreground/5 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-foreground/15 to-foreground/8 flex items-center justify-center">
              <span className="text-sm font-semibold text-foreground">
                {user?.firstName?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <span className="text-sm font-medium text-foreground hidden md:block">
              {user?.firstName || 'User'}
            </span>
          </button>

          <div className="h-8 w-px bg-border" />

          {/* Settings Button */}
          <button
            onClick={() => navigate('/settings')}
            className="p-2.5 rounded-full hover:bg-foreground/5 transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-2.5 rounded-full hover:bg-foreground/5 transition-colors"
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
