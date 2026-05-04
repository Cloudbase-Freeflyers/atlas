"use server";

import { revalidatePath } from "next/cache";
import { getServerUser } from "./serverApi";
import {
  listClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
} from "./clientsStore";

async function assertAdmin() {
  const user = await getServerUser();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function listClientsAction() {
  await assertAdmin();
  return listClients();
}

export async function getClientAction(id) {
  await assertAdmin();
  return getClient(id);
}

export async function createClientAction(data) {
  await assertAdmin();
  const created = await createClient(data);
  revalidatePath("/admin/clients");
  return { success: true, data: created };
}

export async function updateClientAction(id, data) {
  await assertAdmin();
  const updated = await updateClient(id, data);
  if (!updated) {
    return { success: false, message: "Client not found" };
  }
  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${id}`);
  revalidatePath(`/admin/clients/${id}/manifest`);
  return { success: true, data: updated };
}

export async function deleteClientAction(id) {
  await assertAdmin();
  const ok = await deleteClient(id);
  if (!ok) {
    return { success: false, message: "Client not found" };
  }
  revalidatePath("/admin/clients");
  return { success: true };
}
