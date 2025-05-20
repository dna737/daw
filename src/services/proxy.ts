import type { Result, User, DogSearchParams } from "@/models";

const API_URL = "https://frontend-take-home-service.fetch.com";

const requests = {
  login: `${API_URL}/auth/login`,
  breeds: `${API_URL}/dogs/breeds`,
  search: `${API_URL}/dogs/search`,
}

const generateQueryParams = (params?: unknown): string => {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(item => queryParams.append(key, item));
      } else {
        queryParams.append(key, value);
      }
    });
  }
  return queryParams.toString();
}

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

export const getBreeds = async (): Promise<string[]> => {
  const response = await fetch(requests.breeds, {
    credentials: "include",
  });
  return response.json();
};

export const getSearchResults = async (params?: DogSearchParams): Promise<Result> => {

  const endpoint = `${requests.search + (params ? "?" + generateQueryParams(params) : "")}`;
  console.log("endpoint", endpoint);

  const response = await fetch(endpoint, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
};
