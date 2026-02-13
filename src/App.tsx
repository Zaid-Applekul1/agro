import { useState } from 'react';
import { ViewType } from './types';
import { AuthWrapper } from './components/AuthWrapper';
import { ExternalNavLink, Navigation } from './components/Navigation';

import { Dashboard } from './components/Dashboard';
import { FieldManagement } from './components/FieldManagement';
import { TreeManagement } from './components/TreeManagement';
import { HarvestManagement } from './components/HarvestManagement';
import { PestManagement } from './components/PestManagement';
import { CropRotation } from './components/CropRotation';
import { FinancialLedger } from './components/FinancialLedger';
import { InventoryManagement } from './components/InventoryManagement';
import { EquipmentRegistry } from './components/EquipmentRegistry';
import { UserManagement } from './components/UserManagement';
import { ActivityManagement } from './components/ActivityManagement';
import { ProfileSettings } from './components/ProfileSettings';
import { FarmCalendar } from './components/FarmCalendar';
import { SupplierLedger } from './components/SupplierLedger';
import { BudgetPlanner } from './components/BudgetPlanner';
import { NurseryManagement } from './components/NurseryManagement';
import { OrchardROI } from './components/OrchardROI';
import { SprayManagement } from './components/SprayManagement';
import { AgronomistManagement } from './components/AgronomistManagement';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const externalLinks: ExternalNavLink[] = [
    {
      label: 'AppleKul Insights',
      url: 'https://insights.applekul.com',
    },
  ];

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentView} />;

      case 'fields':
        return <FieldManagement />;

      case 'trees':
        return <TreeManagement />;

      case 'harvest':
        return <HarvestManagement />;

      case 'pest':
        return <PestManagement />;

      case 'rotation':
        return <CropRotation />;

      case 'finances':
        return <FinancialLedger />;

      case 'inventory':
        return <InventoryManagement />;

      case 'equipment':
        return <EquipmentRegistry />;

      case 'activity':
        return <ActivityManagement />;

      case 'calendar':
        return <FarmCalendar />;

      case 'suppliers':
        return <SupplierLedger />;

      case 'budgets':
        return <BudgetPlanner />;

      case 'nursery':
        return <NurseryManagement />;

      case 'roi':
        return <OrchardROI />;

      case 'spray':
        return <SprayManagement />;

      case 'profile':
        return <ProfileSettings />;

      case 'users':
        return <UserManagement />;

      case 'agronomists':
        return <AgronomistManagement />;

      default:
        return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <AuthWrapper>
      <div className="relative min-h-screen flex">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute -top-16 -right-24 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="absolute bottom-8 left-8 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl" />
        </div>
        <Navigation
          currentView={currentView}
          onViewChange={setCurrentView}
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
          externalLinks={externalLinks}
        />

        <main className="relative flex-1 lg:ml-64 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto enter-fade-up">
            {renderCurrentView()}
          </div>
        </main>
      </div>
    </AuthWrapper>
  );
}

export default App;
