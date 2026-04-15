import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import {
  Phone,
  PhoneCall,
  PhoneOff,
  PhoneMissed,
  UserCheck,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Plus,
  Headphones,
  BarChart2,
} from "lucide-react";
import { usePatients } from "../../hooks/usePatients";
import { PageHeader } from "../../components/shared/PageHeader";
import { StatCard } from "../../components/shared/StatCard";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { toast } from "../../components/shared/Toast";

// ── Mock data ──────────────────────────────────────────────────────────────

const agentQueue = [
  {
    id: "RC-001",
    patientId: "P-003",
    patientName: "Yolanda Hernandez",
    callType: "Care Gap Follow-up",
    reason: "Annual Wellness Visit overdue 7+ weeks",
    priority: "critical",
    assignedAgent: "Sarah Chen",
    scheduledTime: "10:00 AM",
    status: "waiting",
    attempts: 0,
  },
  {
    id: "RC-002",
    patientId: "P-010",
    patientName: "William Abernathy",
    callType: "Consent Renewal",
    reason: "Consent expired — PSA screening blocked",
    priority: "high",
    assignedAgent: "Maria Rodriguez",
    scheduledTime: "10:30 AM",
    status: "waiting",
    attempts: 1,
  },
  {
    id: "RC-003",
    patientId: "P-012",
    patientName: "Rosa Delgado",
    callType: "Appointment Scheduling",
    reason: "AWV critically overdue — immediate scheduling needed",
    priority: "critical",
    assignedAgent: "Sarah Chen",
    scheduledTime: "11:00 AM",
    status: "in_progress",
    attempts: 0,
  },
  {
    id: "RC-004",
    patientId: "P-019",
    patientName: "George Tanaka",
    callType: "Consent Renewal",
    reason: "Expired consent — PSA + cardiology follow-up blocked",
    priority: "high",
    assignedAgent: "Maria Rodriguez",
    scheduledTime: "11:30 AM",
    status: "waiting",
    attempts: 2,
  },
  {
    id: "RC-005",
    patientId: "P-006",
    patientName: "Derek Washington",
    callType: "Enrollment & Consent",
    reason: "Missing consent — PHQ-9 protocol paused",
    priority: "high",
    assignedAgent: "Sarah Chen",
    scheduledTime: "2:00 PM",
    status: "waiting",
    attempts: 0,
  },
  {
    id: "RC-006",
    patientId: "P-002",
    patientName: "Marcus Whitfield",
    callType: "Missed Appointment",
    reason: "Psychiatry appointment missed Mar 20 — not rescheduled",
    priority: "high",
    assignedAgent: "Maria Rodriguez",
    scheduledTime: "2:30 PM",
    status: "scheduled",
    attempts: 0,
  },
  {
    id: "RC-007",
    patientId: "P-007",
    patientName: "Linda Kowalski",
    callType: "Medication Check",
    reason: "Quarterly medication reconciliation overdue",
    priority: "medium",
    assignedAgent: "Sarah Chen",
    scheduledTime: "3:00 PM",
    status: "scheduled",
    attempts: 0,
  },
  {
    id: "RC-008",
    patientId: "P-014",
    patientName: "Janet Priceworth",
    callType: "Welfare Check",
    reason: "PHQ-9 + medication reconciliation both overdue",
    priority: "high",
    assignedAgent: "Maria Rodriguez",
    scheduledTime: "3:30 PM",
    status: "scheduled",
    attempts: 0,
  },
];

const callHistory = [
  {
    id: "RCH-001",
    patientName: "Eleanor Voss",
    callType: "Care Gap Follow-up",
    agent: "Sarah Chen",
    date: "2026-04-10T09:15:00Z",
    duration: "4:22",
    outcome: "resolved",
    notes:
      "A1C lab scheduled for Apr 14. Patient confirmed transportation arranged.",
    escalated: false,
  },
  {
    id: "RCH-002",
    patientName: "Patricia Nguyen",
    callType: "Appointment Scheduling",
    agent: "Maria Rodriguez",
    date: "2026-04-10T08:45:00Z",
    duration: "3:05",
    outcome: "scheduled",
    notes: "Nephrology follow-up booked for Apr 22 at Northwestern Memorial.",
    escalated: false,
  },
  {
    id: "RCH-003",
    patientName: "George Tanaka",
    callType: "Consent Renewal",
    agent: "Sarah Chen",
    date: "2026-04-09T14:30:00Z",
    duration: "0:00",
    outcome: "no_answer",
    notes: "No answer after 4 rings. Voicemail left. Second attempt scheduled.",
    escalated: false,
  },
  {
    id: "RCH-004",
    patientName: "William Abernathy",
    callType: "Consent Renewal",
    agent: "Maria Rodriguez",
    date: "2026-04-09T11:00:00Z",
    duration: "2:18",
    outcome: "callback_requested",
    notes: "Patient asked to call back after 3 PM. Flagged for follow-up.",
    escalated: false,
  },
  {
    id: "RCH-005",
    patientName: "Rosa Delgado",
    callType: "Welfare Check",
    agent: "Sarah Chen",
    date: "2026-04-08T10:00:00Z",
    duration: "6:47",
    outcome: "escalated",
    notes:
      "Patient reported chest tightness. Escalated to clinical team immediately.",
    escalated: true,
  },
  {
    id: "RCH-006",
    patientName: "Chen Liu",
    callType: "Appointment Reminder",
    agent: "Maria Rodriguez",
    date: "2026-04-08T09:30:00Z",
    duration: "1:55",
    outcome: "resolved",
    notes:
      "Fall risk assessment confirmed for Apr 20. Patient confirmed attendance.",
    escalated: false,
  },
];

