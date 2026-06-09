import { useQuery, useMutation } from "@tanstack/react-query";
import {
  fetchInvoicePreview,
  downloadInvoicePdf,
  downloadInvoiceCsv,
  downloadSummaryExcel,
  exportAllInvoices,
  type InvoiceParams,
} from "../api/providerInvoices";

export function useInvoicePreview(params: InvoiceParams) {
  return useQuery({
    queryKey: ["invoice-preview", params],
    queryFn: () => fetchInvoicePreview(params),
    enabled: !!(
      params.importId &&
      params.serviceProviderId &&
      params.paymentDate &&
      params.paidOnDate
    ),
  });
}

function triggerDownload(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

export function useDownloadInvoicePdf() {
  return useMutation({
    mutationFn: (params: InvoiceParams) => downloadInvoicePdf(params),
    onSuccess: (blob, params) =>
      triggerDownload(blob, `provider-invoice-${params.serviceProviderId}.pdf`),
  });
}

export function useDownloadInvoiceCsv() {
  return useMutation({
    mutationFn: (params: InvoiceParams) => downloadInvoiceCsv(params),
    onSuccess: (blob, params) =>
      triggerDownload(blob, `provider-invoice-${params.serviceProviderId}.csv`),
  });
}

export function useDownloadSummaryExcel() {
  return useMutation({
    mutationFn: (importId: string) => downloadSummaryExcel(importId),
    onSuccess: (blob, importId) =>
      triggerDownload(blob, `provider-summary-${importId}.xlsx`),
  });
}

export function useExportAllInvoices() {
  return useMutation({
    mutationFn: (importId: string) => exportAllInvoices(importId),
  });
}
