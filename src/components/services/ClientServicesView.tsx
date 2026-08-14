import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Users, Plus, AlertCircle, Trash2, Calendar, DollarSign, Clock, MapPin, FileText, Edit3 } from 'lucide-react';
import { AddServiceModal } from './AddServiceModal';
import { ClientService, PaymentStatus, ServiceStatus } from '../../types';

export const ClientServicesView: React.FC = () => {
  const { clients, updateClient, deleteClient, formatCurrency } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientService | null>(null);

  const totalAgreed = clients.reduce((sum, client) => sum + client.agreedPrice, 0);
  const totalCollected = clients.reduce((sum, client) => {
    if (client.paymentStatus === 'Pagado') return sum + client.agreedPrice;
    return sum + (client.amountPaid || 0);
  }, 0);
  const totalPending = totalAgreed - totalCollected;

  const serviceOrder: Record<string, number> = {
    "En Proceso": 1,
    "Por Empezar": 2,
    "Completado": 3,
    "Cancelado": 4,
  };

  const visibleClients = [...clients]
    .filter(client => !client.archived)
    .sort((a, b) => {
      const serviceCompare =
        (serviceOrder[a.serviceStatus] ?? 99) -
        (serviceOrder[b.serviceStatus] ?? 99);

      if (serviceCompare !== 0) return serviceCompare;

      return new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime();
    });

  const getPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'Pagado':
        return <span className="badge badge-income badge-subtle">✓ Pagado</span>;
      case 'Abono':
        return <span className="badge badge-info badge-subtle">⏳ Abono</span>;
      case 'Sin Pago':
        return <span className="badge badge-expense badge-subtle">⚠ Sin Pago</span>;
    }
  };

  const getServiceBadge = (status: ServiceStatus) => {
    switch (status) {
      case 'En Proceso':
        return <span className="service-tag status-progress">⚡ En Proceso</span>;
      case 'Por Empezar':
        return <span className="service-tag status-pending">📅 Por Empezar</span>;
      case 'Completado':
        return <span className="service-tag status-done">✓ Completado</span>;
      case 'Cancelado':
        return <span className="service-tag status-cancelled">✕ Cancelado</span>;
    }
  };

  const handleOpenAddModal = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (client: ClientService) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  return (
    <div className="services-container animate-fade-in">
      <div className="srv-header-actions">
        <div>
          <h2 className="page-title">Gestión de Clientas</h2>
          <p className="page-subtitle">Seguimiento por estado de servicio y cobros</p>
        </div>
        <button className="add-btn-primary" onClick={handleOpenAddModal}>
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
        {visibleClients.length > 0 ? (
          visibleClients.map(client => {
            const paid = client.paymentStatus === 'Pagado' ? client.agreedPrice : (client.amountPaid || 0);
            const pending = Math.max(0, client.agreedPrice - paid);

            return (
              <div key={client.id} className="srv-card glass-card">
                <div className="srv-card-top">
                  <div className="client-meta">
                    <div className="client-avatar">
                      <Users size={20} color="#818CF8" />
                    </div>
                    <div>
                      <h3 className="client-name">{client.clientName}</h3>
                      <p className="package-title">{client.packageContracted}</p>
                    </div>
                  </div>

                  <div className="srv-badges">
                    {getServiceBadge(client.serviceStatus)}
                    {getPaymentBadge(client.paymentStatus)}
                  </div>
                </div>

                <div className="srv-details">
                  <div className="detail-item">
                    <DollarSign size={14} color="#94A3B8" />
                    <span>Acordado: <strong>{formatCurrency(client.agreedPrice)}</strong></span>
                  </div>
                  <div className="detail-item">
                    <Calendar size={14} color="#94A3B8" />
                    <span>Próx. Cita: {client.nextDate}</span>
                  </div>
                  {(client.hora || client.minuto) && (
                    <div className="detail-item">
                      <Clock size={14} color="#94A3B8" />
                      <span>{client.hora ? `${client.hora}:${client.minuto || '00'} hrs` : `${client.minuto} min`}</span>
                    </div>
                  )}
                  {client.ciudad && (
                    <div className="detail-item">
                      <MapPin size={14} color="#94A3B8" />
                      <span>{client.ciudad}</span>
                    </div>
                  )}
                </div>

                {client.notes && (
                  <div className="client-notes-box">
                    <FileText size={13} color="#94A3B8" />
                    <span>{client.notes}</span>
                  </div>
                )}

                {pending > 0 && (
                  <div className="pending-alert">
                    <AlertCircle size={14} color="#F59E0B" />
                    <span>Pendiente por cobrar: <strong>{formatCurrency(pending)}</strong></span>
                  </div>
                )}

                {/* Interactive Status Changer Action Bar */}
                <div className="srv-actions-bar">
                  <span className="action-label">Estado de Pago:</span>
                  <div className="status-buttons">
                    <button
                      className={`status-btn ${client.paymentStatus === 'Sin Pago' ? 'active-sp' : ''}`}
                      onClick={() => updateClient(client.id, { paymentStatus: 'Sin Pago', amountPaid: 0 })}
                    >
                      Sin Pago
                    </button>
                    <button
                      className={`status-btn ${client.paymentStatus === 'Abono' ? 'active-ab' : ''}`}
                      onClick={() => {
                        const amountStr = prompt('Monto abonado hasta ahora ($):', String(client.amountPaid || client.agreedPrice / 2));
                        if (amountStr) {
                          const val = parseFloat(amountStr);
                          if (!isNaN(val)) {
                            updateClient(client.id, { paymentStatus: 'Abono', amountPaid: val });
                          }
                        }
                      }}
                    >
                      Abono
                    </button>
                    <button
                      className={`status-btn ${client.paymentStatus === 'Pagado' ? 'active-pg' : ''}`}
                      onClick={() => updateClient(client.id, { paymentStatus: 'Pagado', amountPaid: client.agreedPrice })}
                    >
                      Pagado
                    </button>
                  </div>

                  <div className="card-right-actions">
                    <button
                      className="srv-icon-btn edit-btn"
                      title="Editar registro de clienta"
                      onClick={() => handleOpenEditModal(client)}
                    >
                      <Edit3 size={15} color="#818CF8" />
                    </button>

                    <button
                      className="srv-icon-btn delete-btn"
                      title="Eliminar registro"
                      onClick={() => {
                        if (window.confirm(`¿Eliminar registro de ${client.clientName}?`)) {
                          deleteClient(client.id);
                        }
                      }}
                    >
                      <Trash2 size={15} color="#94A3B8" />
                    </button>
                  </div>
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

      {/* Add / Edit Client Service Modal */}
      <AddServiceModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        clientToEdit={editingClient}
      />

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
          padding: 9px 16px;
          border-radius: 14px;
          font-size: 0.85rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          box-shadow: 0 4px 18px rgba(99, 102, 241, 0.4);
          transition: transform 0.2s ease;
        }

        .add-btn-primary:active {
          transform: scale(0.96);
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
          gap: 12px;
        }

        .client-avatar {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          background: rgba(99, 102, 241, 0.18);
          border: 1px solid rgba(99, 102, 241, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .client-name {
          font-size: 1rem;
          font-weight: 800;
          color: #F8FAFC;
        }

        .package-title {
          font-size: 0.76rem;
          color: #818CF8;
          font-weight: 600;
        }

        .srv-badges {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
        }

        .service-tag {
          font-size: 0.78rem;
          padding: 5px 12px;
          border-radius: 12px;
          font-weight: 800;
          letter-spacing: 0.01em;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .status-progress {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%);
          color: #A5B4FC;
          border: 1px solid rgba(129, 140, 248, 0.4);
        }
        .status-pending {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.25) 100%);
          color: #FBBF24;
          border: 1px solid rgba(245, 158, 11, 0.4);
        }
        .status-done {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.25) 100%);
          color: #34D399;
          border: 1px solid rgba(16, 185, 129, 0.4);
        }
        .status-cancelled {
          background: rgba(148, 163, 184, 0.15);
          color: #94A3B8;
          border: 1px solid rgba(148, 163, 184, 0.3);
        }

        .badge-subtle {
          font-size: 0.68rem;
          padding: 2px 8px;
          opacity: 0.85;
        }

        .srv-details {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
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

        .client-notes-box {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          font-size: 0.76rem;
          color: #CBD5E1;
          background: rgba(30, 41, 59, 0.5);
          padding: 8px 12px;
          border-radius: 8px;
          border-left: 3px solid #818CF8;
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

        .card-right-actions {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .srv-icon-btn {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 5px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .srv-icon-btn:hover {
          background: rgba(255, 255, 255, 0.12);
        }

        .empty-state {
          text-align: center;
          padding: 24px;
          color: #94A3B8;
        }
      `}</style>
    </div>
  );
};
