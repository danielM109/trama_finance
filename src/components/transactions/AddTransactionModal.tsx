import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useFinance } from '../../context/FinanceContext';
import { X, Check, Trash2 } from 'lucide-react';
import { TransactionType } from '../../types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTransactionModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const { addTransaction, accounts, categories, addCategory, deleteCategory } = useFinance();

  const [type, setType] = useState<TransactionType>('Gasto');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0] || 'Gasto Operacional');
  const [account, setAccount] = useState(accounts[0]?.name || 'CC Catalina');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const backdropRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (backdropRef.current) backdropRef.current.scrollTop = 0;
      if (formRef.current) formRef.current.scrollTop = 0;
      if (categories.length > 0 && !category) {
        setCategory(categories[0]);
      }
    }
  }, [isOpen, categories, category]);

  if (!isOpen) return null;

  const handleAddCat = (e: React.MouseEvent) => {
    e.preventDefault();
    if (newCatName.trim()) {
      addCategory(newCatName.trim());
      setCategory(newCatName.trim());
      setNewCatName('');
      setShowAddCategory(false);
    }
  };

  const handleDeleteCat = (e: React.MouseEvent, catToDelete: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (categories.length <= 1) {
      alert('Debes tener al menos una categoría.');
      return;
    }
    if (window.confirm(`¿Eliminar la categoría "${catToDelete}"?`)) {
      deleteCategory(catToDelete);
      if (category === catToDelete) {
        setCategory(categories.find(c => c !== catToDelete) || '');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!description.trim() || isNaN(numAmount) || numAmount <= 0) {
      alert('Por favor completa todos los campos correctamente con un monto mayor a 0.');
      return;
    }

    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const [year, month] = date.split('-').map(Number);

    try {
      await addTransaction({
        type,
        description: description.trim(),
        amount: numAmount,
        category: category || categories[0] || 'Otros',
        account: account || (accounts[0]?.name || 'Efectivo'),
        date,
        year,
        month: months[month - 1]
      });

      setDescription('');
      setAmount('');
      onClose();
    } catch (err) {
      console.error(err);
      alert('No fue posible guardar la transacción.');
    }
  };

  const modalJSX = (
    <div ref={backdropRef} className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Nuevo Registro</h3>
          <button className="close-btn" onClick={onClose} type="button">
            <X size={20} color="#94A3B8" />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="modal-form">
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

          {/* Category Dropdown & Actions */}
          <div className="form-group">
            <div className="label-with-action">
              <label className="input-label">Categoría</label>
              <button
                type="button"
                className="text-action-btn"
                onClick={() => setShowAddCategory(!showAddCategory)}
              >
                {showAddCategory ? 'Cancelar' : '+ Nueva Categoría'}
              </button>
            </div>

            {showAddCategory ? (
              <div className="add-cat-row">
                <input
                  type="text"
                  placeholder="Nombre de nueva categoría"
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  className="std-input inline-cat-input"
                />
                <button type="button" className="save-cat-btn" onClick={handleAddCat}>
                  Guardar
                </button>
              </div>
            ) : (
              <div className="select-with-delete">
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="std-select flex-1"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {category && (
                  <button
                    type="button"
                    className="del-cat-icon-btn"
                    onClick={e => handleDeleteCat(e, category)}
                    title={`Eliminar categoría ${category}`}
                  >
                    <Trash2 size={16} color="#F43F5E" />
                  </button>
                )}
              </div>
            )}
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
          width: 100vw;
          height: 100vh;
          background: rgba(11, 15, 25, 0.88);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          z-index: 999999;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 16px;
          overflow-y: auto;
        }

        .modal-content {
          width: 100%;
          max-width: 480px;
          max-height: calc(100vh - 32px);
          margin: auto;
          display: flex;
          flex-direction: column;
          background: #161E31;
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
          overflow: hidden;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          background: #161E31;
          flex-shrink: 0;
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
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-form {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
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

        .label-with-action {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .text-action-btn {
          background: none;
          border: none;
          color: #818CF8;
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
        }

        .add-cat-row {
          display: flex;
          gap: 8px;
        }

        .inline-cat-input {
          flex: 1;
          padding: 10px 12px;
          font-size: 0.85rem;
        }

        .save-cat-btn {
          background: var(--accent-gradient);
          color: white;
          border: none;
          padding: 0 14px;
          border-radius: 10px;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
        }

        .select-with-delete {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .flex-1 {
          flex: 1;
        }

        .del-cat-icon-btn {
          background: rgba(244, 63, 94, 0.12);
          border: 1px solid rgba(244, 63, 94, 0.25);
          border-radius: 10px;
          padding: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
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

  return ReactDOM.createPortal(modalJSX, document.body);
};
