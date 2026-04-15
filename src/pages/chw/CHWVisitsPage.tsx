import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { useEncounters, useEscalateEncounter } from "../../hooks/useEncounters";
import { usePatients } from "../../hooks/usePatients";
import { PageHeader } from "../../components/shared/PageHeader";
import { DataTable, type Column } from "../../components/shared/DataTable";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { PageLoader } from "../../components/shared/LoadingSpinner";
import { toast } from "../../components/shared/Toast";
import { type Encounter } from "../../data/encounters";

export function CHWVisitsPage() {
  const navigate = useNavigate();
  const { data: encounters, isLoading } = useEncounters();
  const { data: patients } = usePatients();
  const escalateMutation = useEscalateEncounter();
  const [chwFilter, setChwFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  if (isLoading) return <PageLoader />;

  const getPatientName = (id: string) => {
    const p = (patients ?? []).find((x) => x.id === id);
    return p ? `${p.firstName} ${p.lastName}` : id;
  };

  const chwNames = [
    ...new Set((encounters ?? []).map((e) => e.chwName)),
  ].sort();

  const filtered = (encounters ?? []).filter((e) => {
    if (chwFilter && e.chwName !== chwFilter) return false;
    if (statusFilter && e.status !== statusFilter) return false;
    return true;
  });

  const handleEscalate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await escalateMutation.mutateAsync(id);
      toast("success", "Escalation Created", "Supervisor has been notified");
    } catch {
      toast("error", "Escalation Failed");
    }
  };

  const columns: Column<Record<string, unknown>>[] = [
    { key: "id", header: "ID", sortable: true },
    {
      key: "patient",
      header: "Patient",
      render: (r) => (
        <span className="font-medium">
          {getPatientName((r as unknown as Encounter).patientId)}
        </span>
      ),
    },
    { key: "chwName", header: "CSW", sortable: true },
    {
      key: "scheduledDate",
      header: "Date",
      sortable: true,
      render: (r) =>
        format(
          parseISO((r as unknown as Encounter).scheduledDate),
          "MMM d, yyyy",
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <StatusBadge status={(r as unknown as Encounter).status} />
      ),
    },
    {
      key: "checkInTime",
      header: "Check-In",
      render: (r) => (r as unknown as Encounter).checkInTime ?? "—",
    },
    {
      key: "checkOutTime",
      header: "Check-Out",
      render: (r) => (r as unknown as Encounter).checkOutTime ?? "—",
    },
    {
      key: "flags",
      header: "Flags",
      render: (r) => {
        const enc = r as unknown as Encounter;
        return enc.flags.length > 0 ? (
          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
            {enc.flags.length} flag{enc.flags.length > 1 ? "s" : ""}
          </span>
        ) : (
          <span className="text-gray-400 text-xs">None</span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (r) => {
        const enc = r as unknown as Encounter;
        return (
          <div className="flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/chw-visits/${enc.id}`);
              }}
              className="text-xs text-blue-600 border border-blue-200 px-2 py-1 rounded hover:bg-blue-50"
            >
              View
            </button>
            {(enc.status === "missed" || enc.status === "in_progress") &&
              (enc as { status: string }).status !== "escalated" && (
                <button
                  onClick={(e) => handleEscalate(enc.id, e)}
                  className="text-xs text-red-600 border border-red-200 px-2 py-1 rounded hover:bg-red-50"
                >
                  Escalate
                </button>
              )}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="CSW Field Visits"
        description={`${(encounters ?? []).length} encounters`}
      />
      <DataTable
        columns={columns}
        data={filtered.map(
          (e) => ({ ...e }) as unknown as Record<string, unknown>,
        )}
        searchable
        searchPlaceholder="Search encounters..."
        onRowClick={(r) =>
          navigate(`/chw-visits/${(r as unknown as Encounter).id}`)
        }
        extraFilters={
          <div className="flex gap-2">
            <select
              value={chwFilter}
              onChange={(e) => setChwFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All CSWs</option>
              {chwNames.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              {[
                "scheduled",
                "in_progress",
                "completed",
                "missed",
                "escalated",
              ].map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
        }
      />
    </div>
  );
}
