/* eslint-disable @typescript-eslint/no-explicit-any */
import { createObjectCsvWriter } from "csv-writer";
import path from "path";

const tpsRate = 0.05; // TPS 5%
const tvqRate = 0.09975; // TVQ 9.975%

export async function generateInvoicesCSV(invoices: any) {
  try {
    const filePath = path.join(process.cwd(), "invoices_paid.csv");
    // Récupérer toutes les factures payées

    // Configurer le writer CSV
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: "id", title: "ID" },
        { id: "clientName", title: "Client Name" },
        { id: "totalCost", title: "Total Cost" },
        { id: "tps", title: "TPS" },
        { id: "tvq", title: "TVQ" },
        { id: "totalWithTaxes", title: "Total with Taxes" },
        { id: "createdAt", title: "Created At" },
        { id: "updatedAt", title: "Updated At" },
      ],
    });

    // Préparer les données pour le CSV
    const records = invoices.map((invoice: any) => {
      const tps = invoice.totalCost * tpsRate;
      const tvq = invoice.totalCost * tvqRate;
      const totalWithTaxes = invoice.totalCost + tps + tvq;
      return {
        id: invoice.id,
        clientName: `${invoice.client.firstName} ${invoice.client.lastName}`,
        totalCost: invoice.totalCost.toFixed(2),
        tps: tps.toFixed(2),
        tvq: tvq.toFixed(2),
        totalWithTaxes: totalWithTaxes.toFixed(2),
        createdAt: invoice.createdAt.toISOString(),
        updatedAt: invoice.updatedAt.toISOString(),
      };
    });

    // Écrire les données dans le fichier CSV
    await csvWriter.writeRecords(records);

    console.log("CSV file generated successfully.");
  } catch (error) {
    console.error("Error generating CSV file:", error);
  }
}
