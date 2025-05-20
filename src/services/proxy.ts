import type { Result, User, DogSearchParams } from "@/models";

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

export const getBreeds = async (): Promise<string[]> => {
  const response = await fetch(`${API_URL}/dogs/breeds`, {
    credentials: "include",
  });
  return response.json();
};

export const getSearchResults = async (params?: DogSearchParams): Promise<Result> => {
  const queryParams = new URLSearchParams();

  if (params) {
    if (params.breeds?.length) {
      params.breeds.forEach(breed => queryParams.append('breeds', breed));
    }
    if (params.zipCodes?.length) {
      params.zipCodes.forEach(zip => queryParams.append('zipCodes', zip));
    }
    if (params.ageMin !== undefined) {
      queryParams.append('ageMin', params.ageMin.toString());
    }
    if (params.ageMax !== undefined) {
      queryParams.append('ageMax', params.ageMax.toString());
    }
    if (params.size !== undefined) {
      queryParams.append('size', params.size.toString());
    }
    if (params.from) {
      queryParams.append('from', params.from);
    }
    if (params.sort) {
      queryParams.append('sort', `${params.sort.field}:${params.sort.direction}`);
    }
  }

  const response = await fetch(`${API_URL}/dogs/search?${queryParams.toString()}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
};
