import { patients as patientsData, type Patient } from "../data/patients";
import {
  type PatientDetail,
  type PatientDetailCondition,
  type PatientDetailCarePlan,
  type PatientDetailAppointment,
} from "../data/patientDetail";
import { callOpenFn, postToOpenFn } from "./openFnClient";

const PATIENTS_LIST_WEBHOOK = "e640c514-2925-40d3-8968-eb28327ffeac";

interface ApiCondition {
  display: string;
  icd10: string;
}

interface ApiPatient {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: "male" | "female" | "other";
  phone: string;
  email: string;
  active: boolean;
  conditions: ApiCondition[];
  primaryProvider: { id: string; display: string };
  riskLevel: "low" | "medium" | "high";
  riskScore: number;
  program: string;
  journeyStage: string;
  lastUpdated: string;
}

interface ApiPatientsResponse {
  data: {
    patients: ApiPatient[];
    total: number;
    page: number;
    pageSize: number;
    nextCursor?: string;
  };
  meta: { state: string };
}

function mapApiPatient(ap: ApiPatient): Patient {
  return {
    id: ap.id,
    mrn: ap.mrn,
    firstName: ap.firstName,
    lastName: ap.lastName,
    dob: ap.birthDate,
    gender: ap.gender,
    phone: ap.phone ?? "",
    email: ap.email ?? "",
    address: { street: "", city: "", state: "", zip: "" },
    insurance: { payer: "", memberId: "", groupNumber: "", plan: "" },
    primaryProvider:
      ap.primaryProvider?.display ?? ap.primaryProvider?.id ?? "",
    conditions: (ap.conditions ?? []).map((c) => c.display),
    consentStatus: "active",
    enrollmentDate: ap.lastUpdated?.slice(0, 10) ?? "",
    riskLevel: ap.riskLevel,
    riskScore: ap.riskScore,
    program: ap.program,
    journeyStage: ap.journeyStage,
  };
}

let patientsStore = [...patientsData];

export async function fetchPatients(): Promise<Patient[]> {
  const response = await postToOpenFn<ApiPatientsResponse>(
    PATIENTS_LIST_WEBHOOK,
    {},
  );
  return response.data.patients.map(mapApiPatient);
}

export async function fetchPatientById(
  id: string,
): Promise<Patient | undefined> {
  return patientsStore.find((p) => p.id === id);
}

export async function createPatient(
  data: Omit<Patient, "id" | "mrn">,
): Promise<Patient> {
  const newId = `P-${String(patientsStore.length + 1).padStart(3, "0")}`;
  const newMrn = `MRN-${Math.floor(10000 + Math.random() * 90000)}`;
  const patient: Patient = { id: newId, mrn: newMrn, ...data };
  const result = await callOpenFn("patient-registration", { patient }, patient);
  patientsStore = [...patientsStore, result];
  return result;
}

export async function updatePatient(
  id: string,
  data: Partial<Patient>,
): Promise<Patient> {
  const existing = patientsStore.find((p) => p.id === id);
  if (!existing) throw new Error(`Patient ${id} not found`);
  const updated = { ...existing, ...data };
  const result = await callOpenFn("patient-update", { id, data }, updated);
  patientsStore = patientsStore.map((p) => (p.id === id ? result : p));
  return result;
}

// ── Patient Detail ─────────────────────────────────────────────────────────

const PATIENT_DETAIL_WEBHOOK = "5b1dbdc3-2f13-4241-8d00-3f30b2ee2dbc";

interface ApiDetailIdentity {
  id: string;
  mru?: string; // API typo — "mru" instead of "mrn"
  mrn?: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  phone?: string;
  email?: string;
  status?: string;
  address?: { street?: string; city?: string; state?: string; zip?: string };
}

interface ApiDetailCondition {
  id: string;
  code: string;
  display?: string;
  status?: string;
  onsetDate?: string | null;
}

interface ApiDetailCarePlan {
  id: string;
  title: string;
  status?: string;
  createdBy?: string;
  assignedClinician?: string;
  createdDate?: string;
  targetDate?: string;
  notes?: string;
  goals?: Array<{
    id?: string;
    description?: string;
    status?: string;
    targetDate?: string;
  }>;
  tasks?: Array<{
    id?: string;
    description?: string;
    assignee?: string;
    status?: string;
    dueDate?: string;
  }>;
}

