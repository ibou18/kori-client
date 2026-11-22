/** Produit tel que renvoyé par GET /salons/:id/products/manage (kori-server docs/PRODUCT_SALES.md). */
export interface AdminProduct {
  id: string;
  name: string;
  category: string | null;
  size: string | null;
  description: string | null;
  tip: string | null;
  priceCents: number;
  stockQuantity: number | null;
  isActive: boolean;
  inStock: boolean;
  order: number;
  mainPhotoUrl: string | null;
  photos: { id: string; url: string; isMain: boolean }[];
  recommendedServices: { id: string; name: string }[];
}

/** Corps de POST /salons/:id/products et PUT /products/:id. */
export interface ProductPayload {
  name: string;
  priceCents: number;
  category: string | null;
  size: string | null;
  description: string | null;
  tip: string | null;
  stockQuantity: number | null;
  isActive: boolean;
  recommendedServiceIds: string[];
}

export type ProductOrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "READY_FOR_PICKUP"
  | "PICKED_UP"
  | "CANCELLED"
  | "REFUNDED";

export interface AdminProductOrder {
  id: string;
  status: ProductOrderStatus;
  fulfillmentMode: "WITH_BOOKING" | "PICKUP";
  subtotalCents: number;
  commissionCents: number;
  salonAmountCents: number;
  clientNotes: string | null;
  createdAt: string;
  paidAt: string | null;
  client: { firstName: string | null; lastName: string | null; phone: string | null; email: string | null };
  booking: { id: string; appointmentStartDateTime: string; status: string } | null;
  items: { id: string; productName: string; productImageUrl: string | null; quantity: number; lineTotalCents: number }[];
}
