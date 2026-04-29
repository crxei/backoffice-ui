import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import {
  AlertTriangle,
  DollarSign,
  Activity,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { useCareGaps, useResolveCareGap } from "../../hooks/useCareGaps";
import { StatCard } from "../../components/shared/StatCard";
import { PageHeader } from "../../components/shared/PageHeader";
import { PageLoader } from "../../components/shared/LoadingSpinner";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { toast } from "../../components/shared/Toast";
import type { CareGapListItem } from "../../data/careGaps";

type TeamFilter = "all" | "pac" | "chw" | "doctor";

const teamColors: Record<string, string> = {
  pac: "bg-blue-100 text-blue-700",
  chw: "bg-teal-100 text-teal-700",
  doctor: "bg-purple-100 text-purple-700",
};

const teamLabels: Record<string, string> = {
  pac: "PAC",
  chw: "CSW",
  doctor: "Doctor",
};

const priorityDot: Record<string, string> = {
  stat: "bg-red-500",
  urgent: "bg-orange-400",
  asap: "bg-yellow-400",
  routine: "bg-gray-300",
};

const priorityOrder: Record<string, number> = {
  stat: 0,
  urgent: 1,
  asap: 2,
  routine: 3,
};

// Extract just the activity name from the full description ("Name — details…")
const activityLabel = (desc: string) => desc.split(" — ")[0];

export function CareGapsPage() {
  const navigate = useNavigate();
  const { data: gaps, isLoading } = useCareGaps();
  const resolveMutation = useResolveCareGap();

  const [teamFilter, setTeamFilter] = useState<TeamFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  if (isLoading) return <PageLoader />;

  const all = gaps ?? [];

  const overdueCount = all.filter((g) => g.daysOverdue > 0).length;
  const urgentCount = all.filter((g) => g.priority === "stat" || g.priority === "urgent").length;
  const revenueAtRisk = all.reduce((sum, g) => sum + (g.estimatedRevenue ?? 0), 0);

  const filtered = all.filter((g) => {
    if (teamFilter !== "all" && g.assignedTeamType !== teamFilter) return false;
    if (priorityFilter !== "all" && g.priority !== priorityFilter) return false;
    if (statusFilter !== "all" && g.status !== statusFilter) return false;
    if (
      search &&
      !g.patient.name.toLowerCase().includes(search.toLowerCase()) &&
      !g.description.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const po = priorityOrder[a.priority] ?? 4;
    const pb = priorityOrder[b.priority] ?? 4;
    if (po !== pb) return po - pb;
    return (b.daysOverdue ?? 0) - (a.daysOverdue ?? 0);
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const resetPage = () => setPage(1);

  const handleResolve = async (gap: CareGapListItem) => {
    try {
      await resolveMutation.mutateAsync(gap.id);
      toast("success", "Gap resolved", `${activityLabel(gap.description)} marked as completed`);
    } catch {
      toast("error", "Failed to resolve gap");
    }
  };

  const byTeam = {
    pac: all.filter((g) => g.assignedTeamType === "pac"),
    chw: all.filter((g) => g.assignedTeamType === "chw"),
    doctor: all.filter((g) => g.assignedTeamType === "doctor"),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Care Continuum Gaps"
        description="Identify and close missed activities across the patient care continuum"
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Open Care Gaps" value={all.length} icon={Activity} color="blue" />
        <StatCard
          label="Overdue"
          value={overdueCount}
          icon={AlertTriangle}
          color={overdueCount > 5 ? "red" : "orange"}
        />
        <StatCard
          label="Revenue at Risk"
          value={`$${revenueAtRisk.toLocaleString()}`}
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          label="Urgent / Stat"
          value={urgentCount}
          icon={TrendingUp}
          color={urgentCount > 3 ? "red" : urgentCount > 1 ? "amber" : "purple"}
        />
      </div>

      <div className="flex gap-6">
        {/* Main table */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex flex-wrap gap-3 items-center">
              <input
                type="text"
                placeholder="Search patient or activity..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); resetPage(); }}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
              />
              <select
                value={teamFilter}
                onChange={(e) => { setTeamFilter(e.target.value as TeamFilter); resetPage(); }}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Teams</option>
                <option value="pac">PAC (Receptionist)</option>
                <option value="chw">CSW</option>
                <option value="doctor">Doctor</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => { setPriorityFilter(e.target.value); resetPage(); }}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="stat">Stat</option>
                <option value="urgent">Urgent</option>
                <option value="asap">ASAP</option>
                <option value="routine">Routine</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); resetPage(); }}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="in-progress">In Progress</option>
                <option value="requested">Requested</option>
              </select>
              {(teamFilter !== "all" || statusFilter !== "all" || priorityFilter !== "all" || search) && (
                <button
                  onClick={() => { setTeamFilter("all"); setStatusFilter("all"); setPriorityFilter("all"); setSearch(""); resetPage(); }}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Clear filters
                </button>
              )}
              <span className="ml-auto text-xs text-gray-500">{sorted.length} gaps</span>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {sorted.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-sm">
                No care gaps match the current filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      <th className="px-4 py-3">Priority</th>
                      <th className="px-4 py-3">Patient</th>
                      <th className="px-4 py-3">Activity</th>
                      <th className="px-4 py-3">Protocol</th>
                      <th className="px-4 py-3">Team</th>
                      <th className="px-4 py-3">Due Date</th>
                      <th className="px-4 py-3">Owner</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Revenue</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginated.map((gap) => (
                      <tr
                        key={gap.id}
                        className={`hover:bg-gray-50 transition-colors ${gap.priority === "stat" ? "bg-red-50" : gap.daysOverdue > 0 ? "bg-orange-50" : ""}`}
                      >
                        {/* Priority */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className={`h-2 w-2 rounded-full flex-shrink-0 ${priorityDot[gap.priority] ?? "bg-gray-300"}`} />
                            <span className="text-xs font-medium text-gray-700 capitalize">{gap.priority}</span>
                          </div>
                        </td>

                        {/* Patient */}
                        <td className="px-4 py-3">
                          <button
                            onClick={() => navigate(`/patients/${gap.patient.id}`)}
                            className="text-sm font-medium text-blue-600 hover:underline whitespace-nowrap"
                          >
                            {gap.patient.name}
                          </button>
                          <p className="text-xs text-gray-400">{gap.patient.mrn}</p>
                        </td>

                        {/* Activity */}
                        <td className="px-4 py-3 max-w-[220px]">
                          <p className="text-sm text-gray-900 truncate" title={gap.description}>
                            {activityLabel(gap.description)}
                          </p>
                        </td>

                        {/* Protocol */}
                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-500 whitespace-nowrap">{gap.protocolName}</span>
                        </td>

                        {/* Team */}
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${teamColors[gap.assignedTeamType] ?? "bg-gray-100 text-gray-600"}`}>
                            {teamLabels[gap.assignedTeamType] ?? gap.assignedTeamType}
                          </span>
                        </td>

                        {/* Due date */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm text-gray-700">
                            {format(parseISO(gap.dueDate), "MMM d, yyyy")}
                          </span>
                          {gap.daysOverdue > 0 && (
                            <span className="ml-1.5 text-xs font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                              {gap.daysOverdue}d late
                            </span>
                          )}
                        </td>

                        {/* Owner */}
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                          {gap.owner.name !== "Unknown" ? gap.owner.name : "—"}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <StatusBadge status={gap.status} />
                        </td>

                        {/* Revenue */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {gap.estimatedRevenue > 0 ? (
                            <div>
                              <span className="text-sm font-semibold text-emerald-700">${gap.estimatedRevenue}</span>
                              {gap.revenueCode && <span className="ml-1 text-xs text-gray-400">{gap.revenueCode}</span>}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleResolve(gap)}
                            disabled={resolveMutation.isPending}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-green-700 border border-green-200 rounded-lg hover:bg-green-50 disabled:opacity-50 whitespace-nowrap"
                          >
                            <CheckCircle className="h-3.5 w-3.5" /> Resolve
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {sorted.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm">
                <span className="text-xs text-gray-500">
                  Showing {Math.min((safePage - 1) * PAGE_SIZE + 1, sorted.length)}–{Math.min(safePage * PAGE_SIZE, sorted.length)} of {sorted.length}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(1)} disabled={safePage === 1} className="px-2 py-1 text-xs rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">«</button>
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} className="px-2 py-1 text-xs rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">‹</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                    .reduce<(number | "…")[]>((acc, p, i, arr) => {
                      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === "…" ? (
                        <span key={`ellipsis-${i}`} className="px-2 py-1 text-xs text-gray-400">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p as number)}
                          className={`px-2.5 py-1 text-xs rounded border ${safePage === p ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                        >
                          {p}
                        </button>
                      )
                    )}
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="px-2 py-1 text-xs rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">›</button>
                  <button onClick={() => setPage(totalPages)} disabled={safePage === totalPages} className="px-2 py-1 text-xs rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">»</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Team workload sidebar */}
        <div className="w-56 flex-shrink-0 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Team Workload</h3>
            {(Object.entries(byTeam) as [string, CareGapListItem[]][]).map(([team, teamGaps]) => {
              const teamOverdue = teamGaps.filter((g) => g.daysOverdue > 0).length;
              return (
                <div key={team} className="mb-3 last:mb-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${teamColors[team]}`}>
                      {teamLabels[team]}
                    </span>
                    <span className="text-xs text-gray-600">{teamGaps.length}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${team === "pac" ? "bg-blue-500" : team === "chw" ? "bg-teal-500" : "bg-purple-500"}`}
                      style={{ width: `${Math.min((teamGaps.length / Math.max(all.length, 1)) * 100, 100)}%` }}
                    />
                  </div>
                  {teamOverdue > 0 && (
                    <p className="text-xs text-red-600 mt-0.5">{teamOverdue} overdue</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Priority breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">By Priority</h3>
            <div className="space-y-2">
              {(["stat", "urgent", "asap", "routine"] as const).map((p) => {
                const count = all.filter((g) => g.priority === p).length;
                return (
                  <div key={p} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${priorityDot[p]}`} />
                      <span className="text-gray-600 capitalize">{p}</span>
                    </div>
                    <span className="font-medium text-gray-800">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
