import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Logo = () => (
  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-foreground/15 to-foreground/8 flex items-center justify-center">
    <svg className="h-4 w-4 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  </div>
);

export function Navbar() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Logo />
            <span className="text-2xl font-bold text-foreground tracking-tight">
              WebChat<span className="text-muted-foreground">.ai</span>
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <a
              href="#features"
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-foreground/5"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-foreground/5"
            >
              How It Works
            </a>
            <a
              href="#pricing"
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-foreground/5"
            >
              Pricing
            </a>

            <div className="h-8 w-px bg-border mx-2" />

            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-foreground/5"
            >
              Log In
            </button>

            <div className="glass-button-wrap rounded-full relative cursor-pointer">
              <button
                onClick={() => navigate('/register')}
                className="glass-button relative z-10 text-sm font-medium"
              >
                <span className="glass-button-text relative block select-none tracking-tighter px-6 py-2.5">
                  Get Started
                </span>
              </button>
              <div className="glass-button-shadow rounded-full pointer-events-none"></div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-foreground/5 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          <div className="px-4 py-6 space-y-3">
            <a
              href="#features"
              className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              How It Works
            </a>
            <a
              href="#pricing"
              className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Pricing
            </a>

            <div className="h-px bg-border my-4" />

            <button
              onClick={() => {
                navigate('/login');
                setIsMobileMenuOpen(false);
              }}
              className="w-full px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5 rounded-lg transition-colors text-left"
            >
              Log In
            </button>

            <button
              onClick={() => {
                navigate('/register');
                setIsMobileMenuOpen(false);
              }}
              className="w-full px-6 py-3 text-sm font-semibold bg-gradient-to-r from-foreground/10 to-foreground/5 hover:from-foreground/15 hover:to-foreground/10 text-foreground rounded-lg transition-all"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
