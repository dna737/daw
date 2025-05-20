import type { Result, User, DogSearchParams, Dog } from "@/models";

const API_URL = "https://frontend-take-home-service.fetch.com";

const requests = {
  login: `${API_URL}/auth/login`,
  breeds: `${API_URL}/dogs/breeds`,
  search: `${API_URL}/dogs/search`,
  dogs: `${API_URL}/dogs`,
};

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

  if (!response.ok) {
    throw new Error("Failed to get breeds. Please try again.");
  }

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

  if (!response.ok) {
    throw new Error("Failed to get search results. Please try again.");
  }

  return response.json();
};

export const getDogs = async (ids: string[]): Promise<Dog[]> => {
  console.log("ids", ids);
  const response = await fetch(requests.dogs, {
    credentials: "include",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ids),
  });

  if (!response.ok) {
    throw new Error("Failed to get dogs. Please try again.");
  }

  const data = await response.json();
  console.log("data", data);
  return data;
};
