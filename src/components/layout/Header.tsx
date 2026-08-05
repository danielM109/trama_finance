import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Wallet, RotateCcw, TrendingUp, TrendingDown } from 'lucide-react';

export const Header: React.FC = () => {
  const { resetToInitialData, transactions, formatCurrency } = useFinance();

  // Net Cash Flow calculation for current month
  const totalIncome = transactions
    .filter(t => t.type === 'Ingreso')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'Gasto')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  return (
    <header className="header-container">
      <div className="header-top">
        <div className="header-brand">
          <div className="brand-icon">
            <Wallet className="w-5 h-5 text-indigo-400" size={22} color="#818CF8" />
          </div>
          <div>
            <h1 className="brand-title">TramaFinance</h1>
            <p className="brand-subtitle">Control Emprendimiento</p>
          </div>
        </div>

        <div className="header-actions">
          <button
            onClick={resetToInitialData}
            title="Restablecer datos de planilla inicial"
            className="icon-btn"
          >
            <RotateCcw size={18} color="#94A3B8" />
          </button>
        </div>
      </div>

      <div className="header-flow-bar">
        <div className="flow-item">
          <span className="flow-label">Ingresos</span>
          <span className="flow-val text-income">+{formatCurrency(totalIncome)}</span>
        </div>
        <div className="flow-divider"></div>
        <div className="flow-item">
          <span className="flow-label">Egresos</span>
          <span className="flow-val text-expense">-{formatCurrency(totalExpense)}</span>
        </div>
        <div className="flow-divider"></div>
        <div className="flow-item">
          <span className="flow-label">Neto</span>
          <span className={`flow-val ${netBalance >= 0 ? 'text-income' : 'text-expense'}`}>
            {netBalance > 0 ? 
              <TrendingUp size={12} style={{ display: 'inline', marginRight: 2 }} /> :
              <TrendingDown size={12} style={{ display: 'inline', marginRight: 2 }} />}
            {/* <TrendingDown size={12} style={{ display: 'inline', marginRight: 2 }} /> */}
            {formatCurrency(netBalance)}
          </span>
        </div>
      </div>

      <style>{`
        .header-container {
          padding: 16px 20px 12px 20px;
          background: linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.7) 100%);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          position: sticky;
          top: 0;
          z-index: 40;
        }

        .header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .header-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(99, 102, 241, 0.15);
          border: 1px solid rgba(99, 102, 241, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .brand-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: #F8FAFC;
          line-height: 1.1;
        }

        .brand-subtitle {
          font-size: 0.72rem;
          color: #94A3B8;
          font-weight: 500;
        }

        .icon-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
        }

        .icon-btn:hover {
          background: rgba(255, 255, 255, 0.12);
        }

        .header-flow-bar {
          display: flex;
          align-items: center;
          justify-content: space-around;
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 14px;
          padding: 8px 12px;
        }

        .flow-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .flow-label {
          font-size: 0.68rem;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          font-weight: 600;
        }

        .flow-val {
          font-size: 0.85rem;
          font-weight: 700;
        }

        .flow-divider {
          width: 1px;
          height: 22px;
          background: rgba(255, 255, 255, 0.08);
        }
      `}</style>
    </header>
  );
};
