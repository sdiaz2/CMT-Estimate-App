export type Drivers = {
  trips?: number;
  hours?: number;
  otHours?: number;
  days?: number;
  samples?: number;
  cylindersPerSample?: number;
  vehicleTrips?: number;
  gaugeDays?: number;
  notes?: string;
  [key: string]: number | string | undefined;
};

export type RelatedHints = string[];

export const UNIT_OPTIONS = ["hours", "each", "day", "tests"] as const;
export type Unit = (typeof UNIT_OPTIONS)[number];
