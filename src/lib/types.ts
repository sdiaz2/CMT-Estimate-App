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

export type LineItem = {
  id: string;
  description: string;
  quantity: number;
  units: string;
  trips: number | null;
  isLab: boolean;
  notes: string;
};

export type ParentState = {
  name: string;
  drivers: Drivers;
  tripsLocked: boolean;
  lines: LineItem[] | null;
};

export type CatalogItem = {
  name: string;
  sortOrder: number;
  category: "admin" | "field" | "lab";
  relatedHints: string[];
  defaultDrivers: Drivers;
  blurb: string;
};
