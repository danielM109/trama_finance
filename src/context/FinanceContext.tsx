import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction, Account, ClientService, CategoryBudget, ActiveTab } from '../types';
import { INITIAL_ACCOUNTS, INITIAL_BUDGETS } from '../data/initialData';
import { getTransactions, createTransaction, deleteTransaction as removeTransaction } from '../components/services/transactionService';
import {
  getClients,
  createClient,
  updateClient as updateClientRecord,
  deleteClient as removeClient
} from '../components/services/clientService';

interface FinanceContextType {
  transactions: Transaction[];
  accounts: Account[];
  clients: ClientService[];
  budgets: CategoryBudget[];
  categories: string[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  addCategory: (category: string) => void;
  deleteCategory: (category: string) => void;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  addClient: (client: Omit<ClientService, 'id'>) => void;
  updateClient: (id: number, updated: Partial<ClientService>) => void;
  deleteClient: (id: number) => void;
  addAccount: (acc: Omit<Account, 'id'>) => void;
  updateAccountBalance: (id: string, newBalance: number) => void;
  resetToInitialData: () => void;
  formatCurrency: (amount: number) => string;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TRANSACTIONS: 'finanflow_transactions_v1',
  ACCOUNTS: 'finanflow_accounts_v1',
  SERVICES: 'finanflow_services_v1',
  BUDGETS: 'finanflow_budgets_v1',
  CATEGORIES: 'finanflow_categories_v1'
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // const [transactions, setTransactions] = useState<Transaction[]>(() => {
  //   const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  //   return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  // });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  const [clients, setClients] = useState<ClientService[]>([]);
  
  // const [services, setServices] = useState<ClientService[]>(() => {
  //   const saved = localStorage.getItem(STORAGE_KEYS.SERVICES);
  //   return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  // });

  const [budgets] = useState<CategoryBudget[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
  });

  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : [
      'Inversión Inicial', 'Entrenamiento', 'Materiales y Telas', 
      'Venta', 'Publicidad', 'Herramientas', 'Transporte', 'Otros'
    ];
  });

  // Save to LocalStorage
  // useEffect(() => {
  //   localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  // }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }, [accounts]);

  // useEffect(() => {
  //   localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
  // }, [services]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  const formatCurrency = (amount: number): string => {
    const formatted = new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(Math.abs(amount));

    return amount < 0 ? `-${formatted}` : formatted;
  };

  const loadTransactions = async () => {
    try {
      const data = await getTransactions();
      setTransactions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadClients = async () => {
    try {
      const data = await getClients();
      setClients(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTransactions();
    loadClients();
  }, []);

  const addTransaction = async (
      tx: Omit<Transaction,"id">
  )=>{
      await createTransaction(tx);
      await loadTransactions();
      setAccounts(prev=>
          prev.map(acc=>{
              if(
                  acc.name.toLowerCase()===tx.account.toLowerCase() ||
                  acc.id===tx.account
              ){
                  const delta=
                      tx.type==="Ingreso"
                      ? tx.amount
                      : -tx.amount;
                  return{
                      ...acc,
                      balance:acc.balance+delta
                  }
              }
              return acc;
          })
      );
  };

  const deleteTransaction = async(id:string)=>{
      const tx=transactions.find(x=>x.id===id);
      if(!tx) return;
      await removeTransaction(id);
      await loadTransactions();
      setAccounts(prev=>
          prev.map(acc=>{
              if(
                  acc.name.toLowerCase()===tx.account.toLowerCase() ||
                  acc.id===tx.account
              ){
                  const delta=
                      tx.type==="Ingreso"
                      ? -tx.amount
                      : tx.amount;
                  return{
                      ...acc,
                      balance:acc.balance+delta
                  }
              }
              return acc;
          })
      );
  };

  // const addTransaction = (txData: Omit<Transaction, 'id'>) => {
  //   const newTx: Transaction = {
  //     ...txData,
  //     id: `tx_${Date.now()}`
  //   };
  //   setTransactions(prev => [newTx, ...prev]);

  //   // Automatically update target account balance
  //   setAccounts(prevAccounts =>
  //     prevAccounts.map(acc => {
  //       if (acc.name.toLowerCase() === txData.account.toLowerCase() || acc.id === txData.account) {
  //         const delta = txData.type === 'ingreso' ? txData.amount : -txData.amount;
  //         return { ...acc, balance: acc.balance + delta };
  //       }
  //       return acc;
  //     })
  //   );
  // };

  // const deleteTransaction = (id: string) => {
  //   const txToDelete = transactions.find(t => t.id === id);
  //   if (txToDelete) {
  //     setTransactions(prev => prev.filter(t => t.id !== id));
  //     // Revert balance shift
  //     setAccounts(prevAccounts =>
  //       prevAccounts.map(acc => {
  //         if (acc.name.toLowerCase() === txToDelete.account.toLowerCase() || acc.id === txToDelete.account) {
  //           const delta = txToDelete.type === 'ingreso' ? -txToDelete.amount : txToDelete.amount;
  //           return { ...acc, balance: acc.balance + delta };
  //         }
  //         return acc;
  //       })
  //     );
  //   }
  // };

  const addClient = async (cli: Omit<ClientService, 'id'>) => {
    try {
      const created = await createClient(cli);
      if (created.length > 0) {
        setClients(prev => [created[0], ...prev]);
      } else {
        await loadClients();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateClient = async (id: number, updated: Partial<ClientService>) => {
    try {
      const updatedItems = await updateClientRecord(id, updated);
      if (updatedItems.length > 0) {
        const updatedItem = updatedItems[0];
        setClients(prev => prev.map(cli => (cli.id === id || cli.id === updatedItem.id ? { ...cli, ...updatedItem } : cli)));
      } else {
        await loadClients();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteClient = async (id: number) => {
    try {
      await removeClient(id);
      setClients(prev => prev.filter(cli => cli.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const addAccount = (accData: Omit<Account, 'id'>) => {
    const newAcc: Account = {
      ...accData,
      id: `acc_${Date.now()}`
    };
    setAccounts(prev => [...prev, newAcc]);
  };

  const updateAccountBalance = (id: string, newBalance: number) => {
    setAccounts(prev =>
      prev.map(acc => (acc.id === id ? { ...acc, balance: newBalance } : acc))
    );
  };

  const addCategory = (category: string) => {
    const cat = category.trim();
    if (cat && !categories.includes(cat)) {
      setCategories(prev => [...prev, cat]);
    }
  };

  const deleteCategory = (category: string) => {
    setCategories(prev => prev.filter(c => c !== category));
  };

  const resetToInitialData = () => {
    if (window.confirm('¿Deseas restablecer todos los datos a la versión inicial de ejemplo?')) {
      // setTransactions(INITIAL_TRANSACTIONS);
      setAccounts(INITIAL_ACCOUNTS);
      // setServices(INITIAL_SERVICES);
      localStorage.clear();
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        accounts,
        clients,
        budgets,
        categories,
        activeTab,
        setActiveTab,
        addCategory,
        deleteCategory,
        addTransaction,
        deleteTransaction,
        addClient,
        updateClient,
        deleteClient,
        addAccount,
        updateAccountBalance,
        resetToInitialData,
        formatCurrency
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance debe ser utilizado dentro de un FinanceProvider');
  }
  return context;
};
