/** Boutique publique d'un salon — `GET /salons/:id/products`, `GET /products/:id` (kori-server docs/PRODUCT_SALES.md). */

export interface PublicProductPhoto {
  id: string;
  url: string;
  alt?: string | null;
}

export interface PublicProduct {
  id: string;
  salonId: string;
  name: string;
  category?: string | null;
  size?: string | null;
  description?: string | null;
  /** Conseil du pro (« Le conseil de … »). */
  tip?: string | null;
  /** Prix TTC en centimes (fait foi) ; `price` = même montant en dollars. */
  priceCents: number;
  price: number;
  stockQuantity: number | null;
  inStock: boolean;
  mainPhotoUrl: string | null;
  photos: PublicProductPhoto[];
  /** Prestations avec lesquelles le produit est suggéré (« Souvent pris avec … »). */
  recommendedServices: { id: string; name: string }[];
}

export interface PublicProductDetail extends PublicProduct {
  salon: { id: string; name: string; ownerFirstName: string | null };
}

export interface SalonProductsPayload {
  /** false = pas de Stripe Connect : la boutique n'est pas affichée. */
  salesEnabled: boolean;
  products: PublicProduct[];
}

/** Ligne du panier (snapshot d'affichage ; prix et stock revérifiés par le serveur). */
export interface CartItem {
  productId: string;
  quantity: number;
  name: string;
  priceCents: number;
  imageUrl: string | null;
}
