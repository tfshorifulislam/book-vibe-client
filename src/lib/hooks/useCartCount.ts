"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  getCartCount,
  LIBRARY_EVENT,
  subscribeToLibrary,
} from "@/lib/client/guest-library";

export function useCartCount(): number {
  const localCount = useSyncExternalStore(subscribeToLibrary, getCartCount, () => 0);
  const [serverCount, setServerCount] = useState<number | null>(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    function handleChange() {
      setRefresh((value) => value + 1);
    }
    window.addEventListener(LIBRARY_EVENT, handleChange);
    return () => window.removeEventListener(LIBRARY_EVENT, handleChange);
  }, []);

  useEffect(() => {
    let active = true;

    fetch("/api/cart")
      .then((response) => response.json())
      .then((payload: { success?: boolean; data?: { count?: number } }) => {
        if (active) setServerCount(payload.success ? (payload.data?.count ?? 0) : null);
      })
      .catch(() => {
        if (active) setServerCount(null);
      });

    return () => {
      active = false;
    };
  }, [refresh, localCount]);

  return serverCount ?? localCount;
}
