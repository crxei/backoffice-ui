export interface Consent {
  id: string
  patientId: string
  type: 'treatment' | 'payment' | 'operations' | 'roi' | 'research'
  status: 'active' | 'expired' | 'revoked' | 'pending'
  signedDate: string
  expiryDate: string
  signedBy: string
  witnessedBy: string
}

export const consents: Consent[] = [
  { id: 'CON-001', patientId: 'P-001', type: 'treatment', status: 'active', signedDate: '2023-01-10', expiryDate: '2025-01-10', signedBy: 'Eleanor Voss', witnessedBy: 'Sarah Chen' },
  { id: 'CON-002', patientId: 'P-001', type: 'payment', status: 'active', signedDate: '2023-01-10', expiryDate: '2025-01-10', signedBy: 'Eleanor Voss', witnessedBy: 'Sarah Chen' },
  { id: 'CON-003', patientId: 'P-002', type: 'treatment', status: 'active', signedDate: '2023-03-22', expiryDate: '2025-03-22', signedBy: 'Marcus Whitfield', witnessedBy: 'Robert Kim' },
  { id: 'CON-004', patientId: 'P-002', type: 'roi', status: 'active', signedDate: '2023-03-22', expiryDate: '2024-03-22', signedBy: 'Marcus Whitfield', witnessedBy: 'Robert Kim' },
  { id: 'CON-005', patientId: 'P-003', type: 'treatment', status: 'expired', signedDate: '2022-11-15', expiryDate: '2023-11-15', signedBy: 'Yolanda Hernandez', witnessedBy: 'Maria Rodriguez' },
  { id: 'CON-006', patientId: 'P-004', type: 'treatment', status: 'active', signedDate: '2023-06-01', expiryDate: '2025-06-01', signedBy: 'James Okonkwo', witnessedBy: 'Sarah Chen' },
  { id: 'CON-007', patientId: 'P-004', type: 'operations', status: 'active', signedDate: '2023-06-01', expiryDate: '2025-06-01', signedBy: 'James Okonkwo', witnessedBy: 'Sarah Chen' },
  { id: 'CON-008', patientId: 'P-005', type: 'treatment', status: 'active', signedDate: '2023-02-14', expiryDate: '2025-02-14', signedBy: 'Patricia Nguyen', witnessedBy: 'Maria Rodriguez' },
  { id: 'CON-009', patientId: 'P-006', type: 'treatment', status: 'pending', signedDate: '2024-01-08', expiryDate: '2026-01-08', signedBy: '', witnessedBy: '' },
  { id: 'CON-010', patientId: 'P-007', type: 'treatment', status: 'active', signedDate: '2022-09-20', expiryDate: '2024-09-20', signedBy: 'Linda Kowalski', witnessedBy: 'Robert Kim' },
  { id: 'CON-011', patientId: 'P-007', type: 'research', status: 'active', signedDate: '2023-01-10', expiryDate: '2025-01-10', signedBy: 'Linda Kowalski', witnessedBy: 'Sarah Chen' },
  { id: 'CON-012', patientId: 'P-008', type: 'treatment', status: 'active', signedDate: '2023-07-15', expiryDate: '2025-07-15', signedBy: 'Anthony Reyes', witnessedBy: 'Maria Rodriguez' },
  { id: 'CON-013', patientId: 'P-009', type: 'treatment', status: 'active', signedDate: '2023-10-05', expiryDate: '2025-10-05', signedBy: 'Sophia Andersen', witnessedBy: 'Sarah Chen' },
  { id: 'CON-014', patientId: 'P-010', type: 'treatment', status: 'expired', signedDate: '2022-12-01', expiryDate: '2023-12-01', signedBy: 'William Abernathy', witnessedBy: 'Robert Kim' },
  { id: 'CON-015', patientId: 'P-011', type: 'treatment', status: 'active', signedDate: '2023-04-18', expiryDate: '2025-04-18', signedBy: 'Chen Liu', witnessedBy: 'Sarah Chen' },
  { id: 'CON-016', patientId: 'P-012', type: 'treatment', status: 'active', signedDate: '2022-08-12', expiryDate: '2024-08-12', signedBy: 'Rosa Delgado', witnessedBy: 'Maria Rodriguez' },
  { id: 'CON-017', patientId: 'P-013', type: 'treatment', status: 'pending', signedDate: '2024-02-20', expiryDate: '2026-02-20', signedBy: '', witnessedBy: '' },
  { id: 'CON-018', patientId: 'P-014', type: 'treatment', status: 'active', signedDate: '2022-10-30', expiryDate: '2024-10-30', signedBy: 'Janet Priceworth', witnessedBy: 'Sarah Chen' },
  { id: 'CON-019', patientId: 'P-015', type: 'treatment', status: 'active', signedDate: '2023-09-12', expiryDate: '2025-09-12', signedBy: 'Carlos Espinoza', witnessedBy: 'Maria Rodriguez' },
  { id: 'CON-020', patientId: 'P-016', type: 'treatment', status: 'active', signedDate: '2023-05-28', expiryDate: '2025-05-28', signedBy: 'Nadia Petrov', witnessedBy: 'Robert Kim' },
]
