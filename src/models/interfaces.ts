export interface User {
  name: string;
  email: string;
}

export interface DogSearchOption {
  name: string;
  isSelected: boolean;
}

export interface StorageItem {
  value: any;
  expiry: number;
}

export interface Result {
  resultIds: string[];
  total: number;
  next: string;
  prev: string;
}

export type SortDirection = 'asc' | 'desc';
export type SortableField = 'breed' | 'name' | 'age';

export interface SortConfig {
  field: SortableField;
  direction: SortDirection;
}

export interface DogSearchParams {
  breeds?: string[];
  zipCodes?: string[];
  ageMin?: number;
  ageMax?: number;
  size?: number;
  from?: number;
  sort?: SortConfig;
}

export interface Dog {
  id: string;
  img: string;
  name: string;
  age: number;
  zip_code: string;
  breed: string;
}

export interface Match {
  match: string;
}

export enum SortByOptions {
  BREED_ASC = "breed-asc",
  BREED_DESC = "breed-desc",
  NAME_ASC = "name-asc",
  NAME_DESC = "name-desc",
  AGE_ASC = "age-asc",
  AGE_DESC = "age-desc",
}
