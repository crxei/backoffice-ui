export type ActivityType =
  | "assessment"
  | "appointment"
  | "screening"
  | "lab"
  | "chw_visit"
  | "medication_review"
  | "wellness_check";
export type ActivityFrequency =
  | "twice_weekly"
  | "weekly"
  | "biweekly"
  | "monthly"
  | "quarterly"
  | "semiannual"
  | "annual";
export type AssignedTeam = "pac" | "chw" | "doctor";

export interface ProtocolActivity {
  id: string;
  name: string;
  type: ActivityType;
  frequency: ActivityFrequency;
  assignedTeam: AssignedTeam;
  billable: boolean;
  revenueCode?: string;
  estimatedRevenue?: number;
  description: string;
}

export interface CareProtocol {
  id: string;
  name: string;
  conditions: string[]; // matches patient.conditions entries
  minAge?: number; // age-based trigger
  color: string;
  activities: ProtocolActivity[];
}

export const careProtocols: CareProtocol[] = [
  {
    id: "PROTO-001",
    name: "Mental Health Management",
    conditions: [
      "Depression",
      "Anxiety",
      "Bipolar Disorder",
      "PTSD",
      "Schizophrenia",
    ],
    color: "purple",
    activities: [
      {
        id: "PROTO-001-A1",
        name: "PHQ-9 Depression Assessment",
        type: "assessment",
        frequency: "twice_weekly",
        assignedTeam: "chw",
        billable: true,
        revenueCode: "G2214",
        estimatedRevenue: 45,
        description:
          "Standardized PHQ-9 assessment administered twice per week to monitor depression severity",
      },
      {
        id: "PROTO-001-A2",
        name: "Behavioral Health Check-in",
        type: "chw_visit",
        frequency: "weekly",
        assignedTeam: "chw",
        billable: true,
        revenueCode: "G9919",
        estimatedRevenue: 65,
        description: "Weekly CSW in-person or virtual wellness check-in",
      },
      {
        id: "PROTO-001-A3",
        name: "Psychiatry Follow-up",
        type: "appointment",
        frequency: "monthly",
        assignedTeam: "doctor",
        billable: true,
        revenueCode: "90837",
        estimatedRevenue: 180,
        description:
          "Monthly psychiatric follow-up appointment with prescribing provider",
      },
      {
        id: "PROTO-001-A4",
        name: "Medication Adherence Outreach",
        type: "medication_review",
        frequency: "biweekly",
        assignedTeam: "pac",
        billable: false,
        description:
          "PAC outreach call to confirm medication adherence and refill needs",
      },
    ],
  },
  {
    id: "PROTO-002",
    name: "Elderly Care Protocol (60+)",
    conditions: [],
    minAge: 60,
    color: "teal",
    activities: [
      {
        id: "PROTO-002-A1",
        name: "PSA / Cancer Screening",
        type: "screening",
        frequency: "semiannual",
        assignedTeam: "pac",
        billable: true,
        revenueCode: "86316",
        estimatedRevenue: 95,
        description:
          "PSA blood test and cancer screening panel — every 6 months for patients 60+",
      },
      {
        id: "PROTO-002-A2",
        name: "Annual Wellness Visit",
        type: "wellness_check",
        frequency: "annual",
        assignedTeam: "doctor",
        billable: true,
        revenueCode: "G0439",
        estimatedRevenue: 220,
        description:
          "Comprehensive annual wellness exam (AWV) per Medicare guidelines",
      },
      {
        id: "PROTO-002-A3",
        name: "Fall Risk Assessment",
        type: "assessment",
        frequency: "quarterly",
        assignedTeam: "chw",
        billable: true,
        revenueCode: "99483",
        estimatedRevenue: 75,
        description: "Standardized fall risk assessment for elderly patients",
      },
      {
        id: "PROTO-002-A4",
        name: "Medication Reconciliation",
        type: "medication_review",
        frequency: "quarterly",
        assignedTeam: "doctor",
        billable: true,
        revenueCode: "99495",
        estimatedRevenue: 130,
        description:
          "Quarterly medication review to address polypharmacy and interaction risks",
      },
      {
        id: "PROTO-002-A5",
        name: "Social Isolation Check-in",
        type: "chw_visit",
        frequency: "biweekly",
        assignedTeam: "chw",
        billable: false,
        description:
          "CSW check-in to assess social support, isolation risk, and SDOH factors",
      },
    ],
  },
  {
    id: "PROTO-003",
    name: "Diabetes & CKD Management",
    conditions: [
      "Type 2 Diabetes",
      "CKD Stage 3",
      "CKD Stage 4",
      "CKD Stage 5",
    ],
    color: "blue",
    activities: [
      {
        id: "PROTO-003-A1",
        name: "A1C Lab Draw",
        type: "lab",
        frequency: "quarterly",
        assignedTeam: "pac",
        billable: true,
        revenueCode: "83036",
        estimatedRevenue: 55,
        description: "Quarterly HbA1c blood draw to monitor glycemic control",
      },
      {
        id: "PROTO-003-A2",
        name: "Diabetes Educator Session",
        type: "appointment",
        frequency: "monthly",
        assignedTeam: "doctor",
        billable: true,
        revenueCode: "G0108",
        estimatedRevenue: 110,
        description:
          "Monthly diabetes self-management education (DSME) session",
      },
      {
        id: "PROTO-003-A3",
        name: "Blood Glucose Monitoring Review",
        type: "chw_visit",
        frequency: "biweekly",
        assignedTeam: "chw",
        billable: true,
        revenueCode: "G9919",
        estimatedRevenue: 50,
        description:
          "CSW review of patient home blood glucose log and coaching",
      },
      {
        id: "PROTO-003-A4",
        name: "Nephrology Follow-up",
        type: "appointment",
        frequency: "quarterly",
        assignedTeam: "doctor",
        billable: true,
        revenueCode: "99215",
        estimatedRevenue: 210,
        description:
          "Quarterly nephrology appointment for CKD staging and monitoring",
      },
    ],
  },
  {
    id: "PROTO-004",
    name: "Hypertension Management",
    conditions: ["Hypertension"],
    color: "orange",
    activities: [
      {
        id: "PROTO-004-A1",
        name: "BP Monitoring Review",
        type: "chw_visit",
        frequency: "weekly",
        assignedTeam: "chw",
        billable: true,
        revenueCode: "G9919",
        estimatedRevenue: 45,
        description:
          "CSW review of patient home blood pressure log and lifestyle coaching",
      },
      {
        id: "PROTO-004-A2",
        name: "Cardiology Follow-up",
        type: "appointment",
        frequency: "quarterly",
        assignedTeam: "doctor",
        billable: true,
        revenueCode: "99214",
        estimatedRevenue: 175,
        description: "Quarterly cardiology follow-up appointment",
      },
      {
        id: "PROTO-004-A3",
        name: "Lipid Panel Lab",
        type: "lab",
        frequency: "semiannual",
        assignedTeam: "pac",
        billable: true,
        revenueCode: "80061",
        estimatedRevenue: 60,
        description:
          "Lipid panel to monitor cardiovascular risk and medication effectiveness",
      },
    ],
  },
];

export const frequencyLabel: Record<ActivityFrequency, string> = {
  twice_weekly: "2×/week",
  weekly: "Weekly",
  biweekly: "Every 2 weeks",
  monthly: "Monthly",
  quarterly: "Quarterly",
  semiannual: "Every 6 months",
  annual: "Annual",
};

export const teamLabel: Record<AssignedTeam, string> = {
  pac: "PAC (Receptionist)",
  chw: "CSW",
  doctor: "Doctor / Clinician",
};
