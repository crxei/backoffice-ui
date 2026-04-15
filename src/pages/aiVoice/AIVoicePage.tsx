import { Phone, CheckCircle, TrendingUp, Play } from "lucide-react";
import { usePatients } from "../../hooks/usePatients";
import { PageHeader } from "../../components/shared/PageHeader";
import { StatCard } from "../../components/shared/StatCard";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { toast } from "../../components/shared/Toast";

const callQueue = [
  {
    id: "CALL-001",
    patientId: "P-003",
    type: "post_discharge",
    scheduledTime: "10:00 AM",
    status: "scheduled",
    trigger: "Discharge Event",
  },
  {
    id: "CALL-002",
    patientId: "P-019",
    type: "appointment_reminder",
    scheduledTime: "10:30 AM",
    status: "scheduled",
    trigger: "T-24h rule",
  },
  {
    id: "CALL-003",
    patientId: "P-006",
    type: "missed_visit",
    scheduledTime: "11:00 AM",
    status: "in_progress",
    trigger: "CSW Missed Visit",
  },
  {
    id: "CALL-004",
    patientId: "P-013",
    type: "outreach",
    scheduledTime: "2:00 PM",
    status: "scheduled",
    trigger: "Care Plan Enrollment",
  },
];

const callOutcomes = [
  {
    patient: "Eleanor Voss",
    type: "Appointment Reminder",
    date: "Today 9:15 AM",
    duration: "2:34",
    outcome: "answered",
    transcript:
      "Hello Eleanor, this is CarePortal calling about your appointment tomorrow...",
    escalated: false,
  },
  {
    patient: "George Tanaka",
    type: "Post-Discharge",
    date: "Today 8:45 AM",
    duration: "0:00",
    outcome: "no-answer",
    transcript: "Call went to voicemail after 30 seconds.",
    escalated: true,
  },
  {
    patient: "Patricia Nguyen",
    type: "Medication Refill",
    date: "Yesterday 3:20 PM",
    duration: "1:47",
    outcome: "callback",
    transcript: "Patient requested callback. Said they will call back at 5 PM.",
    escalated: false,
  },
  {
    patient: "Linda Kowalski",
    type: "Post-Discharge",
    date: "Yesterday 10:00 AM",
    duration: "4:12",
    outcome: "answered",
    transcript:
      "Linda confirmed medications, no symptoms since discharge, feeling well...",
    escalated: false,
  },
];

const pathways = [
  {
    name: "Appointment Reminder",
    description: "T-24h and T-2h voice reminders with confirmation options",
    steps: 3,
  },
  {
    name: "Post-Discharge Follow-up",
    description: "48h post-discharge wellness check with symptom screening",
    steps: 5,
  },
  {
    name: "Missed Visit Outreach",
    description:
      "Automated outreach after CSW missed visit with escalation path",
    steps: 4,
  },
];

const outcomeColors: Record<string, string> = {
  answered: "bg-green-100 text-green-800",
  "no-answer": "bg-red-100 text-red-800",
  callback: "bg-amber-100 text-amber-800",
};

export function AIVoicePage() {
  const { data: patients } = usePatients();

  const getPatientName = (id: string) => {
    const p = (patients ?? []).find((x) => x.id === id);
    return p ? `${p.firstName} ${p.lastName}` : id;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Voice Outreach"
        description="Automated patient communication via voice AI"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Calls Scheduled Today"
          value={callQueue.length}
          icon={Phone}
        />
        <StatCard
          label="Calls Completed Today"
          value={callOutcomes.filter((c) => c.outcome === "answered").length}
          icon={CheckCircle}
          variant="success"
        />
        <StatCard
          label="Pick-up Rate"
          value="68%"
          icon={TrendingUp}
          variant="default"
          trend={{ value: 5, direction: "up", label: "vs last week" }}
        />
      </div>

      {/* Call Queue */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Today's Call Queue</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase">
                <th className="pb-2 pr-4">Patient</th>
                <th className="pb-2 pr-4">Call Type</th>
                <th className="pb-2 pr-4">Scheduled</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2">Trigger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {callQueue.map((call) => (
                <tr key={call.id} className="hover:bg-gray-50">
                  <td className="py-2 pr-4 font-medium">
                    {getPatientName(call.patientId)}
                  </td>
                  <td className="py-2 pr-4 capitalize">
                    {call.type.replace(/_/g, " ")}
                  </td>
                  <td className="py-2 pr-4 text-gray-500">
                    {call.scheduledTime}
                  </td>
                  <td className="py-2 pr-4">
                    <StatusBadge status={call.status} />
                  </td>
                  <td className="py-2 text-gray-500 text-xs">{call.trigger}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Call Outcomes */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Call Outcomes</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase">
                <th className="pb-2 pr-4">Patient</th>
                <th className="pb-2 pr-4">Call Type</th>
                <th className="pb-2 pr-4">Date</th>
                <th className="pb-2 pr-4">Duration</th>
                <th className="pb-2 pr-4">Outcome</th>
                <th className="pb-2 pr-4">Transcript Preview</th>
                <th className="pb-2">Escalated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {callOutcomes.map((outcome, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="py-2 pr-4 font-medium">{outcome.patient}</td>
                  <td className="py-2 pr-4">{outcome.type}</td>
                  <td className="py-2 pr-4 text-gray-500 text-xs">
                    {outcome.date}
                  </td>
                  <td className="py-2 pr-4 text-gray-500">
                    {outcome.duration}
                  </td>
                  <td className="py-2 pr-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${outcomeColors[outcome.outcome]}`}
                    >
                      {outcome.outcome}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-xs text-gray-500 max-w-xs truncate">
                    {outcome.transcript}
                  </td>
                  <td className="py-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${outcome.escalated ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      {outcome.escalated ? "Yes" : "No"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pathways */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">
          Voice Pathway Configuration
        </h3>
        <div className="space-y-3">
          {pathways.map((pathway) => (
            <div
              key={pathway.name}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {pathway.name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {pathway.description}
                </p>
                <p className="text-xs text-blue-600 mt-0.5">
                  {pathway.steps} steps
                </p>
              </div>
              <button
                onClick={() =>
                  toast("info", "Script Viewer", "Script editor coming soon")
                }
                className="flex items-center gap-1 text-xs text-blue-600 border border-blue-200 px-3 py-1.5 rounded hover:bg-blue-50"
              >
                <Play className="h-3 w-3" /> View Script
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
