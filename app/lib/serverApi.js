import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSellerConfig, getAdsConfig } from "./amazon/config.js";
import { getSellerKpis } from "./amazon/sellerClient.js";
import { getAdsAccessToken } from "./amazon/auth.js";
import { fetchCubeData } from "./cubeReports.js";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

/**
 * Server-side version of the API client.
 * Uses the auth_token from cookies for authentication.
 */
export async function serverFetch(endpoint, options = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value || cookieStore.get("shareable_token")?.value;

  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      return null;
    }
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${errorText}`);
  }

  return response.json();
}

/**
 * Fetches the current user data on the server.
 */
export async function getServerUser() {
  try {
    return await serverFetch("/auth/me");
  } catch (error) {
    console.error("Error fetching user on server:", error);
    return null;
  }
}

/**
 * Fetches the user's companies on the server.
 */
export async function getServerCompanies() {
  try {
    return await serverFetch("/users/me/companies");
  } catch (error) {
    console.error("Error fetching companies on server:", error);
    return [];
  }
}

/**
 * Fetches all users (admin only).
 */
export async function getServerUsers() {
  try {
    return await serverFetch("/users/");
  } catch (error) {
    console.error("Error fetching users on server:", error);
    return [];
  }
}

/**
 * Fetches companies for a specific user.
 */
export async function getServerUserCompanies(userId) {
  if (!userId) return [];
  try {
    return await serverFetch(`/users/${userId}/companies`);
  } catch (error) {
    console.error(`Error fetching companies for user ${userId} on server:`, error);
    return [];
  }
}

/**
 * Fetches Amazon API statuses on the server.
 */
export async function getAmazonStatus() {
  const sellerConfig = getSellerConfig();
  const adsConfig = getAdsConfig();
  
  const results = {
    seller: { status: "not_configured" },
    ads: { status: "not_configured" }
  };

  if (sellerConfig.configured) {
    try {
      const kpis = await getSellerKpis();
      results.seller = {
        status: kpis.source === "api_error" ? "error" : "connected",
        error: kpis.source === "api_error" ? kpis.error : undefined,
        sample: kpis.source === "sample"
      };
    } catch (err) {
      results.seller = { status: "error", error: err.message };
    }
  }

  if (adsConfig.configured) {
    try {
      await getAdsAccessToken({
        clientId: adsConfig.clientId,
        clientSecret: adsConfig.clientSecret,
        refreshToken: adsConfig.refreshToken,
      });
      results.ads = { status: "connected" };
    } catch (err) {
      results.ads = { status: "error", error: err.message };
    }
  }
  return results;
}

/**
 * Fetches all available companies from Cube.js on the server.
 */
export async function getServerAllCompanies() {
  const query = {
    dimensions: ["Companies.name", "Companies.id"]
  };

  try {
    const data = await fetchCubeData(query);
    return data.map(item => ({
      name: item['Companies.name'],
      id: item['Companies.id']
    }));
  } catch (error) {
    console.error("Error fetching all companies on server:", error);
    return [];
  }
}

/**
 * Enforces authentication on the server and redirects to login if missing.
 */
export async function requireServerAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    redirect("/login");
  }

  const user = await getServerUser();
  if (!user) {
    redirect("/login");
  }

  return user;
}
