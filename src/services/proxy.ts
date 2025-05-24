import type { Result, User, DogSearchParams, Dog, Match, DogLocation, ZipCodeSearchParams, FilteredLocations } from "@/models";

const API_URL = "https://frontend-take-home-service.fetch.com";

const requests = {
  login: `${API_URL}/auth/login`,
  breeds: `${API_URL}/dogs/breeds`,
  search: `${API_URL}/dogs/search`,
  dogs: `${API_URL}/dogs`,
  match: `${API_URL}/dogs/match`,
  locations: `${API_URL}/locations`,
  zipCodes: `${API_URL}/locations/search`,
};

const generateQueryParams = (params?: unknown): string => {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if(value === undefined || value === "") {
        return;
      } else if (Array.isArray(value)) {
        value.forEach(item => queryParams.append(key, item));
      } else if (typeof value === 'object' && value !== null) {
        queryParams.append(key, Object.values(value).join(":"));  // Only used for sort thus far.
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

export const getMatch = async (ids: string[]): Promise<Match> => {
  const response = await fetch(requests.match, {
    credentials: "include",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ids),
  });

  if (!response.ok) {
    throw new Error("Failed to get matches. Please try again.");
  }

  return response.json();
}

export const getLocations = async (zipCodes: string[]): Promise<DogLocation[]> => {
  const response = await fetch(requests.locations, {
    credentials: "include",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(zipCodes),
  });

  if (!response.ok) {
    throw new Error("Failed to get locations. Please try again.");
  }

  return response.json();
}

export const getFilteredLocations = async (locationFilters: ZipCodeSearchParams): Promise<FilteredLocations> => {
  const response = await fetch(requests.zipCodes, {
    credentials: "include",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(locationFilters),
  });

  if (!response.ok) {
    throw new Error("Failed to get zip codes. Please try again.");
  }

  const data = await response.json();

  return data;
};
