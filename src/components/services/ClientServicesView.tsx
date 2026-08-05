import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Users, Plus, AlertCircle, Trash2, Calendar, DollarSign } from 'lucide-react';
import { AddServiceModal } from './AddServiceModal';
import { PaymentStatus, ServiceStatus } from '../../types';

export const ClientServicesView: React.FC = () => {
  const { services, updateService, deleteService, formatCurrency } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalAgreed = services.reduce((sum, s) => sum + s.agreedPrice, 0);
  const totalCollected = services.reduce((sum, s) => {
    if (s.paymentStatus === 'Pagado') return sum + s.agreedPrice;
    return sum + (s.amountPaid || 0);
  }, 0);
  const totalPending = totalAgreed - totalCollected;

  const serviceOrder: Record<string, number> = {
    "En Proceso": 1,
    "Por Empezar": 2,
    "Finalizado": 3,
  };

  const paymentOrder: Record<string, number> = {
    "Pendiente": 1,
    "Abono": 2,
    "Pagado": 3,
  };

  const visibleServices = services
    .filter(service => !service.archived)
    .sort((a, b) => {
      const dateCompare =
        new Date(b.nextDate).getTime() - new Date(a.nextDate).getTime();

      if (dateCompare !== 0) return dateCompare;

      const serviceCompare =
        (serviceOrder[a.serviceStatus] ?? Number.MAX_SAFE_INTEGER) -
        (serviceOrder[b.serviceStatus] ?? Number.MAX_SAFE_INTEGER);

      if (serviceCompare !== 0) return serviceCompare;

      return (
        (paymentOrder[a.paymentStatus] ?? Number.MAX_SAFE_INTEGER) -
        (paymentOrder[b.paymentStatus] ?? Number.MAX_SAFE_INTEGER)
      );
    });
  

  const getPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'Pagado':
        return <span className="badge badge-income">✓ Pagado</span>;
      case 'Abono':
        return <span className="badge badge-info">⏳ Abono</span>;
      case 'Sin Pago':
        return <span className="badge badge-expense">⚠ Sin Pago</span>;
    }
  };

  const getServiceBadge = (status: ServiceStatus) => {
    switch (status) {
      case 'Completado':
        return <span className="service-tag status-done">Completado</span>;
      case 'En Proceso':
        return <span className="service-tag status-progress">En Proceso</span>;
      case 'Por Empezar':
        return <span className="service-tag status-pending">Por Empezar</span>;
      case 'Cancelado':
        return <span className="service-tag status-cancelled">Cancelado</span>;
    }
  };

  return (
    <div className="services-container animate-fade-in">
      <div className="srv-header-actions">
        <div>
          <h2 className="page-title">Gestión de Clientas</h2>
          <p className="page-subtitle">Seguimiento de trabajos y cobros</p>
        </div>
        <button className="add-btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> Nueva Clienta
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="srv-kpi-grid">
        <div className="srv-kpi-card">
          <span className="kpi-label">Total Acordado</span>
          <p className="kpi-val">{formatCurrency(totalAgreed)}</p>
        </div>
        <div className="srv-kpi-card">
          <span className="kpi-label">Cobrado</span>
          <p className="kpi-val text-income">{formatCurrency(totalCollected)}</p>
        </div>
        <div className="srv-kpi-card">
          <span className="kpi-label">Por Cobrar</span>
          <p className="kpi-val text-expense">{formatCurrency(totalPending)}</p>
        </div>
      </div>

      {/* Services List */}
      <div className="services-list">
        {visibleServices.length > 0 ? (
          visibleServices.map(srv => {
            const paid = srv.paymentStatus === 'Pagado' ? srv.agreedPrice : (srv.amountPaid || 0);
            const pending = Math.max(0, srv.agreedPrice - paid);

            return (
              <div key={srv.id} className="srv-card glass-card">
                <div className="srv-card-top">
                  <div className="client-meta">
                    <div className="client-avatar">
                      <Users size={18} color="#818CF8" />
                    </div>
                    <div>
                      <h3 className="client-name">{srv.clientName}</h3>
                      <p className="package-title">{srv.packageContracted}</p>
                    </div>
                  </div>

                  <div className="srv-badges">
                    {getServiceBadge(srv.serviceStatus)}
                    {getPaymentBadge(srv.paymentStatus)}
                  </div>
                </div>

                <div className="srv-details">
                  <div className="detail-item">
                    <DollarSign size={14} color="#94A3B8" />
                    <span>Acordado: <strong>{formatCurrency(srv.agreedPrice)}</strong></span>
                  </div>
                  <div className="detail-item">
                    <Calendar size={14} color="#94A3B8" />
                    <span>Próx. Cita: {srv.nextDate}</span>
                  </div>
                </div>

                {pending > 0 && (
                  <div className="pending-alert">
                    <AlertCircle size={14} color="#F59E0B" />
                    <span>Pendiente por cobrar: <strong>{formatCurrency(pending)}</strong></span>
                  </div>
                )}

                {/* Interactive Status Changer Action Bar */}
                <div className="srv-actions-bar">
                  <span className="action-label">Cambiar pago:</span>
                  <div className="status-buttons">
                    <button
                      className={`status-btn ${srv.paymentStatus === 'Sin Pago' ? 'active-sp' : ''}`}
                      onClick={() => updateService(srv.id, { paymentStatus: 'Sin Pago', amountPaid: 0 })}
                    >
                      Sin Pago
                    </button>
                    <button
                      className={`status-btn ${srv.paymentStatus === 'Abono' ? 'active-ab' : ''}`}
                      onClick={() => {
                        const amountStr = prompt('Monto abonado hasta ahora ($):', String(srv.amountPaid || srv.agreedPrice / 2));
                        if (amountStr) {
                          const val = parseFloat(amountStr);
                          if (!isNaN(val)) {
                            updateService(srv.id, { paymentStatus: 'Abono', amountPaid: val });
                          }
                        }
                      }}
                    >
                      Abono
                    </button>
                    <button
                      className={`status-btn ${srv.paymentStatus === 'Pagado' ? 'active-pg' : ''}`}
                      onClick={() => updateService(srv.id, { paymentStatus: 'Pagado', amountPaid: srv.agreedPrice })}
                    >
                      Pagado
                    </button>
                  </div>

                  <button
                    className="srv-delete-btn"
                    onClick={() => {
                      if (window.confirm(`¿Eliminar registro de ${srv.clientName}?`)) {
                        deleteService(srv.id);
                      }
                    }}
                  >
                    <Trash2 size={15} color="#94A3B8" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state glass-card">
            <p>No tienes clientas o servicios registrados.</p>
          </div>
        )}
      </div>

      {/* Add Client Service Modal */}
      <AddServiceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <style>{`
        .services-container {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding-bottom: 24px;
        }

        .srv-header-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .page-subtitle {
          font-size: 0.72rem;
          color: #94A3B8;
        }

        .add-btn-primary {
          background: var(--accent-gradient);
          color: white;
          border: none;
          padding: 8px 14px;
          border-radius: 12px;
          font-size: 0.82rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
        }

        .srv-kpi-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .srv-kpi-card {
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 10px;
          text-align: center;
        }

        .kpi-label {
          font-size: 0.68rem;
          color: #94A3B8;
          text-transform: uppercase;
          font-weight: 600;
          display: block;
        }

        .kpi-val {
          font-size: 0.85rem;
          font-weight: 800;
          margin-top: 2px;
        }

        .services-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .srv-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .srv-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .client-meta {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .client-avatar {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: rgba(99, 102, 241, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .client-name {
          font-size: 0.95rem;
          font-weight: 700;
          color: #F8FAFC;
        }

        .package-title {
          font-size: 0.75rem;
          color: #818CF8;
          font-weight: 600;
        }

        .srv-badges {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .service-tag {
          font-size: 0.85rem;
          padding: 2px 8px;
          border-radius: 6px;
          font-weight: 600;
        }

        .status-done {
          background: rgba(16, 185, 129, 0.2);
          color: #34D399;
        }
        .status-progress {
          background: rgba(99, 102, 241, 0.2);
          color: #818CF8;
        }
        .status-pending {
          background: rgba(245, 158, 11, 0.2);
          color: #FBBF24;
        }
        .status-cancelled {
          background: rgba(148, 163, 184, 0.2);
          color: #94A3B8;
        }

        .srv-details {
          display: flex;
          gap: 16px;
          background: rgba(15, 23, 42, 0.4);
          padding: 8px 12px;
          border-radius: 10px;
          font-size: 0.78rem;
          color: #CBD5E1;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .pending-alert {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: 8px;
          padding: 6px 10px;
          font-size: 0.75rem;
          color: #FBBF24;
        }

        .srv-actions-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          padding-top: 10px;
        }

        .action-label {
          font-size: 0.7rem;
          color: #94A3B8;
        }

        .status-buttons {
          display: flex;
          gap: 4px;
        }

        .status-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #94A3B8;
          font-size: 0.68rem;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 6px;
          cursor: pointer;
        }

        .status-btn.active-sp {
          background: rgba(244, 63, 94, 0.25);
          color: #FB7185;
          border-color: rgba(244, 63, 94, 0.4);
        }
        .status-btn.active-ab {
          background: rgba(99, 102, 241, 0.25);
          color: #818CF8;
          border-color: rgba(99, 102, 241, 0.4);
        }
        .status-btn.active-pg {
          background: rgba(16, 185, 129, 0.25);
          color: #34D399;
          border-color: rgba(16, 185, 129, 0.4);
        }

        .srv-delete-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
        }
      `}</style>
    </div>
  );
};
