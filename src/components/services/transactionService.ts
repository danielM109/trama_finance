import { supabase } from '../../lib/supabase';
import { Transaction } from "../../types";

export async function getTransactions() {
    const { data, error } = await supabase
        .from("Transacciones")
        .select("*")
        .order("date", { ascending: false });

    if (error) throw error;

    return data as Transaction[];
}

export async function createTransaction(
    tx: Omit<Transaction,"id">
) {
    console.log("TX:", tx);
    const { error } = await supabase
        .from("Transacciones")
        .insert(tx)
        .select();

    if (error) throw error;
}

export async function deleteTransaction(id:string){

    const {error} = await supabase
        .from("Transacciones")
        .delete()
        .eq("id",id);

    if(error) throw error;
}