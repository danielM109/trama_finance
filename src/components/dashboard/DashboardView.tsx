import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { TrendingDown, TrendingUp, CircleDollarSign, Clock, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export const DashboardView: React.FC = () => {
  const { transactions, clients, formatCurrency, setActiveTab } = useFinance();

  const [filterPeriod, setFilterPeriod] = useState<'all' | 'year' | 'month'>('month');
  
  const availableYears = Array.from(new Set(transactions.map(t => t.year))).sort((a, b) => b - a);
  const currentYear = availableYears.length > 0 ? availableYears[0] : new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const availableMonths = Array.from(new Set(transactions.filter(t => t.year === selectedYear).map(t => t.month)));
  // const initialMonth = availableMonths[0];
  const initialMonth = availableMonths.length > 0 ? availableMonths[0] : months[new Date().getMonth()];;
  const [selectedMonth, setSelectedMonth] = useState<string>(initialMonth);

  const filteredTransactions = transactions.filter(t => {
    if (filterPeriod === 'all') return true;
    if (filterPeriod === 'year') return t.year === selectedYear;
    if (filterPeriod === 'month') return t.year === selectedYear && t.month === selectedMonth;
    return true;
  });

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'Gasto')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'Ingreso')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const netPeriodBalance = totalIncome - totalExpense;

  // Pending Receivables from Clients
  const pendingReceivables = clients.reduce((sum, client) => {
    const paid = client.amountPaid || (client.paymentStatus === 'Pagado' ? client.agreedPrice : 0);
    return sum + Math.max(0, client.agreedPrice - paid);
  }, 0);

  // Group Expenses by Category for Chart
  const categoryMap: { [key: string]: number } = {};
  filteredTransactions
    .filter(t => t.type === 'Gasto')
    .forEach(t => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });

  const chartColors = ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6', '#3B82F6'];
  const chartData = Object.keys(categoryMap).map((cat, idx) => ({
    name: cat,
    value: categoryMap[cat],
    color: chartColors[idx % chartColors.length]
  }));

  const recentTransactions = filteredTransactions.slice(0, 5);

  return (
    <div className="dashboard-container animate-fade-in">
      {/* Time Period Filter */}
      <div className="period-filter-bar glass-card">
        <div className="filter-type-toggles">
          <button className={`period-btn ${filterPeriod === 'month' ? 'active' : ''}`} onClick={() => setFilterPeriod('month')}>Mes</button>
          <button className={`period-btn ${filterPeriod === 'year' ? 'active' : ''}`} onClick={() => setFilterPeriod('year')}>Año</button>
          <button className={`period-btn ${filterPeriod === 'all' ? 'active' : ''}`} onClick={() => setFilterPeriod('all')}>Total</button>
        </div>
        
        {filterPeriod !== 'all' && (
          <div className="filter-selects">
            {filterPeriod === 'month' && (
              <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="period-select">
                {availableMonths.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            )}
            <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="period-select">
              {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Balance Summary Header Card */}
      <div className="balance-hero-card">
        <div className="hero-top">
          <div>
            <span className="hero-label">
              {filterPeriod === 'all' ? 'Flujo Neto Histórico' : `Flujo Neto ${filterPeriod === 'year' ? selectedYear : selectedMonth}`}
            </span>
            <h2 className="hero-amount">{formatCurrency(netPeriodBalance)}</h2>
          </div>
          <div className="hero-icon-badge">
            <CircleDollarSign size={24} color="#818CF8" />
          </div>
        </div>

        <div className="hero-metrics">
          <div className="metric-box">
            <div className="metric-icon metric-inc">
              <TrendingUp size={14} color="#10B981" />
            </div>
            <div>
              <span className="metric-sub">Total Ingresos</span>
              <p className="metric-val text-income">+{formatCurrency(totalIncome)}</p>
            </div>
          </div>

          <div className="metric-box">
            <div className="metric-icon metric-exp">
              <TrendingDown size={14} color="#F43F5E" />
            </div>
            <div>
              <span className="metric-sub">Total Gastos</span>
              <p className="metric-val text-expense">-{formatCurrency(totalExpense)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Receivables Quick Card */}
      {pendingReceivables > 0 && (
        <div
          className="glass-card glass-card-interactive pending-receivable-card"
          onClick={() => setActiveTab('services')}
        >
          <div className="pr-info">
            <div className="pr-icon">
              <Clock size={20} color="#F59E0B" />
            </div>
            <div>
              <h4 className="pr-title">Cuentas por Cobrar (Clientas)</h4>
              <p className="pr-sub">Tienes clientes con pagos pendientes</p>
            </div>
          </div>
          <div className="pr-amount">
            <span>{formatCurrency(pendingReceivables)}</span>
            <ArrowRight size={16} color="#F59E0B" />
          </div>
        </div>
      )}

      {/* Expense Categories Chart Section */}
      <div className="glass-card section-card">
        <div className="section-header">
          <h3 className="section-title">Distribución de Gastos</h3>
          <span className="section-badge">
            {filterPeriod === 'all' ? 'Todo' : filterPeriod === 'year' ? selectedYear : `${selectedMonth} ${selectedYear}`}
          </span>
        </div>

        {chartData.length > 0 ? (
          <div className="chart-wrapper">
            <div style={{ width: '100%', height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number) => [formatCurrency(val), 'Gasto']}
                    contentStyle={{ background: '#1E293B', borderColor: '#334155', borderRadius: '10px', color: '#F8FAFC' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="legend-grid">
              {chartData.map((item, i) => {
                const percentage = Math.round((item.value / totalExpense) * 100) || 0;
                return (
                  <div key={i} className="legend-item">
                    <div className="legend-dot" style={{ backgroundColor: item.color }}></div>
                    <span className="legend-name">{item.name}</span>
                    <span className="legend-pct">{percentage}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="empty-msg">No hay gastos registrados este mes.</p>
        )}
      </div>


      {/* Recent Movements Widget */}
      <div className="glass-card section-card">
        <div className="section-header">
          <h3 className="section-title">Últimos Movimientos</h3>
          <button className="text-link-btn" onClick={() => setActiveTab('transactions')}>
            Ver todo <ArrowRight size={14} />
          </button>
        </div>

        <div className="recent-tx-list">
          {recentTransactions.map(tx => (
            <div key={tx.id} className="tx-item">
              <div className="tx-left">
                <div className={`tx-type-icon ${tx.type === 'Ingreso' ? 'inc' : 'exp'}`}>
                  {tx.type === 'Ingreso' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                </div>
                <div>
                  <h4 className="tx-desc">{tx.description}</h4>
                  <div className="tx-sub-info">
                    <span>{tx.category}</span>
                    <span className="dot-sep">•</span>
                    <span>{tx.account}</span>
                  </div>
                </div>
              </div>
              <span className={`tx-amount ${tx.type === 'Ingreso' ? 'text-income' : 'text-expense'}`}>
                {tx.type === 'Ingreso' ? '+' : '-'}{formatCurrency(tx.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .dashboard-container {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding-bottom: 24px;
        }

        .period-filter-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 4px;
        }

        .filter-type-toggles {
          display: flex;
          background: rgba(15, 23, 42, 0.6);
          border-radius: 10px;
          padding: 4px;
          gap: 4px;
        }

        .period-btn {
          background: transparent;
          border: none;
          color: #94A3B8;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .period-btn.active {
          background: #334155;
          color: #F8FAFC;
        }

        .filter-selects {
          display: flex;
          gap: 8px;
        }

        .period-select {
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #F8FAFC;
          padding: 6px 10px;
          border-radius: 8px;
          font-size: 0.75rem;
          outline: none;
          font-family: inherit;
        }

        .balance-hero-card {
          background: linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%);
          border-radius: var(--radius-xl);
          padding: 22px 20px;
          color: white;
          box-shadow: 0 12px 30px rgba(49, 46, 129, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .hero-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .hero-label {
          font-size: 0.75rem;
          color: #A5B4FC;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .hero-amount {
          font-size: 1.85rem;
          font-weight: 800;
          margin-top: 4px;
          letter-spacing: -0.03em;
        }

        .hero-icon-badge {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-metrics {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          background: rgba(0, 0, 0, 0.22);
          backdrop-filter: blur(10px);
          padding: 12px 14px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .metric-box {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .metric-icon {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .metric-inc {
          background: rgba(16, 185, 129, 0.2);
        }

        .metric-exp {
          background: rgba(244, 63, 94, 0.2);
        }

        .metric-sub {
          font-size: 0.68rem;
          color: #CBD5E1;
          display: block;
        }

        .metric-val {
          font-size: 0.85rem;
          font-weight: 700;
        }

        .pending-receivable-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-left: 4px solid #F59E0B;
          background: rgba(245, 158, 11, 0.06);
        }

        .pr-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .pr-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: rgba(245, 158, 11, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pr-title {
          font-size: 0.88rem;
          font-weight: 700;
          color: #F8FAFC;
        }

        .pr-sub {
          font-size: 0.72rem;
          color: #94A3B8;
        }

        .pr-amount {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 700;
          color: #FBBF24;
          font-size: 0.95rem;
        }

        .section-card {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .section-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: #F8FAFC;
        }

        .section-badge {
          font-size: 0.7rem;
          background: rgba(255, 255, 255, 0.06);
          padding: 3px 8px;
          border-radius: 8px;
          color: #94A3B8;
        }

        .text-link-btn {
          background: none;
          border: none;
          color: #818CF8;
          font-size: 0.78rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
        }

        .chart-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .legend-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px 12px;
          width: 100%;
          margin-top: 8px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
        }

        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .legend-name {
          color: #CBD5E1;
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .legend-pct {
          color: #94A3B8;
          font-weight: 600;
        }


        .recent-tx-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .tx-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 0;
          border-bottom: 1px dashed rgba(255, 255, 255, 0.06);
        }

        .tx-item:last-child {
          border-bottom: none;
        }

        .tx-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .tx-type-icon {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tx-type-icon.inc {
          background: rgba(16, 185, 129, 0.15);
          color: #10B981;
        }

        .tx-type-icon.exp {
          background: rgba(244, 63, 94, 0.15);
          color: #F43F5E;
        }

        .tx-desc {
          font-size: 0.85rem;
          font-weight: 600;
          color: #F8FAFC;
        }

        .tx-sub-info {
          font-size: 0.7rem;
          color: #94A3B8;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .dot-sep {
          color: #475569;
        }

        .tx-amount {
          font-size: 0.88rem;
          font-weight: 700;
        }

        .empty-msg {
          text-align: center;
          color: #64748B;
          font-size: 0.8rem;
          padding: 16px 0;
        }
      `}</style>
    </div>
  );
};
