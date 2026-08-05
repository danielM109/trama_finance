import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { CreditCard, Edit3, Target } from 'lucide-react';

export const AccountsView: React.FC = () => {
  const { accounts, updateAccountBalance, addAccount, budgets, transactions, formatCurrency } = useFinance();

  const [editingAccId, setEditingAccId] = useState<string | null>(null);
  const [newBalanceVal, setNewBalanceVal] = useState('');
  const [showAddAcc, setShowAddAcc] = useState(false);

  // New account form
  const [accName, setAccName] = useState('');
  const [accType, setAccType] = useState<any>('corriente');
  const [accBalance, setAccBalance] = useState('');
  const [accColor, setAccColor] = useState('#3B82F6');

  // Budget calculations
  const totalEstimatedExpense = budgets.reduce((sum, b) => sum + b.estimatedAmount, 0);
  const totalActualExpense = transactions
    .filter(t => t.type === 'gasto')
    .reduce((sum, t) => sum + t.amount, 0);

  const budgetPct = Math.min(100, Math.round((totalActualExpense / (totalEstimatedExpense || 1)) * 100));

  const handleUpdateBalance = (id: string) => {
    const num = parseFloat(newBalanceVal);
    if (!isNaN(num)) {
      updateAccountBalance(id, num);
      setEditingAccId(null);
      setNewBalanceVal('');
    }
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const bal = parseFloat(accBalance) || 0;
    if (accName.trim()) {
      addAccount({
        name: accName.trim(),
        type: accType,
        balance: bal,
        color: accColor
      });
      setAccName('');
      setAccBalance('');
      setShowAddAcc(false);
    }
  };

  return (
    <div className="accounts-container animate-fade-in">
      <div className="acc-header-actions">
        <div>
          <h2 className="page-title">Cuentas y Presupuesto</h2>
          <p className="page-subtitle">Saldos bancarios, tarjetas y fondos</p>
        </div>
        <button className="add-btn-primary" onClick={() => setShowAddAcc(!showAddAcc)}>
          {showAddAcc ? 'Cerrar' : 'Nueva Cuenta'}
        </button>
      </div>

      {/* New Account Form Drawer */}
      {showAddAcc && (
        <form onSubmit={handleCreateAccount} className="glass-card new-acc-form">
          <h4 className="form-subtitle">Agregar Nueva Cuenta</h4>
          <div className="form-row">
            <input
              type="text"
              placeholder="Nombre (ej. BancoEstado, Caja Chica)"
              value={accName}
              onChange={e => setAccName(e.target.value)}
              className="std-input"
              required
            />
            <select
              value={accType}
              onChange={e => setAccType(e.target.value)}
              className="std-select"
            >
              <option value="corriente">Cuenta Corriente</option>
              <option value="tarjeta">Tarjeta de Crédito</option>
              <option value="efectivo">Efectivo</option>
              <option value="ahorro">Fondo de Ahorro</option>
              <option value="colchon">Colchón Imprevistos</option>
              <option value="por_pagar">Cuentas por Pagar</option>
            </select>
          </div>
          <div className="form-row">
            <input
              type="number"
              placeholder="Saldo Inicial ($ CLP)"
              value={accBalance}
              onChange={e => setAccBalance(e.target.value)}
              className="std-input"
            />
            <input
              type="color"
              value={accColor}
              onChange={e => setAccColor(e.target.value)}
              className="color-picker-input"
            />
          </div>
          <button type="submit" className="save-acc-btn">
            Guardar Cuenta
          </button>
        </form>
      )}

      {/* Estimated vs Actual Expense Budget Widget (Matching Page 1 of Excel PDF) */}
      <div className="glass-card budget-widget">
        <div className="budget-top">
          <div className="budget-title-area">
            <Target size={20} color="#818CF8" />
            <div>
              <h3 className="widget-title">Presupuesto de Gasto Estimado</h3>
              <p className="widget-sub">Basado en tu planificación mensual</p>
            </div>
          </div>
          <span className="budget-pct">{budgetPct}% usado</span>
        </div>

        <div className="budget-progress-bg">
          <div
            className={`budget-progress-fill ${budgetPct > 90 ? 'danger' : ''}`}
            style={{ width: `${budgetPct}%` }}
          ></div>
        </div>

        <div className="budget-amounts">
          <div>
            <span className="b-label">Gasto Ejecutado (Real)</span>
            <p className="b-val text-expense">{formatCurrency(totalActualExpense)}</p>
          </div>
          <div className="text-right">
            <span className="b-label">Gasto Estimado (Meta)</span>
            <p className="b-val">{formatCurrency(totalEstimatedExpense)}</p>
          </div>
        </div>
      </div>

      {/* Accounts List */}
      <div className="accounts-grid">
        {accounts.map(acc => (
          <div key={acc.id} className="glass-card acc-card">
            <div className="acc-card-header">
              <div className="acc-icon-box" style={{ backgroundColor: `${acc.color}25`, border: `1px solid ${acc.color}50` }}>
                <CreditCard size={20} color={acc.color || '#6366F1'} />
              </div>
              <div className="acc-header-info">
                <h3 className="acc-card-name">{acc.name}</h3>
                <span className="acc-type-pill">{acc.type.replace('_', ' ')}</span>
              </div>
            </div>

            <div className="acc-card-body">
              {editingAccId === acc.id ? (
                <div className="edit-bal-inline">
                  <input
                    type="number"
                    value={newBalanceVal}
                    onChange={e => setNewBalanceVal(e.target.value)}
                    placeholder="Nuevo saldo"
                    className="std-input inline-input"
                    autoFocus
                  />
                  <button className="confirm-btn" onClick={() => handleUpdateBalance(acc.id)}>
                    ✓
                  </button>
                  <button className="cancel-btn" onClick={() => setEditingAccId(null)}>
                    ✕
                  </button>
                </div>
              ) : (
                <div className="bal-display">
                  <span className="bal-label">Saldo Actual</span>
                  <div className="bal-row">
                    <p className={`bal-amount ${acc.balance < 0 ? 'text-expense' : 'text-primary'}`}>
                      {formatCurrency(acc.balance)}
                    </p>
                    <button
                      className="edit-icon-btn"
                      onClick={() => {
                        setEditingAccId(acc.id);
                        setNewBalanceVal(String(acc.balance));
                      }}
                      title="Editar Saldo"
                    >
                      <Edit3 size={14} color="#94A3B8" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .accounts-container {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding-bottom: 24px;
        }

        .acc-header-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .add-btn-primary {
          background: var(--accent-gradient);
          color: white;
          border: none;
          padding: 8px 6px;
          border-radius: 12px;
          font-size: 0.82rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
        }

        .new-acc-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .form-subtitle {
          font-size: 0.9rem;
          font-weight: 700;
          color: #F8FAFC;
        }

        .form-row {
          display: flex;
          gap: 8px;
        }

        .color-picker-input {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: transparent;
          cursor: pointer;
        }

        .save-acc-btn {
          background: var(--accent-gradient);
          color: white;
          border: none;
          padding: 10px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .budget-widget {
          display: flex;
          flex-direction: column;
          gap: 14px;
          background: rgba(30, 41, 59, 0.7);
        }

        .budget-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .budget-title-area {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .widget-title {
          font-size: 0.92rem;
          font-weight: 700;
          color: #F8FAFC;
        }

        .widget-sub {
          font-size: 0.72rem;
          color: #94A3B8;
        }

        .budget-pct {
          font-size: 0.78rem;
          font-weight: 700;
          color: #818CF8;
          background: rgba(99, 102, 241, 0.15);
          padding: 4px 10px;
          border-radius: 20px;
        }

        .budget-progress-bg {
          width: 100%;
          height: 10px;
          background: rgba(15, 23, 42, 0.6);
          border-radius: 20px;
          overflow: hidden;
        }

        .budget-progress-fill {
          height: 100%;
          background: var(--accent-gradient);
          border-radius: 20px;
          transition: width 0.4s ease;
        }

        .budget-progress-fill.danger {
          background: var(--expense-gradient);
        }

        .budget-amounts {
          display: flex;
          justify-content: space-between;
          font-size: 0.78rem;
        }

        .b-label {
          color: #94A3B8;
          display: block;
          font-size: 0.7rem;
        }

        .b-val {
          font-weight: 800;
          font-size: 0.95rem;
        }

        .text-right {
          text-align: right;
        }

        .accounts-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        @media (min-width: 480px) {
          .accounts-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .acc-card {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 14px;
        }

        .acc-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .acc-icon-box {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .acc-header-info {
          display: flex;
          flex-direction: column;
        }

        .acc-card-name {
          font-size: 0.95rem;
          font-weight: 700;
          color: #F8FAFC;
        }

        .acc-type-pill {
          font-size: 0.68rem;
          color: #94A3B8;
          text-transform: capitalize;
        }

        .bal-label {
          font-size: 0.7rem;
          color: #94A3B8;
          display: block;
        }

        .bal-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .bal-amount {
          font-size: 1.15rem;
          font-weight: 800;
        }

        .edit-icon-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
        }

        .edit-bal-inline {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .inline-input {
          padding: 6px 10px;
          font-size: 0.85rem;
        }

        .confirm-btn {
          background: #10B981;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 6px 10px;
          cursor: pointer;
          font-weight: 700;
        }

        .cancel-btn {
          background: #334155;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 6px 10px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};
