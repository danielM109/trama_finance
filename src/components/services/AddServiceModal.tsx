import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { X, Check } from 'lucide-react';
import { PaymentStatus, ServiceStatus } from '../../types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddServiceModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const { addService } = useFinance();

  const [clientName, setClientName] = useState('');
  const [packageContracted, setPackageContracted] = useState('');
  const [agreedPrice, setAgreedPrice] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Sin Pago');
  const [amountPaid, setAmountPaid] = useState('');
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>('En Proceso');
  const [serviceDate, setServiceDate] = useState(() => new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(agreedPrice);
    if (!clientName.trim() || !packageContracted.trim() || isNaN(priceNum)) {
      alert('Por favor ingresa el nombre de la clienta, paquete y precio acordado valido.');
      return;
    }

    const paidNum = paymentStatus === 'Pagado' ? priceNum : parseFloat(amountPaid) || 0;

    addService({
      clientName: clientName.trim(),
      packageContracted: packageContracted.trim(),
      agreedPrice: priceNum,
      paymentStatus,
      amountPaid: paidNum,
      serviceStatus,
      serviceDate
    });

    // Reset
    setClientName('');
    setPackageContracted('');
    setAgreedPrice('');
    setAmountPaid('');
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content glass-card">
        <div className="modal-header">
          <h3 className="modal-title">Registrar Nueva Clienta</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} color="#94A3B8" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="input-label">Nombre de la Clienta</label>
            <input
              type="text"
              placeholder="Ej. Natalia Perro Pedro, Camila Soto..."
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              className="std-input"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="input-label">Paquete o Servicio Contratado</label>
            <input
              type="text"
              placeholder="Ej. Trama Completa, Asesoría, Diseño..."
              value={packageContracted}
              onChange={e => setPackageContracted(e.target.value)}
              className="std-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="input-label">Precio Acordado ($ CLP)</label>
            <input
              type="number"
              placeholder="0"
              value={agreedPrice}
              onChange={e => setAgreedPrice(e.target.value)}
              className="std-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="input-label">Estado del Pago</label>
            <select
              value={paymentStatus}
              onChange={e => setPaymentStatus(e.target.value as PaymentStatus)}
              className="std-select"
            >
              <option value="Sin Pago">Sin Pago (0% recibido)</option>
              <option value="Abono">Abono parcial</option>
              <option value="Pagado">Pagado 100%</option>
            </select>
          </div>

          {paymentStatus === 'Abono' && (
            <div className="form-group">
              <label className="input-label">Monto Abonado ($)</label>
              <input
                type="number"
                placeholder="0"
                value={amountPaid}
                onChange={e => setAmountPaid(e.target.value)}
                className="std-input"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="input-label">Estado del Servicio</label>
            <select
              value={serviceStatus}
              onChange={e => setServiceStatus(e.target.value as ServiceStatus)}
              className="std-select"
            >
              <option value="Por Empezar">Por Empezar</option>
              <option value="En Proceso">En Proceso</option>
              <option value="Completado">Completado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          <div className="form-group">
            <label className="input-label">Fecha del Servicio</label>
            <input
              type="date"
              value={serviceDate}
              onChange={e => setServiceDate(e.target.value)}
              className="std-input"
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            <Check size={18} /> Guardar Clienta
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
          gap: 14px;
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
        }
      `}</style>
    </div>
  );
};
