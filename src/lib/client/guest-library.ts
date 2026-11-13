const WISHLIST_KEY = "bookhand:wishlist";
const CART_KEY = "bookhand:cart";
export const LIBRARY_EVENT = "bookhand:library-updated";

export interface GuestCartItem {
  bookId: string;
  quantity: number;
}

export function subscribeToLibrary(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  window.addEventListener(LIBRARY_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(LIBRARY_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event(LIBRARY_EVENT));
  } catch {
    // Storage can be unavailable in private browsing; fail quietly.
  }
}

export function getWishlist(): string[] {
  return readJson<string[]>(WISHLIST_KEY, []);
}

export function isWishlisted(bookId: string): boolean {
  return getWishlist().includes(bookId);
}

export function setWishlisted(bookId: string, value: boolean): void {
  const wishlist = getWishlist();
  const has = wishlist.includes(bookId);
  if (has === value) return;
  writeJson(
    WISHLIST_KEY,
    value ? [...wishlist, bookId] : wishlist.filter((id) => id !== bookId),
  );
}

export function toggleWishlist(bookId: string): boolean {
  const wishlist = getWishlist();
  const next = wishlist.includes(bookId)
    ? wishlist.filter((id) => id !== bookId)
    : [...wishlist, bookId];

  writeJson(WISHLIST_KEY, next);
  return next.includes(bookId);
}

export function notifyLibraryChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(LIBRARY_EVENT));
}

export function getCart(): GuestCartItem[] {
  return readJson<GuestCartItem[]>(CART_KEY, []);
}

export function getCartCount(): number {
  return getCart().reduce((total, item) => total + item.quantity, 0);
}

export function addToCart(bookId: string): void {
  const cart = getCart();
  const existing = cart.find((item) => item.bookId === bookId);

  const next = existing
    ? cart.map((item) =>
        item.bookId === bookId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      )
    : [...cart, { bookId, quantity: 1 }];

  writeJson(CART_KEY, next);
}
