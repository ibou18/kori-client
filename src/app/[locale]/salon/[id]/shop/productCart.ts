"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { CartItem } from "./types";

/**
 * Panier boutique d'un salon, partagé entre la page salon, la fiche produit et le
 * parcours de réservation. Stocké en sessionStorage (un panier par salon et par
 * onglet du navigateur) : rien n'est réservé côté serveur avant le paiement, le prix
 * et le stock sont revérifiés à la réservation / commande.
 */

export const CART_MAX_QUANTITY = 20;
const STORAGE_PREFIX = "kori-cart:";
const CHANGE_EVENT = "kori-cart-change";
const EMPTY: CartItem[] = [];

// ---------------------------------------------------------------------------
// Fonctions pures (testées)
// ---------------------------------------------------------------------------

export function addToCart(items: CartItem[], item: Omit<CartItem, "quantity">, quantity = 1): CartItem[] {
  const existing = items.find((i) => i.productId === item.productId);
  if (existing) {
    return setCartQuantity(items, item.productId, existing.quantity + quantity);
  }
  return [...items, { ...item, quantity: clampQuantity(quantity) }];
}

export function setCartQuantity(items: CartItem[], productId: string, quantity: number): CartItem[] {
  if (quantity <= 0) return removeFromCart(items, productId);
  return items.map((i) => (i.productId === productId ? { ...i, quantity: clampQuantity(quantity) } : i));
}

export function removeFromCart(items: CartItem[], productId: string): CartItem[] {
  return items.filter((i) => i.productId !== productId);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export function cartTotalCents(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);
}

/** Charge utile serveur : `[{ productId, quantity }]`. */
export function cartToOrderItems(items: CartItem[]): { productId: string; quantity: number }[] {
  return items.map(({ productId, quantity }) => ({ productId, quantity }));
}

function clampQuantity(quantity: number): number {
  return Math.max(1, Math.min(CART_MAX_QUANTITY, Math.floor(quantity)));
}

/** Lecture tolérante : un contenu corrompu donne un panier vide. */
export function parseCart(raw: string | null): CartItem[] {
  if (!raw) return EMPTY;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    return parsed.filter(
      (i): i is CartItem =>
        !!i &&
        typeof i.productId === "string" &&
        typeof i.name === "string" &&
        Number.isInteger(i.priceCents) &&
        Number.isInteger(i.quantity) &&
        i.quantity > 0,
    );
  } catch {
    return EMPTY;
  }
}

// ---------------------------------------------------------------------------
// Stockage + hook
// ---------------------------------------------------------------------------

const snapshots = new Map<string, { raw: string | null; items: CartItem[] }>();

function storageKey(salonId: string) {
  return `${STORAGE_PREFIX}${salonId}`;
}

function readCart(salonId: string): CartItem[] {
  let raw: string | null = null;
  try {
    raw = window.sessionStorage.getItem(storageKey(salonId));
  } catch {
    raw = null;
  }
  // Snapshot stable tant que le contenu ne change pas (exigé par useSyncExternalStore).
  const cached = snapshots.get(salonId);
  if (cached && cached.raw === raw) return cached.items;
  const items = parseCart(raw);
  snapshots.set(salonId, { raw, items });
  return items;
}

function writeCart(salonId: string, items: CartItem[]) {
  try {
    if (items.length === 0) window.sessionStorage.removeItem(storageKey(salonId));
    else window.sessionStorage.setItem(storageKey(salonId), JSON.stringify(items));
  } catch {
    // Navigation privée / stockage bloqué : le panier reste en mémoire de la page.
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: salonId }));
}

function subscribe(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function useProductCart(salonId: string) {
  const items = useSyncExternalStore(
    subscribe,
    () => readCart(salonId),
    () => EMPTY,
  );

  const update = useCallback(
    (fn: (current: CartItem[]) => CartItem[]) => writeCart(salonId, fn(readCart(salonId))),
    [salonId],
  );

  return {
    items,
    count: cartCount(items),
    totalCents: cartTotalCents(items),
    has: (productId: string) => items.some((i) => i.productId === productId),
    add: (item: Omit<CartItem, "quantity">, quantity = 1) => update((c) => addToCart(c, item, quantity)),
    setQuantity: (productId: string, quantity: number) => update((c) => setCartQuantity(c, productId, quantity)),
    remove: (productId: string) => update((c) => removeFromCart(c, productId)),
    clear: () => update(() => EMPTY),
  };
}
