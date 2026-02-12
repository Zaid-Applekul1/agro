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
  ClipboardList,
  CalendarDays,
  Building2,
  ClipboardCheck,
  TrendingUp,
  User,
  LogOut
} from 'lucide-react';

interface NavigationProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export function Navigation({ currentView, onViewChange, isMobileMenuOpen, onToggleMobileMenu }: NavigationProps) {
  const { signOut } = useAuth();

  const navItems = [
    { id: 'dashboard' as ViewType, label: 'Dashboard', icon: BarChart3 },
    { id: 'fields' as ViewType, label: 'Fields & Trees', icon: Sprout },
    { id: 'nursery' as ViewType, label: 'Nursery', icon: TreePine },
    { id: 'roi' as ViewType, label: 'Orchard ROI', icon: TrendingUp },
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
        className="lg:hidden fixed top-4 left-4 z-50 bg-green-600 text-white p-2 rounded-lg shadow-lg"
        onClick={onToggleMobileMenu}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Navigation sidebar */}
      <nav className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-green-800">AppleKul Farm</h1>
          <p className="text-sm text-gray-600 mt-1">Management System</p>
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
                    w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors
                    ${currentView === item.id 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
          
          <div className="mt-8 pt-4 border-t border-gray-200">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors text-gray-700 hover:bg-gray-50"
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