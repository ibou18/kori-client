import { describe, expect, it } from "vitest";
import {
  addToCart,
  cartCount,
  cartToOrderItems,
  cartTotalCents,
  CART_MAX_QUANTITY,
  parseCart,
  removeFromCart,
  setCartQuantity,
} from "./productCart";
import type { CartItem } from "./types";

const huile = { productId: "p1", name: "Huile", priceCents: 2400, imageUrl: null };
const bonnet = { productId: "p2", name: "Bonnet", priceCents: 1800, imageUrl: null };

describe("panier boutique", () => {
  it("ajoute puis cumule la quantité d'un même produit", () => {
    let items: CartItem[] = [];
    items = addToCart(items, huile);
    items = addToCart(items, huile, 2);
    items = addToCart(items, bonnet);
    expect(items).toHaveLength(2);
    expect(items[0].quantity).toBe(3);
    expect(cartCount(items)).toBe(4);
    expect(cartTotalCents(items)).toBe(3 * 2400 + 1800);
  });

  it("borne la quantité et retire à zéro", () => {
    let items = addToCart([], huile, 50);
    expect(items[0].quantity).toBe(CART_MAX_QUANTITY);
    items = setCartQuantity(items, "p1", 0);
    expect(items).toEqual([]);
  });

  it("retire un produit", () => {
    const items = removeFromCart(addToCart(addToCart([], huile), bonnet), "p1");
    expect(items.map((i) => i.productId)).toEqual(["p2"]);
  });

  it("produit la charge utile serveur", () => {
    expect(cartToOrderItems(addToCart([], huile, 2))).toEqual([{ productId: "p1", quantity: 2 }]);
  });

  it("ignore un stockage corrompu", () => {
    expect(parseCart("pas du json")).toEqual([]);
    expect(parseCart(JSON.stringify([{ productId: "p1", quantity: 1 }]))).toEqual([]);
    expect(parseCart(JSON.stringify([{ ...huile, quantity: 1 }]))).toHaveLength(1);
  });
});
