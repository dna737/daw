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
  BREED_ASC = "breed:asc",
  BREED_DESC = "breed:desc",
  NAME_ASC = "name:asc",
  NAME_DESC = "name:desc",
  AGE_ASC = "age:asc",
  AGE_DESC = "age:desc",
}

export interface FilterOptions {
  breeds?: string[];
  zipCodes?: string[];
  ageMin?: number;
  ageMax?: number;
}

export interface DogLocation {
  zip_code: string
  latitude: number
  longitude: number
  city: string
  state: string
  county: string
}

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface StateOption {
  name: string;
  code: string;
  isSelected: boolean;
}

// Base coordinates for a point
interface GeoPoint {
  lat: number;
  lon: number;
}

export interface CardinalBoundingBox {
  top: number;    // higher latitude
  left: number;   // left-most longitude
  bottom: number; // lower latitude
  right: number;  // right-most longitude
}

export interface CornerBoundingBox {
  bottom_left: GeoPoint;
  top_right: GeoPoint;
  bottom_right?: GeoPoint;
  top_left?: GeoPoint;
}

export type GeoBoundingBox = CardinalBoundingBox | CornerBoundingBox;

export interface ZipCodeSearchParams {
  city?: string;           // full or partial name of a city
  states?: string[];       // array of two-letter state/territory abbreviations
  geoBoundingBox?: GeoBoundingBox;
  size?: number;          // number of results to return (defaults to 25)
  from?: string;          // cursor for pagination
}

export interface FilteredLocations {
  results: DogLocation[];
  total: number;
}
