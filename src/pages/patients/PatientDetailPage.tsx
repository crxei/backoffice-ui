import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { differenceInYears, parseISO, format } from "date-fns";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  Clock,
  Users,
} from "lucide-react";
import { usePatientDetail } from "../../hooks/usePatients";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { PageLoader } from "../../components/shared/LoadingSpinner";
import { frequencyLabel, teamLabel } from "../../data/careProtocols";
import type { ContinuumStage } from "../../data/patientDetail";

const tabs = [
  "Overview",
  "Clinical Data",
  "Appointments",
  "Care Plans",
  "Journey",
];

const STAGES: { key: ContinuumStage; label: string }[] = [
  { key: "intake", label: "Intake" },
  { key: "enrolled", label: "Enrolled" },
  { key: "assessment", label: "Assessment" },
  { key: "active_care", label: "Active Care" },
  { key: "maintenance", label: "Maintenance" },
  { key: "discharged", label: "Discharged" },
];

const stageOrder: Record<ContinuumStage, number> = {
  intake: 0,
  enrolled: 1,
  assessment: 2,
  active_care: 3,
  maintenance: 4,
  discharged: 5,
};

const adherenceColor = (score: number) =>
  score >= 80
    ? "bg-green-500"
    : score >= 60
      ? "bg-yellow-500"
      : score >= 40
        ? "bg-orange-500"
        : "bg-red-500";

const adherenceLabel = (score: number) =>
  score >= 80
    ? "Good"
    : score >= 60
      ? "Moderate"
      : score >= 40
        ? "Poor"
        : "Critical";

const priorityColors: Record<string, string> = {
  critical: "text-red-700 bg-red-50 border border-red-200",
  high: "text-orange-700 bg-orange-50 border border-orange-200",
  medium: "text-yellow-700 bg-yellow-50 border border-yellow-200",
  low: "text-gray-600 bg-gray-50 border border-gray-200",
};

const teamBadge: Record<string, string> = {
  pac: "bg-blue-100 text-blue-700",
  chw: "bg-teal-100 text-teal-700",
  doctor: "bg-purple-100 text-purple-700",
};

