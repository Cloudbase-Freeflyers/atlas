"use server";

import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function loginAction(formData) {
  const username = formData.get("username");
  const password = formData.get("password");

  const params = new URLSearchParams();
  params.append("username", username);
  params.append("password", password);

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { 
        success: false, 
        message: errorData.detail || "Login failed" 
      };
    }

    const data = await response.json();
    const { access_token } = data;

    const cookieStore = await cookies();
    cookieStore.set("auth_token", access_token, { 
      path: "/", 
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: true, // Recommended for security
      sameSite: "lax",
    });

    return { success: true };
  } catch (error) {
    console.error("Login action error:", error);
    return { success: false, message: "An unexpected error occurred" };
  }
}

export async function signupAction(formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    const response = await fetch(`${API_BASE_URL}/users/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, role: "customer" }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { 
        success: false, 
        message: errorData.detail || "Signup failed" 
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Signup action error:", error);
    return { success: false, message: "An unexpected error occurred" };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  cookieStore.delete("shareable_token");
  return { success: true };
}

export async function getMeAction() {
  try {
    const { getServerUser } = await import("./serverApi");
    return await getServerUser();
  } catch (error) {
    console.error("Get me action error:", error);
    return null;
  }
}
