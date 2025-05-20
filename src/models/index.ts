export * from "./interfaces";

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