const agents = [
  {
    name: "Sarah Chen",
    role: "Care Coordinator",
    status: "on_call",
    callsToday: 8,
    avgDuration: "3:45",
    currentCall: "Rosa Delgado",
  },
  {
    name: "Maria Rodriguez",
    role: "CSW Supervisor",
    status: "available",
    callsToday: 6,
    avgDuration: "4:12",
    currentCall: null,
  },
  {
    name: "Robert Kim",
    role: "Billing Specialist",
    status: "available",
    callsToday: 4,
    avgDuration: "2:30",
    currentCall: null,
  },
];

const outcomeConfig: Record<
  string,
  {
    label: string;
    color: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  resolved: {
    label: "Resolved",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  scheduled: {
    label: "Scheduled",
    color: "bg-blue-100 text-blue-800",
    icon: CheckCircle,
  },
  no_answer: {
    label: "No Answer",
    color: "bg-gray-100 text-gray-600",
    icon: PhoneMissed,
  },
  callback_requested: {
    label: "Callback Req.",
    color: "bg-amber-100 text-amber-800",
    icon: RefreshCw,
  },
  escalated: {
    label: "Escalated",
    color: "bg-red-100 text-red-800",
    icon: AlertTriangle,
  },
};

const priorityDot: Record<string, string> = {
  critical: "bg-red-500",
  high: "bg-orange-400",
  medium: "bg-yellow-400",
  low: "bg-gray-300",
};

const agentStatus: Record<string, { color: string; label: string }> = {
  on_call: { color: "bg-green-500", label: "On Call" },
  available: { color: "bg-blue-400", label: "Available" },
  offline: { color: "bg-gray-300", label: "Offline" },
};

export function RingCentralPage() {
  const navigate = useNavigate();
  const { data: patients } = usePatients();
  const [activeTab, setActiveTab] = useState<"queue" | "history" | "agents">(
    "queue",
  );
  const [queueItems, setQueueItems] = useState(agentQueue);

  const getPatientName = (id: string) => {
    const p = (patients ?? []).find((x) => x.id === id);
    return p ? `${p.firstName} ${p.lastName}` : id;
  };

  const handleDial = (item: (typeof agentQueue)[0]) => {
    setQueueItems((prev) =>
      prev.map((q) => (q.id === item.id ? { ...q, status: "in_progress" } : q)),
    );
    toast(
      "success",
      "Dialing",
      `Connecting to ${item.patientName} via RingCentral...`,
    );
  };

  const handleComplete = (item: (typeof agentQueue)[0]) => {
    setQueueItems((prev) => prev.filter((q) => q.id !== item.id));
    toast("success", "Call logged", `${item.patientName} — outcome recorded`);
  };

  const todayResolved = callHistory.filter(
    (c) => c.outcome === "resolved" || c.outcome === "scheduled",
  ).length;
  const todayEscalated = callHistory.filter((c) => c.escalated).length;
  const avgDurationSecs =
    callHistory
      .filter((c) => c.duration !== "0:00")
      .reduce((sum, c) => {
        const [m, s] = c.duration.split(":").map(Number);
        return sum + m * 60 + s;
      }, 0) /
    Math.max(callHistory.filter((c) => c.duration !== "0:00").length, 1);
  const avgMin = Math.floor(avgDurationSecs / 60);
  const avgSec = Math.round(avgDurationSecs % 60);

  const tabs = [
    { key: "queue", label: "Call Queue", count: queueItems.length },
    { key: "history", label: "Call History", count: callHistory.length },
    { key: "agents", label: "Agent Status", count: agents.length },
  ] as const;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Human Outreach — RingCentral"
        subtitle="Agent-assisted patient communication for care gap closure, consent, and scheduling"
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="In Queue Today"
          value={queueItems.length}
          icon={Phone}
          color="blue"
        />
        <StatCard
          label="Resolved / Scheduled"
          value={todayResolved}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          label="Escalated to Clinical"
          value={todayEscalated}
          icon={AlertTriangle}
          color={todayEscalated > 0 ? "red" : "teal"}
        />
        <StatCard
          label="Avg Call Duration"
          value={`${avgMin}:${String(avgSec).padStart(2, "0")}`}
          icon={Clock}
          color="indigo"
        />
      </div>

      {/* RingCentral integration banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-xl p-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <Headphones className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold">RingCentral Connected</p>
            <p className="text-xs text-blue-200">
              3 agents online · Softphone active · Call recording enabled
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-medium">Live</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          {tabs.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === key ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              {label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${activeTab === key ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}
              >
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Call Queue */}
      {activeTab === "queue" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {queueItems.filter((q) => q.status === "in_progress").length} in
              progress ·{" "}
              {queueItems.filter((q) => q.status === "waiting").length} waiting
              · {queueItems.filter((q) => q.status === "scheduled").length}{" "}
              scheduled later
            </p>
            <button
              onClick={() =>
                toast(
                  "info",
                  "Add to Queue",
                  "Manual queue addition coming soon",
                )
              }
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-3.5 w-3.5" /> Add to Queue
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Call Type</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Assigned Agent</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Attempts</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {queueItems.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-50 transition-colors ${item.status === "in_progress" ? "bg-green-50" : item.priority === "critical" ? "bg-red-50/40" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`h-2 w-2 rounded-full ${priorityDot[item.priority]}`}
                        />
                        <span className="text-xs font-medium text-gray-700 capitalize">
                          {item.priority}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/patients/${item.patientId}`)}
                        className="text-sm font-medium text-blue-600 hover:underline whitespace-nowrap"
                      >
                        {item.patientName}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 whitespace-nowrap">
                      {item.callType}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-[200px]">
                      {item.reason}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="h-3.5 w-3.5 text-gray-400" />
                        {item.assignedAgent}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {item.scheduledTime}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-xs font-medium ${item.attempts > 0 ? "text-orange-600" : "text-gray-400"}`}
                      >
                        {item.attempts}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {item.status !== "in_progress" ? (
                          <button
                            onClick={() => handleDial(item)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-green-700 border border-green-200 rounded-lg hover:bg-green-50 whitespace-nowrap"
                          >
                            <PhoneCall className="h-3.5 w-3.5" /> Dial
                          </button>
                        ) : (
                          <button
                            onClick={() => handleComplete(item)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 whitespace-nowrap"
                          >
                            <PhoneOff className="h-3.5 w-3.5" /> End
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {queueItems.length === 0 && (
              <div className="p-12 text-center text-gray-400 text-sm">
                Queue is empty
              </div>
            )}
          </div>
        </div>
      )}

      {/* Call History */}
      {activeTab === "history" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Call Type</th>
                <th className="px-4 py-3">Agent</th>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Outcome</th>
                <th className="px-4 py-3">Notes</th>
                <th className="px-4 py-3">Escalated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {callHistory.map((call) => {
                const outcome = outcomeConfig[call.outcome] ?? {
                  label: call.outcome,
                  color: "bg-gray-100 text-gray-600",
                  icon: Phone,
                };
                const OutcomeIcon = outcome.icon;
                return (
                  <tr
                    key={call.id}
                    className={`hover:bg-gray-50 transition-colors ${call.escalated ? "bg-red-50/30" : ""}`}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {call.patientName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                      {call.callType}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {call.agent}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {format(parseISO(call.date), "MMM d, h:mm a")}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {call.duration}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${outcome.color}`}
                      >
                        <OutcomeIcon className="h-3 w-3" />
                        {outcome.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">
                      {call.notes}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${call.escalated ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-400"}`}
                      >
                        {call.escalated ? "Yes" : "No"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Agent Status */}
      {activeTab === "agents" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {agents.map((agent) => {
              const status = agentStatus[agent.status];
              return (
                <div
                  key={agent.name}
                  className="bg-white rounded-xl border border-gray-200 p-5 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {agent.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {agent.name}
                        </p>
                        <p className="text-xs text-gray-500">{agent.role}</p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${agent.status === "on_call" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${status.color}`}
                      />
                      {status.label}
                    </span>
                  </div>

                  {agent.currentCall && (
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
                      <PhoneCall className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <p className="text-xs text-green-800 font-medium">
                        On call with {agent.currentCall}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 text-xs">
                    <div>
                      <p className="text-gray-500">Calls Today</p>
                      <p className="font-bold text-gray-900 text-base">
                        {agent.callsToday}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Avg Duration</p>
                      <p className="font-bold text-gray-900 text-base">
                        {agent.avgDuration}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      toast(
                        "info",
                        "Agent Activity",
                        `${agent.name}'s full call log coming soon`,
                      )
                    }
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
                  >
                    <BarChart2 className="h-3.5 w-3.5" /> View Activity
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
