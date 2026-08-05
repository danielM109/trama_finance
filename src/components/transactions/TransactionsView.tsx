import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Search, Filter, Trash2, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { TransactionType } from '../../types';

interface TransactionsViewProps {
  onOpenAddModal: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ onOpenAddModal }) => {
  const { transactions, deleteTransaction, formatCurrency, accounts } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [filterAccount, setFilterAccount] = useState<string>('all');

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesAccount =
      filterAccount === 'all' ||
      t.account.toLowerCase() === filterAccount.toLowerCase();

    return matchesSearch && matchesType && matchesAccount;
  });

  const totalFilteredExpense = filteredTransactions
    .filter(t => t.type === 'Gasto')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFilteredIncome = filteredTransactions
    .filter(t => t.type === 'Ingreso')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="transactions-container animate-fade-in">
      <div className="tx-header-actions">
        <h2 className="page-title">Historial de Movimientos</h2>
        <button className="add-btn-small" onClick={onOpenAddModal}>
          + Agregar
        </button>
      </div>

      {/* Search Input */}
      <div className="search-box">
        <Search size={16} color="#94A3B8" />
        <input
          type="text"
          placeholder="Buscar movimiento o categoría..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {searchTerm && (
          <button className="clear-btn" onClick={() => setSearchTerm('')}>
            ✕
          </button>
        )}
      </div>

      {/* Filter Tabs & Account selector */}
      <div className="filter-bar">
        <div className="type-pills">
          <button
            className={`pill ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            Todos
          </button>
          <button
            className={`pill ${filterType === 'Gasto' ? 'active expense' : ''}`}
            onClick={() => setFilterType('Gasto')}
          >
            Gastos
          </button>
          <button
            className={`pill ${filterType === 'Ingreso' ? 'active income' : ''}`}
            onClick={() => setFilterType('Ingreso')}
          >
            Ingresos
          </button>
        </div>

        <div className="account-select-wrapper">
          <Filter size={14} color="#94A3B8" />
          <select
            value={filterAccount}
            onChange={e => setFilterAccount(e.target.value)}
            className="account-dropdown"
          >
            <option value="all">Todas las cuentas</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.name}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Totals Summary Pill */}
      <div className="tx-summary-strip">
        <span>Mostrando {filteredTransactions.length} registro(s)</span>
        <div className="strip-amounts">
          <span className="text-income">+{formatCurrency(totalFilteredIncome)}</span>
          <span>|</span>
          <span className="text-expense">-{formatCurrency(totalFilteredExpense)}</span>
        </div>
      </div>

      {/* List of Transactions */}
      <div className="tx-list">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map(tx => (
            <div key={tx.id} className="tx-card glass-card">
              <div className="tx-card-left">
                <div className={`tx-icon-circle ${tx.type === 'Ingreso' ? 'inc' : 'exp'}`}>
                  {tx.type === 'Ingreso' ? (
                    <ArrowUpCircle size={20} />
                  ) : (
                    <ArrowDownCircle size={20} />
                  )}
                </div>
                <div className="tx-info">
                  <h4 className="tx-title">{tx.description}</h4>
                  <div className="tx-meta">
                    <span className="category-tag">{tx.category}</span>
                    <span className="dot-sep">•</span>
                    <span className="account-tag">{tx.account}</span>
                    <span className="dot-sep">•</span>
                    <span className="date-tag">{tx.date}</span>
                  </div>
                </div>
              </div>

              <div className="tx-card-right">
                <span className={`tx-value ${tx.type === 'Ingreso' ? 'text-income' : 'text-expense'}`}>
                  {tx.type === 'Ingreso' ? '+' : '-'}{formatCurrency(tx.amount)}
                </span>
                <button
                  className="delete-btn"
                  onClick={async()=>{
                      if(window.confirm(`¿Eliminar movimiento "${tx.description}"?`)){
                          await deleteTransaction(tx.id);
                      }
                  }}
                  // onClick={() => {
                  //   if (window.confirm(`¿Eliminar movimiento "${tx.description}"?`)) {
                  //     deleteTransaction(tx.id);
                  //   }
                  // }}
                  title="Eliminar movimiento"
                >
                  <Trash2 size={15} color="#94A3B8" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state glass-card">
            <p>No se encontraron movimientos que coincidan con la búsqueda.</p>
          </div>
        )}
      </div>

      <style>{`
        .transactions-container {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding-bottom: 24px;
        }

        .tx-header-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .page-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: #F8FAFC;
        }

        .add-btn-small {
          background: var(--accent-gradient);
          color: white;
          border: none;
          padding: 6px 14px;
          border-radius: 10px;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 10px 14px;
        }

        .search-input {
          background: none;
          border: none;
          outline: none;
          color: #F8FAFC;
          font-size: 0.85rem;
          width: 100%;
          font-family: inherit;
        }

        .clear-btn {
          background: none;
          border: none;
          color: #94A3B8;
          font-size: 0.8rem;
          cursor: pointer;
        }

        .filter-bar {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .type-pills {
          display: flex;
          gap: 6px;
          background: rgba(15, 23, 42, 0.5);
          padding: 4px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .pill {
          flex: 1;
          padding: 6px 10px;
          border: none;
          border-radius: 8px;
          background: transparent;
          color: #94A3B8;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .pill.active {
          background: #334155;
          color: white;
        }

        .pill.active.expense {
          background: rgba(244, 63, 94, 0.2);
          color: #FB7185;
          border: 1px solid rgba(244, 63, 94, 0.4);
        }

        .pill.active.income {
          background: rgba(16, 185, 129, 0.2);
          color: #34D399;
          border: 1px solid rgba(16, 185, 129, 0.4);
        }

        .account-select-wrapper {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(30, 41, 59, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 10px;
          padding: 6px 12px;
        }

        .account-dropdown {
          background: transparent;
          border: none;
          outline: none;
          color: #CBD5E1;
          font-size: 0.78rem;
          width: 100%;
          font-family: inherit;
          cursor: pointer;
        }

        .account-dropdown option {
          background: #1E293B;
          color: #F8FAFC;
        }

        .tx-summary-strip {
          display: flex;
          justify-content: space-between;
          font-size: 0.72rem;
          color: #94A3B8;
          padding: 4px 6px;
        }

        .strip-amounts {
          display: flex;
          gap: 6px;
          font-weight: 700;
        }

        .tx-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .tx-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
        }

        .tx-card-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .tx-icon-circle {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tx-icon-circle.inc {
          background: rgba(16, 185, 129, 0.15);
          color: #10B981;
        }

        .tx-icon-circle.exp {
          background: rgba(244, 63, 94, 0.15);
          color: #F43F5E;
        }

        .tx-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .tx-title {
          font-size: 0.88rem;
          font-weight: 700;
          color: #F8FAFC;
        }

        .tx-meta {
          font-size: 0.68rem;
          color: #94A3B8;
          display: flex;
          align-items: center;
          gap: 4px;
          flex-wrap: wrap;
        }

        .category-tag {
          color: #818CF8;
          font-weight: 600;
        }

        .tx-card-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .tx-value {
          font-size: 0.9rem;
          font-weight: 700;
        }

        .delete-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          opacity: 0.6;
          transition: opacity 0.2s;
        }

        .delete-btn:hover {
          opacity: 1;
        }

        .empty-state {
          text-align: center;
          padding: 24px;
          color: #64748B;
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  );
};
