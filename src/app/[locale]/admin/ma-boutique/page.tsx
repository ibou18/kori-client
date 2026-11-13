"use client";

import PageWrapper from "@/app/components/block/PageWrapper";
import { useGetSalonServices } from "@/app/data/hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Edit2, ExternalLink, Loader2, Package, Plus, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { OrdersPanel } from "./OrdersPanel";
import { ProductFormDialog } from "./ProductFormDialog";
import type { AdminProduct } from "./types";
import { useAdminProductOrders, useAdminProducts, useProductMutations } from "./useShopAdmin";

const cad = (cents: number) =>
  new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD" }).format(cents / 100);

/**
 * Espace pro — Ma boutique (kori-server docs/PRODUCT_SALES.md) : catalogue de
 * produits vendus sur la page du salon, et suivi des commandes à préparer.
 * Les ventes ne sont visibles des clients que si Stripe Connect encaisse.
 */
export default function MaBoutiquePage() {
  const { data: session } = useSession();
  const params = useParams();
  const locale = (params.locale as string) || "fr";
  const salonId = (session?.user as { salonId?: string } | undefined)?.salonId ?? "";

  const { data, isLoading } = useAdminProducts(salonId);
  const { data: toPrepare = [] } = useAdminProductOrders(salonId, "PAID");
  const { data: servicesRes } = useGetSalonServices(salonId);
  const { remove } = useProductMutations(salonId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<AdminProduct | null>(null);

  const products = data?.products ?? [];
  const editing = products.find((p) => p.id === editingId) ?? null;
  const services = useMemo(() => {
    const raw = (servicesRes as { data?: unknown } | null)?.data;
    return (Array.isArray(raw) ? raw : [])
      .filter((s: { isActive?: boolean }) => s.isActive !== false)
      .map((s: { id: string; name: string }) => ({ id: s.id, name: s.name }));
  }, [servicesRes]);

  const openCreate = () => {
    setEditingId(null);
    setDialogOpen(true);
  };
  const openEdit = (id: string) => {
    setEditingId(id);
    setDialogOpen(true);
  };

  if (!salonId) {
    return (
      <PageWrapper title="Ma boutique">
        <p className="text-sm text-muted-foreground">Aucun salon associé à votre compte.</p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Ma boutique"
      description="Vendez vos produits sur votre page korí : vos clients les paient en ligne et les récupèrent au salon."
      actions={
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/${locale}/salon/${salonId}#boutique`} target="_blank">
              <ExternalLink className="mr-2 size-4" />
              Voir ma boutique
            </Link>
          </Button>
          <Button onClick={openCreate}>
            <Plus className="mr-2 size-4" />
            Ajouter un produit
          </Button>
        </div>
      }
    >
      {data && !data.salesEnabled && (
        <div className="mb-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" />
          <div className="flex flex-col gap-1">
            <p className="font-semibold">Votre boutique n&apos;est pas encore visible par vos clients</p>
            <p>
              Les produits sont payés en ligne et versés sur votre compte : finalisez la configuration de vos paiements
              (Stripe Connect) depuis l&apos;app korí, onglet Profil → Paiements. Vous pouvez déjà préparer votre
              catalogue ici.
            </p>
          </div>
        </div>
      )}

      <Tabs defaultValue="produits">
        <TabsList>
          <TabsTrigger value="produits">Produits ({products.length})</TabsTrigger>
          <TabsTrigger value="commandes">
            Commandes
            {toPrepare.length > 0 && (
              <Badge variant="warning" className="ml-2 px-1.5 py-0">
                {toPrepare.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="produits" className="mt-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-14 text-center">
              <Package className="size-8 text-muted-foreground" />
              <div>
                <p className="font-medium">Aucun produit pour le moment</p>
                <p className="text-sm text-muted-foreground">
                  Shampoing, huile, bonnet en satin… ajoutez les produits que vous utilisez au salon.
                </p>
              </div>
              <Button onClick={openCreate}>
                <Plus className="mr-2 size-4" />
                Ajouter un produit
              </Button>
            </div>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <li key={product.id} className="flex gap-3 rounded-xl border p-3">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {product.mainPhotoUrl ? (
                      <Image src={product.mainPhotoUrl} alt="" fill sizes="80px" className="object-cover" />
                    ) : (
                      <Package className="absolute inset-0 m-auto size-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p className="truncate font-semibold">{product.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {[product.category, product.size].filter(Boolean).join(" · ") || "—"}
                    </p>
                    <p className="text-sm font-semibold tabular-nums">{cad(product.priceCents)}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {!product.isActive ? (
                        <Badge variant="outline">Retiré de la vente</Badge>
                      ) : !product.inStock ? (
                        <Badge variant="destructive">Rupture</Badge>
                      ) : (
                        <Badge variant="success">En vente</Badge>
                      )}
                      {product.stockQuantity !== null && (
                        <Badge variant="secondary">Stock : {product.stockQuantity}</Badge>
                      )}
                      {product.photos.length === 0 && <Badge variant="warning">Sans photo</Badge>}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    <Button size="icon" variant="ghost" aria-label={`Modifier ${product.name}`} onClick={() => openEdit(product.id)}>
                      <Edit2 className="size-4" />
                    </Button>
                    <Button size="icon" variant="ghost" aria-label={`Supprimer ${product.name}`} onClick={() => setDeleting(product)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="commandes" className="mt-4">
          <OrdersPanel salonId={salonId} />
        </TabsContent>
      </Tabs>

      <ProductFormDialog
        salonId={salonId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editing}
        services={services}
        onCreated={setEditingId}
      />

      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer « {deleting?.name} » ?</DialogTitle>
            <DialogDescription>
              S&apos;il a déjà été commandé, il est seulement retiré de la vente : l&apos;historique des commandes est
              conservé et vous pourrez le remettre en vente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              disabled={remove.isPending}
              onClick={() => deleting && remove.mutate(deleting.id, { onSettled: () => setDeleting(null) })}
            >
              {remove.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
