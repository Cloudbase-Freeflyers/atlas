"use server";

import { serverFetch } from "./serverApi";
import { revalidatePath } from "next/cache";

export async function createUserAction(userData) {
  try {
    const data = await serverFetch("/users/", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    revalidatePath("/admin/users");
    return { success: true, data };
  } catch (error) {
    console.error("Create user action error:", error);
    return { success: false, message: error.message };
  }
}

export async function assignCompanyAction(userId, companyId) {
  try {
    const data = await serverFetch(`/users/${userId}/companies/${companyId}`, {
      method: "POST",
    });
    revalidatePath("/admin/users");
    return { success: true, data };
  } catch (error) {
    console.error("Assign company action error:", error);
    return { success: false, message: error.message };
  }
}

export async function removeCompanyAction(userId, companyId) {
  try {
    const data = await serverFetch(`/users/${userId}/companies/${companyId}`, {
      method: "DELETE",
    });
    revalidatePath("/admin/users");
    return { success: true, data };
  } catch (error) {
    console.error("Remove company action error:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Server action to fetch user companies (alternative to public API route).
 */
export async function getUserCompaniesAction(userId) {
  if (!userId) return [];
  try {
    return await serverFetch(`/users/${userId}/companies`);
  } catch (error) {
    console.error(`Error fetching companies for user ${userId} in action:`, error);
    return [];
  }
}

export async function getUsersAction() {
  try {
    return await serverFetch("/users/");
  } catch (error) {
    console.error("Error fetching users in action:", error);
    return [];
  }
}

export async function getMyCompaniesAction() {
  try {
    return await serverFetch("/users/me/companies");
  } catch (error) {
    console.error("Error fetching my companies in action:", error);
    return [];
  }
}
