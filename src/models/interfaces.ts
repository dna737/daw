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
  from?: string;
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
