import { useState } from 'react';
import { ViewType } from './types';
import { AuthWrapper } from './components/AuthWrapper';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { FieldManagement } from './components/FieldManagement';
import { TreeManagement } from './components/TreeManagement';
import { HarvestManagement } from './components/HarvestManagement';
import { PestManagement } from './components/PestManagement';
import { CropRotation } from './components/CropRotation';
import { FinancialLedger } from './components/FinancialLedger';
import { InventoryManagement } from './components/InventoryManagement';
import { EquipmentRegistry } from './components/EquipmentRegistry';
import { ActivityManagement } from './components/ActivityManagement';
import { ProfileSettings } from './components/ProfileSettings';
import { FarmCalendar } from './components/FarmCalendar';
import { SupplierLedger } from './components/SupplierLedger';
import { BudgetPlanner } from './components/BudgetPlanner';
import { NurseryManagement } from './components/NurseryManagement';
import { OrchardROI } from './components/OrchardROI';
import { SprayManagement } from './components/SprayManagement';
import { MasterDataManagement } from './components/MasterDataManagement';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard onNavigate={setCurrentView} />;
      case 'fields': return <FieldManagement />;
      case 'trees': return <FieldManagement />; // Redirect to unified Fields & Trees
      case 'harvest': return <HarvestManagement />;
      case 'pest': return <PestManagement />;
      case 'rotation': return <CropRotation />;
      case 'finances': return <FinancialLedger />;
      case 'inventory': return <InventoryManagement />;
      case 'equipment': return <EquipmentRegistry />;
      case 'activity': return <ActivityManagement />;
      case 'calendar': return <FarmCalendar />;
      case 'suppliers': return <SupplierLedger />;
      case 'budgets': return <BudgetPlanner />;
      case 'nursery': return <NurseryManagement />;
      case 'roi': return <OrchardROI />;
      case 'spray': return <SprayManagement />;
      case 'master-data': return <MasterDataManagement />;
      case 'profile': return <ProfileSettings />;
      default: return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  const handleToggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gray-50 flex">
        <Navigation 
          currentView={currentView} 
          onViewChange={setCurrentView}
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleMobileMenu={handleToggleMobileMenu}
        />
        
        <main className="flex-1 lg:ml-64 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderCurrentView()}
          </div>
        </main>
      </div>
    </AuthWrapper>
  );
}

export default App;