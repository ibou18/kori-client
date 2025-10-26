"use client";

import { Suspense } from "react";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, PlusIcon } from "lucide-react";
import { useSession } from "next-auth/react";

import Link from "next/link";
import ButtonExport from "@/app/components/ButtonExport";
import { useGetInvoices } from "@/app/data/hooksHop";
import { InvoiceList } from "@/app/components/InvoiceList";

export default function InvoicesPage() {
  const { data: session }: any = useSession();

  const { data, isLoading } = useGetInvoices();

  if (isLoading) {
    return <Loader2 className="mt-10 mx-auto animate-spin text-yellow-600" />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="sm:flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">
              Factures - ({data?.pagination.total})
            </CardTitle>
            <CardDescription>Gérer Mes factures ici</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <div className="sm:flex items-center space-x-2">
              <Link href="/admin/invoices/create" className={buttonVariants()}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Créer une factures
              </Link>
            </div>

            <div className="flex sm:justify-end">
              <ButtonExport userId={session?.user?.id} endpoint={"invoices"} />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<Skeleton className="w-full h-[500px]" />}>
          <InvoiceList data={data} />
        </Suspense>
      </CardContent>
    </Card>
  );
}
