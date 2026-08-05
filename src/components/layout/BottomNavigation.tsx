import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { LayoutDashboard, Receipt, Plus, Users, Settings } from 'lucide-react';
import { ActiveTab } from '../../types';

interface BottomNavProps {
  onOpenAddModal: () => void;
}

export const BottomNavigation: React.FC<BottomNavProps> = ({ onOpenAddModal }) => {
  const { activeTab, setActiveTab } = useFinance();

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Resumen', icon: <LayoutDashboard size={20} /> },
    { id: 'transactions', label: 'Movimientos', icon: <Receipt size={20} /> },
    { id: 'services', label: 'Clientas', icon: <Users size={20} /> },
    { id: 'config', label: 'Configuración', icon: <Settings size={20} /> }
  ];

  return (
    <nav className="bottom-nav-container">
      <div className="bottom-nav">
        {navItems.slice(0, 2).map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`nav-tab ${activeTab === item.id ? 'active' : ''}`}
          >
            <div className="tab-icon">{item.icon}</div>
            <span className="tab-label">{item.label}</span>
          </button>
        ))}

        {/* Central Floating Quick Add Action Button */}
        <div className="fab-wrapper">
          <button
            onClick={onOpenAddModal}
            className="fab-btn"
            title="Registrar Ingreso / Gasto"
          >
            <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
          </button>
        </div>

        {navItems.slice(2).map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`nav-tab ${activeTab === item.id ? 'active' : ''}`}
          >
            <div className="tab-icon">{item.icon}</div>
            <span className="tab-label">{item.label}</span>
          </button>
        ))}
      </div>

      <style>{`
        .bottom-nav-container {
          position: sticky;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 50;
          background: rgba(15, 23, 42, 0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding: 8px 12px 14px 12px;
        }

        .bottom-nav {
          display: flex;
          align-items: center;
          justify-content: space-around;
          position: relative;
        }

        .nav-tab {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          color: #64748B;
          cursor: pointer;
          padding: 6px 12px;
          border-radius: 12px;
          transition: all 0.2s ease;
          width: 70px;
        }

        .nav-tab.active {
          color: #818CF8;
        }

        .nav-tab.active .tab-icon {
          transform: translateY(-2px);
        }

        .tab-icon {
          transition: transform 0.2s ease;
        }

        .tab-label {
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: -0.01em;
        }

        .fab-wrapper {
          position: relative;
          top: -18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .fab-btn {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: var(--accent-gradient);
          border: 4px solid #0F172A;
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
        }

        .fab-btn:hover {
          transform: scale(1.08);
          box-shadow: 0 10px 25px rgba(99, 102, 241, 0.6);
        }

        .fab-btn:active {
          transform: scale(0.95);
        }
      `}</style>
    </nav>
  );
};