interface ApiDetailAppointment {
  id: string;
  type?: string;
  status?: string;
  dateTime?: string;
  duration?: number;
  location?: string;
  providerName?: string;
  providerId?: string;
  notes?: string;
}

interface ApiDetailCareTeamMember {
  memberId: string;
  role: string;
  isPrimary?: boolean;
  memberName?: string;
}

interface ApiDetailVital {
  date: string;
  type: string;
  value: string;
}
interface ApiDetailMedication {
  name: string;
  frequency: string;
  prescribedBy: string;
  startDate: string;
}

interface ApiPatientDetailResponse {
  data: {
    patient: {
      identity: ApiDetailIdentity;
      conditions?: ApiDetailCondition[];
      carePlans?: ApiDetailCarePlan[];
      appointments?: ApiDetailAppointment[];
      careTeam?: ApiDetailCareTeamMember[];
      vitals?: ApiDetailVital[];
      medications?: ApiDetailMedication[];
    };
  };
  meta: { state: string };
}

function mapDetailCondition(c: ApiDetailCondition): PatientDetailCondition {
  return {
    id: c.id,
    code: c.code,
    display: c.display ?? c.code,
    clinicalStatus: (c.status ??
      "active") as PatientDetailCondition["clinicalStatus"],
    onsetDate: c.onsetDate ?? null,
  };
}

function mapDetailCarePlan(cp: ApiDetailCarePlan): PatientDetailCarePlan {
  return {
    id: cp.id,
    title: cp.title,
    status: (cp.status ?? "active") as PatientDetailCarePlan["status"],
    createdBy: cp.createdBy,
    assignedClinician: cp.assignedClinician,
    createdDate: cp.createdDate,
    targetDate: cp.targetDate,
    notes: cp.notes,
    goals: (cp.goals ?? []).map((g) => ({
      id: g.id ?? "",
      description: g.description ?? "",
      status: (g.status ??
        "not_started") as PatientDetailCarePlan["goals"][number]["status"],
      targetDate: g.targetDate ?? "",
    })),
    tasks: (cp.tasks ?? []).map((t) => ({
      id: t.id ?? "",
      description: t.description ?? "",
      assignee: t.assignee ?? "",
      status: (t.status ?? "pending") as "pending" | "completed",
      dueDate: t.dueDate ?? "",
    })),
  };
}

function mapDetailAppointment(
  a: ApiDetailAppointment,
): PatientDetailAppointment {
  return {
    id: a.id,
    type: a.type ?? "primary_care",
    status: a.status ?? "scheduled",
    dateTime: a.dateTime ?? "",
    duration: a.duration,
    location: a.location,
    providerName: a.providerName,
    providerId: a.providerId,
    notes: a.notes,
  };
}

function mapApiPatientDetail(res: ApiPatientDetailResponse): PatientDetail {
  const p = res.data.patient;
  const id = p.identity;
  return {
    id: id.id,
    mrn: id.mru ?? id.mrn ?? id.id,
    firstName: id.firstName,
    lastName: id.lastName,
    dob: id.dob,
    gender: (id.gender ?? "other") as PatientDetail["gender"],
    phone: id.phone ?? "",
    email: id.email ?? "",
    address: {
      street: id.address?.street ?? "",
      city: id.address?.city ?? "",
      state: id.address?.state ?? "",
      zip: id.address?.zip ?? "",
    },
    insurance: null,
    consentStatus: "active",
    enrollmentDate: null,
    riskLevel: "low",
    active: id.status === "active",
    lastUpdated: null,
    primaryProvider: null,
    conditions: (p.conditions ?? []).map(mapDetailCondition),
    careTeam: (p.careTeam ?? []).map((m) => ({
      memberId: m.memberId.replace("Practitioner/", ""),
      memberName: m.memberName,
      role: m.role,
      isPrimary: m.isPrimary ?? false,
    })),
    careGaps: [],
    journey: null,
    careProtocols: [],
    carePlans: (p.carePlans ?? []).map(mapDetailCarePlan),
    appointments: (p.appointments ?? []).map(mapDetailAppointment),
    vitals: p.vitals ?? [],
    medications: p.medications ?? [],
  };
}

export async function fetchPatientDetail(id: string): Promise<PatientDetail> {
  const response = await postToOpenFn<ApiPatientDetailResponse>(
    PATIENT_DETAIL_WEBHOOK,
    { patientId: id },
  );
  return mapApiPatientDetail(response);
}
