export interface User {
  name: string;
  email: string;
}

export interface DogSearchOption {
  name: string;
  available: boolean;
}

export interface StorageItem {
  value: any;
  expiry: number;
}
