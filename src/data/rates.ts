export type RateEntityType = "COMPANY" | "AGENT";

export interface ProviderRate {
  id: string;
  name: string;
  serviceCode: string;
  type: RateEntityType;
  rate: number;
  unitsPerHour: number;
  active: boolean;
}

export const rates: ProviderRate[] = [
  {
    id: "RATE-001",
    name: "Default",
    serviceCode: "H0036",
    type: "AGENT",
    rate: 13.25,
    unitsPerHour: 1,
    active: true,
  },
  {
    id: "RATE-002",
    name: "Default",
    serviceCode: "H0036",
    type: "COMPANY",
    rate: 18.5,
    unitsPerHour: 1,
    active: true,
  },
];
