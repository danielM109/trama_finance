import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useFinance } from '../../context/FinanceContext';
import { X, Check } from 'lucide-react';
import { ClientService, PaymentStatus, ServiceStatus } from '../../types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientToEdit?: ClientService | null;
}

export const AddServiceModal: React.FC<ModalProps> = ({ isOpen, onClose, clientToEdit }) => {
  const { addClient, updateClient } = useFinance();

  const [clientName, setClientName] = useState('');
  const [packageContracted, setPackageContracted] = useState('');
  const [agreedPrice, setAgreedPrice] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Sin Pago');
  const [amountPaid, setAmountPaid] = useState('');
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>('En Proceso');
  const [nextDate, setNextDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [hora, setHora] = useState('');
  const [minuto, setMinuto] = useState('00');
  const [ciudad, setCiudad] = useState('');
  const [notes, setNotes] = useState('');

  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Lock background body scroll while modal is open
      const originalStyle = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      if (backdropRef.current) backdropRef.current.scrollTop = 0;

      if (clientToEdit) {
        setClientName(clientToEdit.clientName || '');
        setPackageContracted(clientToEdit.packageContracted || '');
        setAgreedPrice(clientToEdit.agreedPrice != null ? String(clientToEdit.agreedPrice) : '');
        setPaymentStatus(clientToEdit.paymentStatus || 'Sin Pago');
        setAmountPaid(clientToEdit.amountPaid != null ? String(clientToEdit.amountPaid) : '');
        setServiceStatus(clientToEdit.serviceStatus || 'En Proceso');
        setNextDate(clientToEdit.nextDate || new Date().toISOString().split('T')[0]);
        setHora(clientToEdit.hora || '');
        setMinuto(clientToEdit.minuto || '00');
        setCiudad(clientToEdit.ciudad || '');
        setNotes(clientToEdit.notes || '');
      } else {
        setClientName('');
        setPackageContracted('');
        setAgreedPrice('');
        setPaymentStatus('Sin Pago');
        setAmountPaid('');
        setServiceStatus('En Proceso');
        setNextDate(new Date().toISOString().split('T')[0]);
        setHora('');
        setMinuto('00');
        setCiudad('');
        setNotes('');
      }

      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen, clientToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(agreedPrice);
    if (!clientName.trim() || !packageContracted.trim() || isNaN(priceNum)) {
      alert('Por favor ingresa el nombre de la clienta, paquete y precio acordado válido.');
      return;
    }

    const paidNum = paymentStatus === 'Pagado' ? priceNum : parseFloat(amountPaid) || 0;

    const payloadData = {
      clientName: clientName.trim(),
      packageContracted: packageContracted.trim(),
      agreedPrice: priceNum,
      paymentStatus,
      amountPaid: paidNum,
      serviceStatus,
      nextDate,
      hora: hora || undefined,
      minuto: minuto || undefined,
      ciudad: ciudad.trim() || undefined,
      notes: notes.trim() || undefined,
      archived: clientToEdit ? clientToEdit.archived : false
    };

    if (clientToEdit) {
      updateClient(clientToEdit.id, payloadData);
    } else {
      addClient(payloadData);
    }

    // Reset
    setClientName('');
    setPackageContracted('');
    setAgreedPrice('');
    setAmountPaid('');
    setHora('');
    setMinuto('00');
    setCiudad('');
    setNotes('');
    onClose();
  };

  const hoursOptions = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutesOptions = Array.from({ length: 11 }, (_, i) => String((i + 1) * 5).padStart(2, '0'));

  const modalJSX = (
    <div ref={backdropRef} className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{clientToEdit ? 'Editar Clienta' : 'Registrar Nueva Clienta'}</h3>
          <button className="close-btn" onClick={onClose} type="button">
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
              value={nextDate}
              onChange={e => setNextDate(e.target.value)}
              className="std-input"
              required
            />
          </div>

          {/* Hora y Minuto (Misma fila - Opcionales) */}
          <div className="form-group">
            <label className="input-label">
              Hora y Minuto <span className="optional-tag">(Opcional)</span>
            </label>
            <div className="form-row">
              <select
                value={hora}
                onChange={e => setHora(e.target.value)}
                className="std-select flex-1"
              >
                <option value="">Hora --</option>
                {hoursOptions.map(h => (
                  <option key={h} value={h}>
                    {h} hrs
                  </option>
                ))}
              </select>
              <select
                value={minuto}
                onChange={e => setMinuto(e.target.value)}
                className="std-select flex-1"
              >
                <option value="00">00 min</option>
                {minutesOptions.map(m => (
                  <option key={m} value={m}>
                    {m} min
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Ciudad (Opcional) */}
          <div className="form-group">
            <label className="input-label">
              Ciudad <span className="optional-tag">(Opcional)</span>
            </label>
            <input
              type="text"
              placeholder="Ej. Santiago, Concepción, Viña del Mar..."
              value={ciudad}
              onChange={e => setCiudad(e.target.value)}
              className="std-input"
            />
          </div>

          {/* Notas / Observaciones (Opcional) */}
          <div className="form-group">
            <label className="input-label">
              Notas <span className="optional-tag">(Opcional)</span>
            </label>
            <textarea
              placeholder="Ej. Detalles del servicio, instrucciones de entrega..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="std-input std-textarea"
              rows={2}
            />
          </div>

          <button type="submit" className="submit-btn">
            <Check size={18} /> {clientToEdit ? 'Actualizar' : 'Guardar Clienta'}
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
          height: 100dvh;
          background: rgba(11, 15, 25, 0.88);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          z-index: 999999;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 12px 12px 80px 12px;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }

        .modal-content {
          width: 100%;
          max-width: 480px;
          margin: 12px auto 40px auto;
          display: flex;
          flex-direction: column;
          background: #161E31;
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
          position: relative;
        }

        .modal-header {
          position: sticky;
          top: 0;
          z-index: 10;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          background: #161E31;
          border-top-left-radius: 24px;
          border-top-right-radius: 24px;
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
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding-bottom: 32px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-row {
          display: flex;
          gap: 8px;
        }

        .flex-1 {
          flex: 1;
        }

        .input-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .optional-tag {
          color: #64748B;
          font-size: 0.68rem;
          font-weight: 500;
          text-transform: none;
        }

        .std-input, .std-select, .std-textarea {
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          padding: 12px 14px;
          color: #F8FAFC;
          font-size: 16px; /* 16px prevents iOS Safari auto-zoom */
          outline: none;
          font-family: inherit;
        }

        .std-textarea {
          resize: vertical;
          min-height: 70px;
        }

        .std-select option {
          background: #1E293B;
          color: #F8FAFC;
        }

        .submit-btn {
          margin-top: 12px;
          background: var(--accent-gradient);
          color: white;
          border: none;
          border-radius: 14px;
          padding: 16px;
          font-size: 1rem;
          font-weight: 800;
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
