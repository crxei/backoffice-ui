export interface Notification {
  id: string;
  patientId: string;
  type:
    | "appointment_reminder"
    | "medication_refill"
    | "care_plan_milestone"
    | "post_discharge"
    | "missed_visit"
    | "pa_decision"
    | "consent_expiry";
  channel: "sms" | "email" | "push" | "teams" | "voice_call";
  status: "pending" | "sent" | "delivered" | "failed" | "acknowledged";
  scheduledAt: string;
  sentAt: string | null;
  message: string;
  retryCount: number;
}

const today = new Date();
const daysFrom = (n: number, h = 10, m = 0) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

export const notifications: Notification[] = [
  {
    id: "NOT-001",
    patientId: "P-001",
    type: "appointment_reminder",
    channel: "sms",
    status: "delivered",
    scheduledAt: daysFrom(-1, 9, 0),
    sentAt: daysFrom(-1, 9, 1),
    message:
      "Hi Eleanor, this is a reminder about your appointment with Dr. Okafor tomorrow at 9:00 AM. Reply CONFIRM or CANCEL.",
    retryCount: 0,
  },
  {
    id: "NOT-002",
    patientId: "P-007",
    type: "appointment_reminder",
    channel: "sms",
    status: "delivered",
    scheduledAt: daysFrom(-1, 9, 0),
    sentAt: daysFrom(-1, 9, 2),
    message:
      "Hi Linda, reminder about your appointment with Dr. Sharma tomorrow at 10:30 AM at Senior Care Center.",
    retryCount: 0,
  },
  {
    id: "NOT-003",
    patientId: "P-003",
    type: "missed_visit",
    channel: "voice_call",
    status: "failed",
    scheduledAt: daysFrom(-2, 14, 0),
    sentAt: daysFrom(-2, 14, 5),
    message:
      "Automated call: Yolanda, we noticed you missed your recent CSW visit. Please call us at (312) 555-0000.",
    retryCount: 2,
  },
  {
    id: "NOT-004",
    patientId: "P-010",
    type: "consent_expiry",
    channel: "email",
    status: "delivered",
    scheduledAt: daysFrom(-5, 8, 0),
    sentAt: daysFrom(-5, 8, 3),
    message:
      "Dear William, your treatment consent on file expired on Jan 1, 2024. Please contact our office to update your consent forms.",
    retryCount: 0,
  },
  {
    id: "NOT-005",
    patientId: "P-013",
    type: "consent_expiry",
    channel: "sms",
    status: "pending",
    scheduledAt: daysFrom(1, 10, 0),
    sentAt: null,
    message:
      "Hi Michael, your consent records are missing. Please contact CarePortal to update your information.",
    retryCount: 0,
  },
  {
    id: "NOT-006",
    patientId: "P-002",
    type: "appointment_reminder",
    channel: "sms",
    status: "pending",
    scheduledAt: daysFrom(1, 9, 0),
    sentAt: null,
    message:
      "Hi Marcus, reminder about your appointment with Dr. Okafor in 2 days. Reply CONFIRM to confirm.",
    retryCount: 0,
  },
  {
    id: "NOT-007",
    patientId: "P-005",
    type: "medication_refill",
    channel: "sms",
    status: "delivered",
    scheduledAt: daysFrom(-3, 10, 0),
    sentAt: daysFrom(-3, 10, 2),
    message:
      "Hi Patricia, your metformin prescription is due for refill in 7 days. Call your pharmacy or reply REFILL.",
    retryCount: 0,
  },
  {
    id: "NOT-008",
    patientId: "P-016",
    type: "care_plan_milestone",
    channel: "email",
    status: "delivered",
    scheduledAt: daysFrom(-4, 11, 0),
    sentAt: daysFrom(-4, 11, 1),
    message:
      "Hi Nadia, your care plan goal 'Maintain BP below 130/80' has been marked achieved. Great progress!",
    retryCount: 0,
  },
  {
    id: "NOT-009",
    patientId: "P-006",
    type: "missed_visit",
    channel: "sms",
    status: "failed",
    scheduledAt: daysFrom(-6, 15, 0),
    sentAt: daysFrom(-6, 15, 30),
    message:
      "Hi Derek, we were unable to reach you for your scheduled check-in. Please call (312) 555-0000 at your convenience.",
    retryCount: 3,
  },
  {
    id: "NOT-010",
    patientId: "P-019",
    type: "post_discharge",
    channel: "voice_call",
    status: "delivered",
    scheduledAt: daysFrom(-7, 10, 0),
    sentAt: daysFrom(-7, 10, 15),
    message:
      "Automated post-discharge follow-up call for George Tanaka. Checking on symptoms after recent hospitalization.",
    retryCount: 0,
  },
  {
    id: "NOT-011",
    patientId: "P-012",
    type: "appointment_reminder",
    channel: "sms",
    status: "delivered",
    scheduledAt: daysFrom(-9, 9, 0),
    sentAt: daysFrom(-9, 9, 1),
    message:
      "Hi Rosa, reminder about your cardiology appointment next week. Please arrive 15 minutes early.",
    retryCount: 0,
  },
  {
    id: "NOT-012",
    patientId: "P-014",
    type: "care_plan_milestone",
    channel: "email",
    status: "delivered",
    scheduledAt: daysFrom(-10, 13, 0),
    sentAt: daysFrom(-10, 13, 2),
    message:
      "Hi Janet, your care team has updated your care plan goals. Please review with Dr. Sharma at your next visit.",
    retryCount: 0,
  },
  {
    id: "NOT-013",
    patientId: "P-017",
    type: "medication_refill",
    channel: "push",
    status: "delivered",
    scheduledAt: daysFrom(-11, 8, 0),
    sentAt: daysFrom(-11, 8, 1),
    message:
      "Your insulin prescription is due for refill. Contact your pharmacy today.",
    retryCount: 0,
  },
  {
    id: "NOT-014",
    patientId: "P-009",
    type: "appointment_reminder",
    channel: "email",
    status: "pending",
    scheduledAt: daysFrom(6, 9, 0),
    sentAt: null,
    message:
      "Dear Sophia, you have an upcoming appointment with Dr. Osei on ${date} at 9:00 AM. Please confirm by clicking below.",
    retryCount: 0,
  },
  {
    id: "NOT-015",
    patientId: "P-008",
    type: "medication_refill",
    channel: "sms",
    status: "delivered",
    scheduledAt: daysFrom(-13, 10, 30),
    sentAt: daysFrom(-13, 10, 32),
    message:
      "Hi Anthony, your tiotropium inhaler refill is due. Please call your pharmacy or your care team.",
    retryCount: 0,
  },
  {
    id: "NOT-016",
    patientId: "P-004",
    type: "appointment_reminder",
    channel: "sms",
    status: "pending",
    scheduledAt: daysFrom(4, 9, 0),
    sentAt: null,
    message:
      "Hi James, reminder about your appointment with Dr. Torres in 5 days at Respiratory Care Center.",
    retryCount: 0,
  },
  {
    id: "NOT-017",
    patientId: "P-011",
    type: "pa_decision",
    channel: "email",
    status: "delivered",
    scheduledAt: daysFrom(-15, 14, 0),
    sentAt: daysFrom(-15, 14, 5),
    message:
      "Prior authorization for Chen Liu's renal procedure has been APPROVED by United Healthcare. Auth #UHC-PA-2024-0087.",
    retryCount: 0,
  },
  {
    id: "NOT-018",
    patientId: "P-020",
    type: "care_plan_milestone",
    channel: "teams",
    status: "delivered",
    scheduledAt: daysFrom(-17, 11, 0),
    sentAt: daysFrom(-17, 11, 5),
    message:
      "Alert: Isabella Moreau's smoking cessation goal is overdue. CSW follow-up needed.",
    retryCount: 0,
  },
  {
    id: "NOT-019",
    patientId: "P-015",
    type: "appointment_reminder",
    channel: "sms",
    status: "pending",
    scheduledAt: daysFrom(9, 9, 0),
    sentAt: null,
    message:
      "Hi Carlos, reminder about your wellness exam on ${date}. Reply CONFIRM.",
    retryCount: 0,
  },
  {
    id: "NOT-020",
    patientId: "P-003",
    type: "consent_expiry",
    channel: "email",
    status: "failed",
    scheduledAt: daysFrom(-20, 9, 0),
    sentAt: daysFrom(-20, 9, 10),
    message:
      "Yolanda, your treatment consent expired. Please contact our office.",
    retryCount: 3,
  },
  {
    id: "NOT-021",
    patientId: "P-001",
    type: "medication_refill",
    channel: "sms",
    status: "pending",
    scheduledAt: daysFrom(2, 10, 0),
    sentAt: null,
    message:
      "Hi Eleanor, your lisinopril prescription needs to be refilled in 5 days.",
    retryCount: 0,
  },
  {
    id: "NOT-022",
    patientId: "P-007",
    type: "missed_visit",
    channel: "voice_call",
    status: "pending",
    scheduledAt: daysFrom(0, 16, 0),
    sentAt: null,
    message: "Automated call to Linda Kowalski regarding CSW visit status.",
    retryCount: 0,
  },
  {
    id: "NOT-023",
    patientId: "P-005",
    type: "appointment_reminder",
    channel: "sms",
    status: "pending",
    scheduledAt: daysFrom(2, 9, 0),
    sentAt: null,
    message:
      "Hi Patricia, reminder about your nephrology appointment in 3 days.",
    retryCount: 0,
  },
  {
    id: "NOT-024",
    patientId: "P-014",
    type: "appointment_reminder",
    channel: "email",
    status: "acknowledged",
    scheduledAt: daysFrom(-22, 9, 0),
    sentAt: daysFrom(-22, 9, 2),
    message:
      "Dear Janet, your telehealth appointment is scheduled for next Tuesday. Join link will be sent the morning of.",
    retryCount: 0,
  },
  {
    id: "NOT-025",
    patientId: "P-013",
    type: "missed_visit",
    channel: "sms",
    status: "pending",
    scheduledAt: daysFrom(0, 13, 0),
    sentAt: null,
    message:
      "Hi Michael, we noticed your CSW visit was missed. Please call to reschedule.",
    retryCount: 0,
  },
];
