import type { StorageItem } from "@/models";
import { useCallback } from "react";

const DEFAULT_TTL = 1000 * 60 * 60; // 1 hour

// Takes care of auto-expiring login sessions and retrieving them from localStorage
export const useStorage = () => {
  const setItem = useCallback((key: string, value: any, ttlMs: number = DEFAULT_TTL) => {
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
        localStorage.removeItem(key);
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
