export type TransactionType = 'Gasto' | 'Ingreso';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD or DD/MM/YYYY
  year: number;
  month: string;
  type: TransactionType;
  category: string;
  description: string;
  amount: number; // positive number; sign handled by type
  account: string; // Account name or ID
}

export interface Account {
  id: string;
  name: string;
  type: 'corriente' | 'tarjeta' | 'efectivo' | 'ahorro' | 'colchon' | 'por_pagar';
  balance: number;
  color?: string;
}

export type PaymentStatus = 'Sin Pago' | 'Abono' | 'Pagado';
export type ServiceStatus = 'En Proceso' | 'Por Empezar' | 'Completado' | 'Cancelado';

export interface ClientService {
  id: number;
  clientName: string;
  packageContracted: string;
  agreedPrice: number;
  paymentStatus: PaymentStatus;
  nextDate: string;
  serviceStatus: ServiceStatus;
  amountPaid?: number;
  notes?: string;
  archived: boolean;
}

export interface CategoryBudget {
  category: string;
  estimatedAmount: number;
}

export type ActiveTab = 'dashboard' | 'transactions' | 'services' | 'config';
