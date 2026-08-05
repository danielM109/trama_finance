import { Transaction, Account, ClientService, CategoryBudget } from '../types';

export const INITIAL_ACCOUNTS: Account[] = [
  { id: 'cc-catalina', name: 'CC Catalina', type: 'corriente', balance: 3139814, color: '#3B82F6' },
  { id: 'tc-daniel', name: 'TC Daniel', type: 'tarjeta', balance: -563718, color: '#EC4899' },
  { id: 'efectivo', name: 'Efectivo', type: 'efectivo', balance: 40000, color: '#10B981' },
  { id: 'ahorro', name: 'Ahorro', type: 'ahorro', balance: 178000, color: '#8B5CF6' },
  { id: 'colchon', name: 'Colchón Imprevistos', type: 'colchon', balance: 120000, color: '#F59E0B' },
  { id: 'a-pagar', name: 'Cuentas Por Pagar', type: 'por_pagar', balance: -3480853, color: '#EF4444' }
];

export const INITIAL_BUDGETS: CategoryBudget[] = [
  { category: 'Inversión Inicial', estimatedAmount: 1180000 },
  { category: 'Entrenamiento', estimatedAmount: 100000 },
  { category: 'Materiales y Telas', estimatedAmount: 150000 },
  { category: 'Herramientas y Equipo', estimatedAmount: 50000 }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 't1', date: '2026-07-09', year: 2026, month: 'Julio', type: 'Gasto', category: 'Inversión Inicial', description: 'Tarjetas', amount: 15990, account: 'CC Catalina' },
  { id: 't2', date: '2026-07-13', year: 2026, month: 'Julio', type: 'Gasto', category: 'Inversión Inicial', description: 'Mesa', amount: 70000, account: 'CC Catalina' },
  { id: 't3', date: '2026-07-02', year: 2026, month: 'Julio', type: 'Gasto', category: 'Inversión Inicial', description: 'Fichas', amount: 51500, account: 'CC Catalina' },
  { id: 't4', date: '2026-07-03', year: 2026, month: 'Julio', type: 'Gasto', category: 'Inversión Inicial', description: 'Telas', amount: 499990, account: 'CC Catalina' },
  { id: 't5', date: '2026-07-04', year: 2026, month: 'Julio', type: 'Gasto', category: 'Inversión Inicial', description: 'Perchero y Alfombra', amount: 95970, account: 'CC Catalina' },
  { id: 't6', date: '2026-07-05', year: 2026, month: 'Julio', type: 'Gasto', category: 'Inversión Inicial', description: 'Sillas', amount: 53466, account: 'CC Catalina' },
  { id: 't7', date: '2026-07-06', year: 2026, month: 'Julio', type: 'Gasto', category: 'Inversión Inicial', description: 'Shein', amount: 37800, account: 'CC Catalina' },
  { id: 't8', date: '2026-07-07', year: 2026, month: 'Julio', type: 'Gasto', category: 'Inversión Inicial', description: 'Mesa Centro', amount: 45000, account: 'CC Catalina' },
  { id: 't9', date: '2026-07-02', year: 2026, month: 'Julio', type: 'Gasto', category: 'Inversión Inicial', description: 'Cuaderno', amount: 7990, account: 'TC Daniel' },
  { id: 't10', date: '2026-07-03', year: 2026, month: 'Julio', type: 'Gasto', category: 'Inversión Inicial', description: 'Espejo', amount: 50000, account: 'TC Daniel' },
  { id: 't11', date: '2026-07-04', year: 2026, month: 'Julio', type: 'Gasto', category: 'Inversión Inicial', description: 'Aro de Luz', amount: 21080, account: 'TC Daniel' },
  { id: 't12', date: '2026-07-05', year: 2026, month: 'Julio', type: 'Gasto', category: 'Inversión Inicial', description: 'Envio Telas', amount: 13588, account: 'TC Daniel' },
  { id: 't13', date: '2026-07-06', year: 2026, month: 'Julio', type: 'Gasto', category: 'Entrenamiento', description: 'Pasaje Turbus', amount: 9500, account: 'TC Daniel' },
  { id: 't14', date: '2026-07-07', year: 2026, month: 'Julio', type: 'Gasto', category: 'Inversión Inicial', description: 'Lámparas', amount: 24115, account: 'CC Catalina' },
  { id: 't15', date: '2026-07-08', year: 2026, month: 'Julio', type: 'Gasto', category: 'Inversión Inicial', description: 'Canva Pro', amount: 70000, account: 'CC Catalina' },
  { id: 't16', date: '2026-07-09', year: 2026, month: 'Julio', type: 'Gasto', category: 'Entrenamiento', description: 'Torta evento', amount: 22500, account: 'CC Catalina' },
  { id: 't17', date: '2026-07-10', year: 2026, month: 'Julio', type: 'Gasto', category: 'Inversión Inicial', description: 'Peluquería', amount: 85000, account: 'CC Catalina' },
  { id: 't18', date: '2026-07-11', year: 2026, month: 'Julio', type: 'Gasto', category: 'Inversión Inicial', description: 'Ganchos y Cuadros', amount: 22000, account: 'CC Catalina' },
  { id: 't19', date: '2026-07-12', year: 2026, month: 'Julio', type: 'Gasto', category: 'Inversión Inicial', description: 'Marcos Cuadro', amount: 11900, account: 'CC Catalina' },
  { id: 't20', date: '2026-07-13', year: 2026, month: 'Julio', type: 'Gasto', category: 'Inversión Inicial', description: 'Espejito', amount: 3500, account: 'CC Catalina' },
  { id: 't21', date: '2026-07-13', year: 2026, month: 'Julio', type: 'Ingreso', category: 'Venta', description: 'Venta silla', amount: 40000, account: 'Efectivo' }
];

export const INITIAL_SERVICES: ClientService[] = [
  {
    id: 's1',
    clientName: 'Natalia Perro Pedro',
    packageContracted: 'Trama Completa',
    agreedPrice: 0,
    amountPaid: 0,
    paymentStatus: 'Sin Pago',
    nextDate: '2026-08-07',
    serviceStatus: 'En Proceso',
    notes: 'Servicio de diseño y confección personalizado',
    archived: false
  }
  // {
  //   id: 's2',
  //   clientName: 'María José Silva',
  //   packageContracted: 'Diseño Base & Asesoría',
  //   agreedPrice: 85000,
  //   amountPaid: 45000,
  //   paymentStatus: 'Abono',
  //   nextDate: '2026-08-02',
  //   serviceStatus: 'Por Empezar',
  //   notes: 'Abonó el 50% inicial por transferencia',
  //   archived: false
  // },
  // {
  //   id: 's3',
  //   clientName: 'Catalina Merino',
  //   packageContracted: 'Diseño Base & Asesoría',
  //   agreedPrice: 95000,
  //   amountPaid: 15000,
  //   paymentStatus: 'Abono',
  //   nextDate: '2026-08-01',
  //   serviceStatus: 'Por Empezar',
  //   notes: '',
  //   archived: true
  // }
];
