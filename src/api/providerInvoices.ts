import { type ProviderInvoicePreview } from "../data/providerInvoices";
import {
  middlewareGet,
  middlewarePost,
  middlewareDownload,
} from "./middlewareClient";

export interface InvoiceParams {
  importId: string;
  serviceProviderId: string;
  paymentDate: string;
  paidOnDate: string;
}

function invoiceQuery(params: InvoiceParams): string {
  return new URLSearchParams(
    params as unknown as Record<string, string>,
  ).toString();
}

export async function fetchInvoicePreview(
  params: InvoiceParams,
): Promise<ProviderInvoicePreview> {
  return middlewareGet<ProviderInvoicePreview>(
    `/api/provider-invoices/preview?${invoiceQuery(params)}`,
  );
}

export async function downloadInvoicePdf(params: InvoiceParams): Promise<Blob> {
  return middlewareDownload(
    `/api/invoices/export.pdf?serviceProviderId=${params.serviceProviderId}`,
  );
}

export async function downloadInvoiceCsv(params: InvoiceParams): Promise<Blob> {
  return middlewareDownload(
    `/api/provider-invoices/export.csv?${invoiceQuery(params)}`,
  );
}

export async function downloadSummaryExcel(importId: string): Promise<Blob> {
  return middlewareDownload(
    `/api/invoices/export.excel?importId=${encodeURIComponent(importId)}`,
  );
}

export async function exportAllInvoices(
  importId: string,
): Promise<{ jobId: string; status: "QUEUED" }> {
  return middlewarePost<{ jobId: string; status: "QUEUED" }>(
    `/api/imports/${importId}/provider-invoices/export-all`,
    {},
  );
}
