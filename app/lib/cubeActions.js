"use server";

import createCubeApi from "./cube.js";
import { cookies } from "next/headers";

export async function fetchCubeAction(payload) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value || "";

  const cubeApi = createCubeApi(token);

  try {
    const data = await cubeApi.load(payload).then(response => {
      return response.rawData();
    });
    return { success: true, data };
  } catch (error) {
    console.error("Cube.js action error:", error);
    return { success: false, message: error.message };
  }
}
