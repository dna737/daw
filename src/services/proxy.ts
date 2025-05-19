import type { User } from "@/models";

const API_URL = "https://frontend-take-home-service.fetch.com";

export const login = async (name: string, email: string): Promise<boolean | null> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify({ name, email } as User),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to login. Please try again.");
  }

  return true;
};