export function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const { data: detail, isLoading } = usePatientDetail(id ?? "");

  if (isLoading) return <PageLoader />;
  if (!detail)
    return (
      <div className="text-center py-20 text-gray-500">Patient not found</div>
    );

  const age = differenceInYears(new Date(), parseISO(detail.dob));
  const initials = `${detail.firstName[0]}${detail.lastName[0]}`;
  const journey = detail.journey;
  const patientGaps = detail.careGaps;
  const applicableProtocols = detail.careProtocols;

  return (
    <div>
      <button
        onClick={() => navigate("/patients")}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Registry
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start gap-2 mb-1">
              <h1 className="text-xl font-bold text-gray-900">
                {detail.firstName} {detail.lastName}
              </h1>
              <StatusBadge status={detail.riskLevel} />
              <StatusBadge status={detail.consentStatus} />
            </div>
            <p className="text-sm text-gray-500">
              {detail.mrn} · {age} years · {detail.gender} · DOB{" "}
              {format(parseISO(detail.dob), "MMM d, yyyy")}
            </p>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
              {detail.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  {detail.phone}
                </span>
              )}
              {detail.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {detail.email}
                </span>
              )}
              {(detail.address.city || detail.address.state) && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {[detail.address.city, detail.address.state].filter(Boolean).join(", ")}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-6">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === i ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Overview */}
      {activeTab === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Demographics</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Address</dt>
                <dd className="text-gray-900 text-right">
                  {detail.address.street
                    ? `${detail.address.street}, ${detail.address.city}, ${detail.address.state} ${detail.address.zip}`
                    : "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Gender</dt>
                <dd className="text-gray-900 capitalize">{detail.gender}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Enrollment</dt>
                <dd className="text-gray-900">
                  {detail.enrollmentDate
                    ? format(parseISO(detail.enrollmentDate), "MMM d, yyyy")
                    : "—"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Insurance</h3>
            {detail.insurance ? (
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Payer</dt>
                  <dd className="text-gray-900">{detail.insurance.payer}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Plan</dt>
                  <dd className="text-gray-900">{detail.insurance.plan}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Member ID</dt>
                  <dd className="text-gray-900">{detail.insurance.memberId}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Group #</dt>
                  <dd className="text-gray-900">{detail.insurance.groupNumber}</dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-gray-400">No insurance information available</p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Conditions</h3>
            {detail.conditions.length === 0 ? (
              <p className="text-sm text-gray-400">No conditions recorded</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {detail.conditions.map((c) => (
                  <span
                    key={c.id}
                    className="px-2.5 py-1 bg-blue-50 text-blue-800 text-xs font-medium rounded-full"
                    title={c.code}
                  >
                    {c.display}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Primary Provider</h3>
            {detail.primaryProvider ? (
              <div>
                <p className="text-sm font-medium text-gray-900">{detail.primaryProvider.name}</p>
                <p className="text-xs text-gray-500">{detail.primaryProvider.specialty}</p>
                <p className="text-xs text-gray-500">{detail.primaryProvider.location}</p>
                <p className="text-xs text-gray-500">{detail.primaryProvider.phone}</p>
              </div>
            ) : detail.careTeam.length > 0 ? (
              <div className="space-y-2">
                {detail.careTeam.map((m) => (
                  <div key={m.memberId} className="flex items-center justify-between text-sm">
                    <span className="text-gray-900">{m.memberName ?? m.memberId}</span>
                    <span className="text-xs text-gray-500">{m.role}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No provider assigned</p>
            )}
          </div>
        </div>
      )}

      {/* Clinical Data */}
      {activeTab === 1 && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Vitals</h3>
            {detail.vitals.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No vitals recorded</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead>
                    <tr className="text-xs text-gray-500 uppercase">
                      <th className="pb-2 pr-4 text-left">Date</th>
                      <th className="pb-2 pr-4 text-left">Type</th>
                      <th className="pb-2 text-left">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {detail.vitals.map((v, i) => (
                      <tr key={i}>
                        <td className="py-2 pr-4 text-gray-500">{v.date}</td>
                        <td className="py-2 pr-4 font-medium">{v.type}</td>
                        <td className="py-2">{v.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Current Medications</h3>
            {detail.medications.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No medications recorded</p>
            ) : (
              <div className="space-y-3">
                {detail.medications.map((med, i) => (
                  <div key={i} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{med.name}</p>
                      <p className="text-xs text-gray-500">
                        {med.frequency} · Since {med.startDate}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">{med.prescribedBy}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Appointments */}
      {activeTab === 2 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Appointments</h3>
          {detail.appointments.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No appointments</p>
          ) : (
            <div className="space-y-2">
              {detail.appointments
                .filter((a) => !!a.dateTime)
                .sort((a, b) => b.dateTime.localeCompare(a.dateTime))
                .map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {format(parseISO(apt.dateTime), "MMM d, yyyy h:mm a")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {apt.type.replace(/_/g, " ")}
                        {apt.location ? ` · ${apt.location}` : ""}
                        {apt.providerName ? ` · ${apt.providerName}` : ""}
                      </p>
                    </div>
                    <StatusBadge status={apt.status} />
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Care Plans */}
      {activeTab === 3 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Care Plans</h3>
          {detail.carePlans.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No care plans</p>
          ) : (
            <div className="space-y-4">
              {detail.carePlans.map((cp) => (
                <div key={cp.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-900">{cp.title}</p>
                    <StatusBadge status={cp.status} />
                  </div>
                  {cp.protocol && (
                    <p className="text-xs text-gray-500 mb-3">{cp.protocol}</p>
                  )}
                  {cp.goals.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {cp.goals.map((goal) => (
                        <div key={goal.id} className="p-3 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-xs text-gray-800 flex-1">{goal.description}</p>
                            <StatusBadge status={goal.status} />
                          </div>
                          {goal.targetDate && (
                            <p className="text-xs text-gray-400">
                              Target: {format(parseISO(goal.targetDate), "MMM d, yyyy")}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Journey */}
      {activeTab === 4 && (
        <div className="space-y-6">
          {!journey ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 text-sm">
              No journey data available for this patient.
            </div>
          ) : (
            <>
              {/* Continuum stage pipeline */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Care Continuum</h3>
                <div className="flex items-center gap-0 overflow-x-auto pb-2">
                  {STAGES.map((stage, i) => {
                    const current = stageOrder[journey.stage];
                    const isActive = stage.key === journey.stage;
                    const isDone = stageOrder[stage.key] < current;
                    const isFuture = stageOrder[stage.key] > current;
                    return (
                      <div key={stage.key} className="flex items-center flex-shrink-0">
                        <div
                          className={`flex flex-col items-center px-3 py-2 rounded-lg min-w-[90px] ${isActive ? "bg-blue-600 text-white" : isDone ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-400"}`}
                        >
                          <div
                            className={`h-5 w-5 rounded-full border-2 mb-1 flex items-center justify-center ${isActive ? "border-white bg-white" : isDone ? "border-green-500 bg-green-500" : "border-gray-300 bg-white"}`}
                          >
                            {isDone && <CheckCircle className="h-3.5 w-3.5 text-white" />}
                            {isActive && <div className="h-2 w-2 rounded-full bg-blue-600" />}
                          </div>
                          <span className={`text-xs font-medium text-center leading-tight ${isFuture ? "text-gray-400" : ""}`}>
                            {stage.label}
                          </span>
                        </div>
                        {i < STAGES.length - 1 && (
                          <div
                            className={`h-0.5 w-6 flex-shrink-0 ${stageOrder[stage.key] < current ? "bg-green-400" : "bg-gray-200"}`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Adherence + next action */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                  <h3 className="font-semibold text-gray-900">Adherence & Next Action</h3>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Adherence Score</span>
                      <span
                        className={`text-sm font-bold ${journey.adherenceScore >= 80 ? "text-green-600" : journey.adherenceScore >= 60 ? "text-yellow-600" : journey.adherenceScore >= 40 ? "text-orange-600" : "text-red-600"}`}
                      >
                        {journey.adherenceScore}% — {adherenceLabel(journey.adherenceScore)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${adherenceColor(journey.adherenceScore)}`}
                        style={{ width: `${journey.adherenceScore}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {journey.completedActivitiesLast30} of {journey.totalActivitiesLast30} activities
                      completed in the last 30 days
                    </p>
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">
                      Next Action
                    </p>
                    <div className="flex items-start gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${teamBadge[journey.nextActionTeam]}`}>
                        {journey.nextActionTeam.toUpperCase()}
                      </span>
                      <p className="text-sm text-gray-800">{journey.nextAction}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 text-xs">
                    <div>
                      <p className="text-gray-500">Last Contact</p>
                      <p className="font-medium text-gray-900">
                        {format(parseISO(journey.lastContactDate), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Next Contact</p>
                      <p className="font-medium text-gray-900">
                        {format(parseISO(journey.nextContactDate), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Primary Team</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${teamBadge[journey.primaryTeam]}`}>
                        {teamLabel[journey.primaryTeam]}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-500">Active Gaps</p>
                      <p className={`font-bold ${patientGaps.length > 0 ? "text-red-600" : "text-green-600"}`}>
                        {patientGaps.length}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Active care gaps */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Active Care Gaps</h3>
                    {patientGaps.length > 0 && (
                      <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                        {patientGaps.filter((g) => g.status === "critical" || g.status === "overdue").length} overdue
                      </span>
                    )}
                  </div>
                  {patientGaps.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <CheckCircle className="h-8 w-8 text-green-400 mb-2" />
                      <p className="text-sm text-gray-500">No active care gaps</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {patientGaps.map((gap) => (
                        <div
                          key={gap.id}
                          className={`p-3 rounded-lg border ${gap.status === "critical" ? "bg-red-50 border-red-200" : gap.status === "overdue" ? "bg-orange-50 border-orange-200" : "bg-gray-50 border-gray-200"}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="text-xs font-semibold text-gray-900">{gap.activityName}</p>
                                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${priorityColors[gap.priority]}`}>
                                  {gap.priority}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">{gap.protocolName}</p>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                              <Clock className="h-3 w-3" />
                              {format(parseISO(gap.dueDate), "MMM d")}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${teamBadge[gap.assignedTeam]}`}>
                              {gap.assignedTeam.toUpperCase()}
                            </span>
                            {gap.estimatedRevenue && (
                              <span className="text-xs text-emerald-700">
                                ${gap.estimatedRevenue} · {gap.revenueCode}
                              </span>
                            )}
                            <StatusBadge status={gap.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Applicable protocols */}
              {applicableProtocols.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="font-semibold text-gray-900 mb-4">Active Care Protocols</h3>
                  <div className="space-y-4">
                    {applicableProtocols.map((proto) => (
                      <div key={proto.id}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-${proto.color}-100 text-${proto.color}-700`}>
                            {proto.name}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {proto.activities.map((act) => (
                            <div key={act.id} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg text-xs">
                              <Users className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="font-medium text-gray-800 truncate">{act.name}</p>
                                <p className="text-gray-500">
                                  {frequencyLabel[act.frequency as keyof typeof frequencyLabel] ?? act.frequency} ·{" "}
                                  {act.assignedTeam.toUpperCase()}
                                </p>
                                {act.billable && act.estimatedRevenue && (
                                  <p className="text-emerald-700">
                                    ${act.estimatedRevenue} · {act.revenueCode}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
