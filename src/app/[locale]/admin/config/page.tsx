"use client";

import PageWrapper from "@/app/components/block/PageWrapper";
import {
  useClearConfigCache,
  useGetConfigsByCategory,
  useInitializeConfigs,
  useUpdateConfig,
} from "@/app/data/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSession } from "next-auth/react";
import { RefreshCw, Settings, Trash2 } from "lucide-react";
import { useState } from "react";

const CATEGORIES = [
  {
    id: "support",
    label: "Support",
    description: "Téléphone WhatsApp et email du support Kori",
  },
  {
    id: "app_version",
    label: "Versions app",
    description: "Versions Android / iOS et minimales supportées",
  },
  {
    id: "maintenance",
    label: "Maintenance",
    description: "Mode maintenance et message",
  },
] as const;

type ConfigItem = {
  key: string;
  value: string;
  type?: string;
  description?: string | null;
  updatedAt?: string;
};

function ConfigCategoryCard({
  categoryId,
  categoryLabel,
  categoryDescription,
  onEdit,
}: {
  categoryId: string;
  categoryLabel: string;
  categoryDescription: string;
  onEdit: (item: ConfigItem) => void;
}) {
  const { data: configs, isLoading } = useGetConfigsByCategory(categoryId);
  const list = Array.isArray(configs) ? configs : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings className="h-5 w-5" />
          {categoryLabel}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{categoryDescription}</p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : list.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            Aucune configuration dans cette catégorie.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Clé</TableHead>
                <TableHead>Valeur</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((item: ConfigItem) => (
                <TableRow key={item.key}>
                  <TableCell>
                    <div>
                      <span className="font-medium">{item.key}</span>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm break-all">
                      {item.value || (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(item)}
                      className="h-8"
                    >
                      Modifier
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

export default function ConfigPage() {
  const { data: session } = useSession();
  const [editingItem, setEditingItem] = useState<ConfigItem | null>(null);
  const [editValue, setEditValue] = useState("");

  const { mutate: updateConfig, isPending: isUpdating } = useUpdateConfig();
  const { mutate: initializeConfigs, isPending: isInitializing } =
    useInitializeConfigs();
  const { mutate: clearCache, isPending: isClearing } = useClearConfigCache();

  const handleEdit = (item: ConfigItem) => {
    setEditingItem(item);
    setEditValue(item.value ?? "");
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;
    updateConfig(
      { key: editingItem.key, value: editValue },
      {
        onSuccess: () => {
          setEditingItem(null);
          setEditValue("");
        },
      },
    );
  };

  if (!session) {
    return (
      <PageWrapper title="Configuration">
        <p className="text-center text-muted-foreground py-10">
          Connexion requise pour accéder à cette page.
        </p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Configuration"
      description="Gérer les configurations de l'application (versions, maintenance, support)."
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => initializeConfigs()}
            disabled={isInitializing}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {isInitializing ? "Initialisation..." : "Initialiser les configs"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => clearCache()}
            disabled={isClearing}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {isClearing ? "Vidage..." : "Vider le cache"}
          </Button>
        </div>
      }
    >
      <div className="space-y-6 max-w-4xl">
        {CATEGORIES.map((cat) => (
          <ConfigCategoryCard
            key={cat.id}
            categoryId={cat.id}
            categoryLabel={cat.label}
            categoryDescription={cat.description}
            onEdit={handleEdit}
          />
        ))}
      </div>

      <Dialog
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier la configuration</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <>
              <div className="space-y-2">
                <Label>{editingItem.key}</Label>
                {editingItem.description && (
                  <p className="text-xs text-muted-foreground">
                    {editingItem.description}
                  </p>
                )}
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder="Valeur"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingItem(null)}>
                  Annuler
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={isUpdating || editValue === editingItem.value}
                >
                  {isUpdating ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
