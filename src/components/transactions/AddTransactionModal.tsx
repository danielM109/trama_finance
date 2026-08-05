import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { X, Check } from 'lucide-react';
import { TransactionType } from '../../types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTransactionModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const { addTransaction, accounts } = useFinance();

  const [type, setType] = useState<TransactionType>('Gasto');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Gasto Oeracional');
  const [account, setAccount] = useState(accounts[0]?.name || 'CC Catalina');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const categories = [
    'Venta',
    'Gasto Oeracional',
    'Publicidad',
    'Materiales',
    'Entrenamiento',
    'Transporte',
    'Inversión Inicial',
    'Otros'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
  // const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!description.trim() || isNaN(numAmount) || numAmount <= 0) {
      alert('Por favor completa todos los campos correctamente con un monto mayor a 0.');
      return;
    }

    const d = new Date(date);
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const [year, month] = date.split('-').map(Number);

    try {
      await addTransaction({
      // addTransaction({
        type,
        description: description.trim(),
        amount: numAmount,
        category,
        account,
        date,
        year,
        month: months[month - 1]
      });

      setDescription("");
      setAmount("");
      onClose();

    } catch (err) {
      console.error(err);
      alert("No fue posible guardar la transacción.");
    };
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content glass-card">
        <div className="modal-header">
          <h3 className="modal-title">Nuevo Registro</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} color="#94A3B8" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Type Segmented Control */}
          <div className="segmented-control">
            <button
              type="button"
              className={`seg-btn ${type === 'Gasto' ? 'active-gasto' : ''}`}
              onClick={() => setType('Gasto')}
            >
              Gasto (Egreso)
            </button>
            <button
              type="button"
              className={`seg-btn ${type === 'Ingreso' ? 'active-ingreso' : ''}`}
              onClick={() => setType('Ingreso')}
            >
              Ingreso
            </button>
          </div>

          {/* Amount Input */}
          <div className="form-group">
            <label className="input-label">Monto ($ CLP)</label>
            <div className="amount-input-wrapper">
              <span className="currency-prefix">$</span>
              <input
                type="number"
                placeholder="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="amount-input"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Description Input */}
          <div className="form-group">
            <label className="input-label">Descripción</label>
            <input
              type="text"
              placeholder="Ej. Compra de telas, Venta de producto..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="std-input"
              required
            />
          </div>

          {/* Category Dropdown */}
          <div className="form-group">
            <label className="input-label">Categoría</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="std-select"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Account Dropdown */}
          <div className="form-group">
            <label className="input-label">Cuenta o Medio de Pago</label>
            <select
              value={account}
              onChange={e => setAccount(e.target.value)}
              className="std-select"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.name}>
                  {acc.name} ({acc.type})
                </option>
              ))}
            </select>
          </div>

          {/* Date Input */}
          <div className="form-group">
            <label className="input-label">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="std-input"
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            <Check size={18} /> Guardar {type === 'Gasto' ? 'Gasto' : 'Ingreso'}
          </button>
        </form>
      </div>

      <style>{`
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          z-index: 100;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        @media (min-width: 640px) {
          .modal-backdrop {
            align-items: center;
          }
        }

        .modal-content {
          width: 100%;
          max-width: 480px;
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
          background: #161E31;
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: 20px 24px 28px 24px;
        }

        @media (min-width: 640px) {
          .modal-content {
            border-radius: var(--radius-xl);
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }

        .modal-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: #F8FAFC;
        }

        .close-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
        }

        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .segmented-control {
          display: flex;
          background: rgba(15, 23, 42, 0.6);
          border-radius: 12px;
          padding: 4px;
          gap: 4px;
        }

        .seg-btn {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 10px;
          background: transparent;
          color: #94A3B8;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .seg-btn.active-gasto {
          background: var(--expense-gradient);
          color: white;
          box-shadow: 0 4px 12px rgba(244, 63, 94, 0.3);
        }

        .seg-btn.active-ingreso {
          background: var(--income-gradient);
          color: white;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .amount-input-wrapper {
          display: flex;
          align-items: center;
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 14px;
          padding: 10px 16px;
        }

        .currency-prefix {
          font-size: 1.25rem;
          font-weight: 800;
          color: #818CF8;
          margin-right: 8px;
        }

        .amount-input {
          background: transparent;
          border: none;
          outline: none;
          color: #F8FAFC;
          font-size: 1.25rem;
          font-weight: 800;
          width: 100%;
        }

        .std-input, .std-select {
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          padding: 12px 14px;
          color: #F8FAFC;
          font-size: 0.88rem;
          outline: none;
          font-family: inherit;
        }

        .std-select option {
          background: #1E293B;
          color: #F8FAFC;
        }

        .submit-btn {
          margin-top: 8px;
          background: var(--accent-gradient);
          color: white;
          border: none;
          border-radius: 14px;
          padding: 14px;
          font-size: 0.95rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          box-shadow: var(--shadow-glow);
          transition: transform 0.2s;
        }

        .submit-btn:active {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
};
