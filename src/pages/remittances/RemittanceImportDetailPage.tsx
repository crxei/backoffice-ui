import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
} from "lucide-react";
import {
  useImport,
  useImportLines,
  useApproveImport,
  useMarkExported,
  useMarkPaid,
  useDeleteImport,
} from "../../hooks/useRemittances";
import { PageHeader } from "../../components/shared/PageHeader";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { DataTable, type Column } from "../../components/shared/DataTable";
import { PageLoader } from "../../components/shared/LoadingSpinner";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { toast } from "../../components/shared/Toast";
import { type RemittanceLine } from "../../data/remittance";

const importStatusMap: Record<string, string> = {
  PROCESSING: "in_progress",
  RECONCILIATION_FAILED: "failed",
  MISSING_RATES: "missing",
  READY_FOR_REVIEW: "pending_approval",
  APPROVED: "approved",
  EXPORTED: "completed",
  PAID: "paid",
};

export function RemittanceImportDetailPage() {
  const { importId } = useParams<{ importId: string }>();
  const navigate = useNavigate();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { data: imp, isLoading } = useImport(importId!);
  const { data: lines, isLoading: linesLoading } = useImportLines(importId!);
  const { mutate: approve, isPending: approving } = useApproveImport();
  const { mutate: exported, isPending: exporting } = useMarkExported();
  const { mutate: paid, isPending: paying } = useMarkPaid();
  const { mutate: removeImport, isPending: deleting } = useDeleteImport();

  if (isLoading) return <PageLoader />;
  if (!imp) return <div className="text-gray-500 p-6">Import not found.</div>;

  const { summary } = imp;

  const lineColumns: Column<Record<string, unknown>>[] = [
    { key: "tcn", header: "TCN", sortable: true },
    { key: "patientName", header: "Patient", sortable: true },
    { key: "serviceProviderName", header: "Provider" },
    { key: "serviceCode", header: "Code" },
    {
      key: "dateOfService",
      header: "DOS",
      sortable: true,
      render: (r) => {
        const dos = (r as unknown as RemittanceLine).dateOfService;
        return dos ? format(parseISO(dos), "MM/dd/yy") : "—";
      },
    },
    { key: "units", header: "Units", sortable: true },
    {
      key: "amountBilled",
      header: "Billed",
      render: (r) => {
        const val = (r as unknown as RemittanceLine).amountBilled;
        return val != null ? `$${Number(val).toLocaleString()}` : "—";
      },
    },
    {
      key: "amountPaid",
      header: "Paid",
      render: (r) => {
        const val = (r as unknown as RemittanceLine).amountPaid;
        return val != null ? `$${Number(val).toLocaleString()}` : "—";
      },
    },
    {
      key: "status",
      header: "Status",
      render: (r) => {
        const l = r as unknown as RemittanceLine;
        return <StatusBadge status={l.status === "PAID" ? "paid" : "denied"} />;
      },
    },
    {
      key: "eobReason",
      header: "Denial Reason",
      render: (r) => {
        const l = r as unknown as RemittanceLine;
        return (
          <span className="text-xs text-gray-500">{l.eobReason ?? "—"}</span>
        );
      },
    },
  ];

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={() => navigate("/remittances/imports")}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="h-4 w-4" /> All Imports
        </button>
      </div>

      <PageHeader
        title={imp.filename}
        description={`Imported ${format(parseISO(imp.createdAt), "MMMM d, yyyy")}${imp.notes ? ` · ${imp.notes}` : ""}`}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge
              status={importStatusMap[imp.status] ?? imp.status.toLowerCase()}
            />
            {imp.status === "READY_FOR_REVIEW" && (
              <button
                onClick={() => approve(imp.id)}
                disabled={approving || !summary.passedAmountPaid}
                className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {approving ? "Approving…" : "Approve Import"}
              </button>
            )}
            {imp.status === "APPROVED" && (
              <button
                onClick={() => exported(imp.id)}
                disabled={exporting}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {exporting ? "Marking…" : "Mark Exported"}
              </button>
            )}
            {imp.status === "EXPORTED" && (
              <button
                onClick={() => paid(imp.id)}
                disabled={paying}
                className="px-3 py-1.5 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
              >
                {paying ? "Marking…" : "Mark Paid"}
              </button>
            )}
            <button
              onClick={() => setIsDeleteOpen(true)}
              disabled={deleting}
              className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Delete Import"}
            </button>
          </div>
        }
      />
      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Delete remittance import"
        description="This will permanently remove the remittance import and its associated records. This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={deleting}
        onConfirm={() => {
          removeImport(imp.id, {
            onSuccess: () => {
              setIsDeleteOpen(false)
              toast('success', 'Import deleted', 'The remittance import has been removed.')
              navigate('/remittances/imports')
            },
            onError: () => {
              setIsDeleteOpen(false)
              toast('error', 'Delete failed', 'Could not delete the remittance import.')
            },
          })
        }}
        onCancel={() => setIsDeleteOpen(false)}
      />

      {/* Warnings */}
      {!summary.passedAmountBilled && summary.passedAmountPaid && (
        <div className="mb-4 flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          Payment reconciliation passed. Billed amount does not match the PDF
          total, likely due to duplicated denied remark rows. Provider invoices
          use paid rows only.
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        {[
          { label: "Total Rows", value: summary.totalRows },
          { label: "Paid", value: summary.paidRows },
          { label: "Denied", value: summary.deniedRows },
          { label: "Payable", value: summary.payableRows },
          {
            label: "Expected",
            value: `$${summary.expectedClaimPaymentAmount.toLocaleString()}`,
          },
          {
            label: "Extracted",
            value: `$${summary.extractedAmountPaid.toLocaleString()}`,
          },
          {
            label: "Reconciliation",
            value: summary.passedAmountPaid ? "Passed" : "Failed",
            color: summary.passedAmountPaid ? "text-green-700" : "text-red-700",
            icon: summary.passedAmountPaid ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            ),
          },
        ].map(({ label, value, color, icon }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-gray-200 p-4"
          >
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <div className="flex items-center gap-1.5">
              {icon}
              <p className={`text-lg font-bold ${color ?? "text-gray-900"}`}>
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Actions bar */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          to={`/remittances/imports/${imp.id}/provider-summary`}
          className="px-4 py-2 text-sm font-medium rounded-lg transition-colors bg-blue-600 text-white hover:bg-blue-700"
        >
          Provider Summary & Invoices
        </Link>
      </div>

      {/* Lines table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Remittance Lines</h3>
        </div>
        <div className="p-5">
          {linesLoading ? (
            <div className="text-sm text-gray-500">Loading lines…</div>
          ) : (
            <DataTable
              columns={lineColumns}
              data={(lines ?? []).map((l) => ({ ...l } as unknown as Record<string, unknown>))}
              searchable
              searchPlaceholder="Search lines…"
            />
          )}
        </div>
      </div>
    </div>
  );
}
