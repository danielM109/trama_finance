import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Header } from './components/layout/Header';
import { BottomNavigation } from './components/layout/BottomNavigation';
import { DashboardView } from './components/dashboard/DashboardView';
import { TransactionsView } from './components/transactions/TransactionsView';
import { ClientServicesView } from './components/services/ClientServicesView';
// import { AccountsView } from './components/accounts/AccountsView';
import { AddTransactionModal } from './components/transactions/AddTransactionModal';

const AppContent: React.FC = () => {
  const { activeTab } = useFinance();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'transactions':
        return <TransactionsView onOpenAddModal={() => setIsAddModalOpen(true)} />;
      case 'services':
        return <ClientServicesView />;
      case 'config':
        // return <AccountsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="app-main-wrapper">
      <Header />
      <main className="app-content">{renderActiveTab()}</main>
      <BottomNavigation onOpenAddModal={() => setIsAddModalOpen(true)} />
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <style>{`
        .app-main-wrapper {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          width: 100%;
        }

        .app-content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </div>
  );
};

export function App() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
}

export default App;
