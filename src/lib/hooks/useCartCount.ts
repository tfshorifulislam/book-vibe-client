"use client";

import { useSyncExternalStore } from "react";
import {
  getCartCount,
  subscribeToLibrary,
} from "@/lib/client/guest-library";

export function useCartCount(): number {
  return useSyncExternalStore(subscribeToLibrary, getCartCount, () => 0);
}
