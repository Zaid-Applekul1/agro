import { useState } from 'react';
import { ViewType } from '../types';
import { useAuth } from '../hooks/useAuth';
import { 
  BarChart3, 
  Sprout, 
  RotateCcw, 
  PoundSterling, 
  Package, 
  Wrench, 
  Users,
  Menu,
  X,
  TreePine,
  Apple,
  Bug,
  Droplets,
  ClipboardList,
  CalendarDays,
  Building2,
  ClipboardCheck,
  TrendingUp,
  User,
  LogOut,
  UserCheck,
  ExternalLink
} from 'lucide-react';

export interface ExternalNavLink {
  label: string;
  url: string;
}

interface NavigationProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  externalLinks?: ExternalNavLink[];
}

export function Navigation({
  currentView,
  onViewChange,
  isMobileMenuOpen,
  onToggleMobileMenu,
  externalLinks = [],
}: NavigationProps) {
  const [logoLoadError, setLogoLoadError] = useState(false);
  const { signOut } = useAuth();

  const navItems = [
    { id: 'dashboard' as ViewType, label: 'Dashboard', icon: BarChart3 },
    { id: 'fields' as ViewType, label: 'Fields & Trees', icon: Sprout },
    { id: 'nursery' as ViewType, label: 'Nursery', icon: TreePine },
    { id: 'roi' as ViewType, label: 'Orchard ROI', icon: TrendingUp },
    { id: 'spray' as ViewType, label: 'Spray Programs', icon: Droplets },
    { id: 'harvest' as ViewType, label: 'Harvest', icon: Apple },
    { id: 'pest' as ViewType, label: 'Pest Control', icon: Bug },
    { id: 'rotation' as ViewType, label: 'Rotation', icon: RotateCcw },
    { id: 'finances' as ViewType, label: 'Finances', icon: PoundSterling },
    { id: 'inventory' as ViewType, label: 'Inventory', icon: Package },
    { id: 'equipment' as ViewType, label: 'Equipment', icon: Wrench },
    { id: 'activity' as ViewType, label: 'Activity', icon: ClipboardList },
    { id: 'calendar' as ViewType, label: 'Calendar', icon: CalendarDays },
    { id: 'suppliers' as ViewType, label: 'Suppliers', icon: Building2 },
    { id: 'budgets' as ViewType, label: 'Budgets', icon: ClipboardCheck },

    
    { id: 'agronomists' as ViewType, label: 'Agronomists', icon: UserCheck },

    { id: 'profile' as ViewType, label: 'Profile', icon: User },
    { id: 'users' as ViewType, label: 'Users', icon: Users },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      {/* Mobile menu button */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 bg-[var(--brand-forest)] text-white p-2 rounded-xl shadow-lg soft-lift"
        onClick={onToggleMobileMenu}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Navigation sidebar */}
      <nav
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 glass-panel transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-6 border-b border-[var(--brand-stroke)]">
          <div className="mb-3 flex items-center justify-center">
            {!logoLoadError ? (
              <img
                src="/applekul-one-logo.png"
                alt="AppleKul One"
                className="h-14 w-14 object-contain drop-shadow-sm"
                onError={() => setLogoLoadError(true)}
              />
            ) : (
              <Apple className="text-green-600" size={32} />
            )}
          </div>
          <h1 className="text-2xl font-bold text-[var(--brand-forest)]">AppleKul One</h1>
          <p className="text-sm text-slate-600 mt-1">Orchard Management Platform</p>
        </div>
        
        <div className="p-4">
          <div className="space-y-2">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id);
                    onToggleMobileMenu();
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 soft-lift
                    ${
                      currentView === item.id
                        ? 'bg-emerald-100/80 text-emerald-900 border border-emerald-200 shadow-sm'
                        : 'text-slate-700 hover:bg-white/80 border border-transparent'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>

          {externalLinks.length > 0 && (
            <div className="mt-6 pt-4 border-t border-[var(--brand-stroke)]">
              <p className="px-4 text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                Quick Links
              </p>
              <div className="space-y-2">
                {externalLinks.map(link => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onToggleMobileMenu}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-200 text-slate-700 hover:bg-white/80 border border-transparent hover:border-emerald-100 soft-lift"
                  >
                    <span className="font-medium">{link.label}</span>
                    <ExternalLink size={16} />
                  </a>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-8 pt-4 border-t border-[var(--brand-stroke)]">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 text-slate-700 hover:bg-white/80 soft-lift"
            >
              <LogOut size={20} />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={onToggleMobileMenu}
        />
      )}
    </>
  );
}
