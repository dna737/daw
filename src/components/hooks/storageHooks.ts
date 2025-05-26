import type { StorageItem } from "@/models";
import { useCallback } from "react";
import { DEFAULT_STORAGE_TTL_MS } from "../utils";

// Takes care of auto-expiring login sessions and retrieving them from localStorage
export const useStorage = () => {
  const setItem = useCallback((key: string, value: any, ttlMs: number = DEFAULT_STORAGE_TTL_MS) => {
    const now = Date.now()
    const item: StorageItem = {
      value,
      expiry: now + ttlMs,
    }
    localStorage.setItem(key, JSON.stringify(item))
  }, [])

  const getItem = useCallback((key: string) => {
    const itemStr = localStorage.getItem(key)
    if (!itemStr) return null

    try {
      const item = JSON.parse(itemStr) as StorageItem;
      if (Date.now() > item.expiry) {
        // If this is the login item and it's expired, remove everything
        if (key === 'login') {
          localStorage.clear();
        } else {
          localStorage.removeItem(key);
        }
        return null;
      }
      return item.value;
    } catch {
      localStorage.removeItem(key);
      return null;
    }
  }, [])

  const removeItem = useCallback((key: string) => {
    localStorage.removeItem(key)
  }, [])

  return { setItem, getItem, removeItem }
};
