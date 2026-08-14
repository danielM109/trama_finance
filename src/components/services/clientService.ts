import { supabase } from '../../lib/supabase';
import { ClientService } from '../../types';

const TABLE_NAME = 'Clientes';

function toServiceModel(row: any): ClientService {
  return {
    id: row.id ?? row.client_id ?? row.clientId ?? `srv_${Date.now()}`,
    clientName: row.clientName ?? row.client_name ?? row.nombre ?? '',
    packageContracted: row.packageContracted ?? row.package_contracted ?? row.paquete ?? '',
    agreedPrice: Number(row.agreedPrice ?? row.agreed_price ?? row.precio_acordado ?? 0),
    paymentStatus: (row.paymentStatus ?? row.payment_status ?? row.estado_pago ?? 'Sin Pago') as ClientService['paymentStatus'],
    amountPaid: Number(row.amountPaid ?? row.amount_paid ?? row.monto_pagado ?? 0),
    nextDate: row.nextDate ?? row.next_date ?? row.proxima_fecha ?? '',
    serviceStatus: (row.serviceStatus ?? row.service_status ?? row.estado_servicio ?? 'En Proceso') as ClientService['serviceStatus'],
    hora: row.hora != null ? String(row.hora) : undefined,
    minuto: row.minuto != null ? String(row.minuto) : undefined,
    ciudad: row.ciudad != null ? String(row.ciudad) : undefined,
    notes: row.notes ?? row.observaciones ?? undefined,
    archived: Boolean(row.archived ?? row.archivado ?? false),
  };
}

function toPayload(service: Partial<ClientService>) {
  const payload: Record<string, unknown> = {};

  if (service.clientName !== undefined) payload.clientName = service.clientName;
  if (service.packageContracted !== undefined) payload.packageContracted = service.packageContracted;
  if (service.agreedPrice !== undefined) payload.agreedPrice = service.agreedPrice;
  if (service.paymentStatus !== undefined) payload.paymentStatus = service.paymentStatus;
  if (service.amountPaid !== undefined) payload.amountPaid = service.amountPaid;
  if (service.nextDate !== undefined) payload.nextDate = service.nextDate;
  if (service.serviceStatus !== undefined) payload.serviceStatus = service.serviceStatus;
  if (service.hora !== undefined) payload.hora = service.hora;
  if (service.minuto !== undefined) payload.minuto = service.minuto;
  if (service.ciudad !== undefined) payload.ciudad = service.ciudad;
  if (service.notes !== undefined) payload.notes = service.notes;
  if (service.archived !== undefined) payload.archived = service.archived;

  return payload;
}

function resolveId(id: string | number) {
  const numericId = Number(id);
  return Number.isNaN(numericId) ? id : numericId;
}

export async function getClients() {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('nextDate', { ascending: false });

  if (error) throw error;

  return (data ?? []).map(toServiceModel);
}

export async function createClient(service: Omit<ClientService, 'id'>) {
  const payload = toPayload(service);

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(payload)
    .select();

  if (error) throw error;

  return (data ?? []).map(toServiceModel);
}

export async function updateClient(id: number, updates: Partial<ClientService>) {
  const payload = toPayload(updates);

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(payload)
    .eq('id', resolveId(id))
    .select();

  if (error) throw error;

  return (data ?? []).map(toServiceModel);
}

export async function deleteClient(id: number) {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', resolveId(id));

  if (error) throw error;
}
