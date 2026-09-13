import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type CatalogSeed = {
  name: string;
  sortOrder: number;
  category: string;
  relatedHints: string[];
  defaultDrivers: Record<string, number | string>;
  templates: {
    description: string;
    units: string;
    isLab?: boolean;
    includesOT?: boolean;
    includesVehicle?: boolean;
    sortOrder?: number;
    qtyHint?: string;
  }[];
};

const catalog: CatalogSeed[] = [
  {
    name: "Project Administration",
    sortOrder: 1,
    category: "admin",
    relatedHints: [],
    defaultDrivers: { hours: 8 },
    templates: [
      { description: "Project Administration", units: "hours", qtyHint: "hours driver", sortOrder: 1 },
    ],
  },
  {
    name: "Earthwork Sample Pickups",
    sortOrder: 2,
    category: "field",
    relatedHints: ["Earthwork Testing & Observations", "Laboratory Testing"],
    defaultDrivers: { trips: 6, vehicleTrips: 6, samples: 6 },
    templates: [
      { description: "Sample Pickup", units: "each", qtyHint: "trips", sortOrder: 1 },
      { description: "Vehicle Charge", units: "each", includesVehicle: true, qtyHint: "vehicleTrips", sortOrder: 2 },
    ],
  },
  {
    name: "Earthwork Testing & Observations",
    sortOrder: 3,
    category: "field",
    relatedHints: ["Earthwork Sample Pickups", "Laboratory Testing"],
    defaultDrivers: { trips: 12, hours: 48, otHours: 7, gaugeDays: 12, vehicleTrips: 12, days: 12 },
    templates: [
      { description: "Soils Testing", units: "hours", qtyHint: "hours", sortOrder: 1 },
      { description: "Soils Testing (OT)", units: "hours", includesOT: true, qtyHint: "otHours", sortOrder: 2 },
      { description: "Nuclear Density Gauge", units: "day", qtyHint: "gaugeDays", sortOrder: 3 },
      { description: "Vehicle Charge", units: "each", includesVehicle: true, qtyHint: "vehicleTrips", sortOrder: 4 },
    ],
  },
  {
    name: "CIP Deep Foundations (Drilled Straight Shaft Piers)",
    sortOrder: 4,
    category: "field",
    relatedHints: ["Laboratory Testing", "Concrete Sample Pickups"],
    defaultDrivers: { trips: 8, hours: 32, otHours: 4, vehicleTrips: 8, samples: 8 },
    templates: [
      { description: "Foundation Inspection", units: "hours", qtyHint: "hours", sortOrder: 1 },
      { description: "Foundation Inspection (OT)", units: "hours", includesOT: true, qtyHint: "otHours", sortOrder: 2 },
      { description: "Vehicle Charge", units: "each", includesVehicle: true, qtyHint: "vehicleTrips", sortOrder: 3 },
    ],
  },
  {
    name: "Concrete Testing & Reinforcing Steel Observations",
    sortOrder: 5,
    category: "field",
    relatedHints: ["Concrete Sample Pickups", "Laboratory Testing"],
    defaultDrivers: { trips: 15, hours: 45, otHours: 6, vehicleTrips: 15, samples: 15, cylindersPerSample: 4 },
    templates: [
      { description: "Concrete Testing", units: "hours", qtyHint: "hours", sortOrder: 1 },
      { description: "Concrete Testing (OT)", units: "hours", includesOT: true, qtyHint: "otHours", sortOrder: 2 },
      { description: "Vehicle Charge", units: "each", includesVehicle: true, qtyHint: "vehicleTrips", sortOrder: 3 },
    ],
  },
  {
    name: "Concrete Sample Pickups",
    sortOrder: 6,
    category: "field",
    relatedHints: ["Concrete Testing & Reinforcing Steel Observations", "Laboratory Testing"],
    defaultDrivers: { trips: 10, vehicleTrips: 10, samples: 10 },
    templates: [
      { description: "Sample Pickup", units: "each", qtyHint: "trips", sortOrder: 1 },
      { description: "Vehicle Charge", units: "each", includesVehicle: true, qtyHint: "vehicleTrips", sortOrder: 2 },
    ],
  },
  {
    name: "Asphalt Testing",
    sortOrder: 7,
    category: "field",
    relatedHints: ["Laboratory Testing"],
    defaultDrivers: { trips: 5, hours: 20, vehicleTrips: 5 },
    templates: [
      { description: "Asphalt Testing", units: "hours", qtyHint: "hours", sortOrder: 1 },
      { description: "Vehicle Charge", units: "each", includesVehicle: true, qtyHint: "vehicleTrips", sortOrder: 2 },
    ],
  },
  {
    name: "Post-Installed Anchor Observation",
    sortOrder: 8,
    category: "field",
    relatedHints: [],
    defaultDrivers: { trips: 3, hours: 12, vehicleTrips: 3 },
    templates: [
      { description: "Post-Installed Anchor Observation", units: "hours", qtyHint: "hours", sortOrder: 1 },
      { description: "Vehicle Charge", units: "each", includesVehicle: true, qtyHint: "vehicleTrips", sortOrder: 2 },
    ],
  },
  {
    name: "Masonry Testing & Observations",
    sortOrder: 9,
    category: "field",
    relatedHints: ["Masonry Sample Pickups", "Laboratory Testing"],
    defaultDrivers: { trips: 6, hours: 24, vehicleTrips: 6, samples: 6 },
    templates: [
      { description: "Masonry Testing & Observations", units: "hours", qtyHint: "hours", sortOrder: 1 },
      { description: "Vehicle Charge", units: "each", includesVehicle: true, qtyHint: "vehicleTrips", sortOrder: 2 },
    ],
  },
  {
    name: "High-Strength Grout Testing & Observations",
    sortOrder: 10,
    category: "field",
    relatedHints: ["Laboratory Testing"],
    defaultDrivers: { trips: 4, hours: 12, vehicleTrips: 4, samples: 4 },
    templates: [
      { description: "High-Strength Grout Testing", units: "hours", qtyHint: "hours", sortOrder: 1 },
      { description: "Vehicle Charge", units: "each", includesVehicle: true, qtyHint: "vehicleTrips", sortOrder: 2 },
    ],
  },
  {
    name: "Masonry Sample Pickups",
    sortOrder: 11,
    category: "field",
    relatedHints: ["Masonry Testing & Observations", "Laboratory Testing"],
    defaultDrivers: { trips: 4, vehicleTrips: 4, samples: 4 },
    templates: [
      { description: "Sample Pickup", units: "each", qtyHint: "trips", sortOrder: 1 },
      { description: "Vehicle Charge", units: "each", includesVehicle: true, qtyHint: "vehicleTrips", sortOrder: 2 },
    ],
  },
  {
    name: "Floor Flatness Testing & Observations",
    sortOrder: 12,
    category: "field",
    relatedHints: [],
    defaultDrivers: { trips: 2, hours: 16, days: 2, vehicleTrips: 2 },
    templates: [
      { description: "Floor Flatness Testing & Observations", units: "hours", qtyHint: "hours", sortOrder: 1 },
      { description: "Vehicle Charge", units: "each", includesVehicle: true, qtyHint: "vehicleTrips", sortOrder: 2 },
    ],
  },

  {
    name: "Post-Tension Testing & Observations",
    sortOrder: 13,
    category: "field",
    relatedHints: ["Concrete Testing & Reinforcing Steel Observations", "Laboratory Testing"],
    defaultDrivers: { trips: 6, hours: 24, otHours: 3.6, vehicleTrips: 6 },
    templates: [
      { description: "Post-Tension Testing & Observations", units: "hours", qtyHint: "hours (trips × ~4 hr; trips = 2 × pours)", sortOrder: 1 },
      { description: "Vehicle Charge", units: "each", includesVehicle: true, qtyHint: "vehicleTrips", sortOrder: 2 },
    ],
  },
  {
    name: "Structural Steel Inspections",
    sortOrder: 14,
    category: "field",
    relatedHints: [],
    defaultDrivers: { trips: 6, hours: 24, vehicleTrips: 6 },
    templates: [
      { description: "Structural Steel Inspections", units: "hours", qtyHint: "hours", sortOrder: 1 },
      { description: "Vehicle Charge", units: "each", includesVehicle: true, qtyHint: "vehicleTrips", sortOrder: 2 },
    ],
  },
  {
    // Optional breakout — add only if bolting is scoped separately from primary Structural Steel Inspections
    name: "Structural Steel (Bolting)",
    sortOrder: 15,
    category: "field",
    relatedHints: [],
    defaultDrivers: { trips: 5, hours: 20, vehicleTrips: 5 },
    templates: [
      { description: "Structural Steel Bolting Observation", units: "hours", qtyHint: "Optional breakout — add only if scoped separately from Structural Steel Inspections", sortOrder: 1 },
      { description: "Vehicle Charge", units: "each", includesVehicle: true, qtyHint: "vehicleTrips", sortOrder: 2 },
    ],
  },
  {
    // Optional breakout — add only if welding is scoped separately from primary Structural Steel Inspections
    name: "Structural Steel (Welding)",
    sortOrder: 16,
    category: "field",
    relatedHints: [],
    defaultDrivers: { trips: 5, hours: 20, vehicleTrips: 5 },
    templates: [
      { description: "Structural Steel Welding Observation", units: "hours", qtyHint: "Optional breakout — add only if scoped separately from Structural Steel Inspections", sortOrder: 1 },
      { description: "Vehicle Charge", units: "each", includesVehicle: true, qtyHint: "vehicleTrips", sortOrder: 2 },
    ],
  },
  {
    // Optional breakout — add only if NDT is scoped separately from primary Structural Steel Inspections
    name: "Structural Steel (NDT)",
    sortOrder: 17,
    category: "field",
    relatedHints: [],
    defaultDrivers: { trips: 3, hours: 12, vehicleTrips: 3 },
    templates: [
      { description: "Structural Steel NDT", units: "hours", qtyHint: "Optional breakout — add only if scoped separately from Structural Steel Inspections", sortOrder: 1 },
      { description: "Vehicle Charge", units: "each", includesVehicle: true, qtyHint: "vehicleTrips", sortOrder: 2 },
    ],
  },
  {
    name: "Fire-resistant (Penetrations & joints) Testing & Observations",
    sortOrder: 18,
    category: "field",
    relatedHints: [],
    defaultDrivers: { trips: 4, hours: 16, vehicleTrips: 4 },
    templates: [
      { description: "Firestopping Observation", units: "hours", qtyHint: "hours", sortOrder: 1 },
      { description: "Vehicle Charge", units: "each", includesVehicle: true, qtyHint: "vehicleTrips", sortOrder: 2 },
    ],
  },
  {
    name: "Vapor Emission Testing",
    sortOrder: 19,
    category: "field",
    relatedHints: [],
    defaultDrivers: { trips: 2, hours: 8, vehicleTrips: 2 },
    templates: [
      { description: "Vapor Emission Testing", units: "hours", qtyHint: "hours", sortOrder: 1 },
      { description: "Vehicle Charge", units: "each", includesVehicle: true, qtyHint: "vehicleTrips", sortOrder: 2 },
    ],
  },
  {
    name: "EIFS Observations (Lumpsum)",
    sortOrder: 20,
    category: "field",
    relatedHints: [],
    defaultDrivers: { trips: 1, hours: 0 },
    templates: [
      { description: "EIFS Observations (Lumpsum)", units: "each", qtyHint: "typically 1 lumpsum", sortOrder: 1 },
    ],
  },
  {
    name: "Laboratory Testing",
    sortOrder: 21,
    category: "lab",
    relatedHints: [],
    defaultDrivers: {},
    templates: [
      { description: "Compressive Strength (Concrete)", units: "tests", isLab: true, qtyHint: "samples × cylinders", sortOrder: 1 },
      { description: "Compressive Strength (Grout)", units: "tests", isLab: true, sortOrder: 2 },
      { description: "Compressive Strength (Mortar)", units: "tests", isLab: true, sortOrder: 3 },
      { description: "Atterberg Limits", units: "tests", isLab: true, sortOrder: 4 },
      { description: "Proctor / Lab Compaction", units: "tests", isLab: true, sortOrder: 5 },
      { description: "Sieve Analysis", units: "tests", isLab: true, sortOrder: 6 },
      { description: "Wash #200", units: "tests", isLab: true, sortOrder: 7 },
      { description: "Asphalt Bulk Density", units: "tests", isLab: true, sortOrder: 8 },
    ],
  },
  {
    name: "Admin support note (8%)",
    sortOrder: 22,
    category: "admin",
    relatedHints: ["Project Administration"],
    defaultDrivers: { hours: 0 },
    templates: [
      {
        description: "Admin Support (8% note)",
        units: "each",
        qtyHint: "Re-key ~8% of technical fees in Pricing Tool",
        sortOrder: 1,
      },
    ],
  },
];

async function main() {
  await prisma.lineItem.deleteMany();
  await prisma.projectParent.deleteMany();
  await prisma.project.deleteMany();
  await prisma.lineTemplate.deleteMany();
  await prisma.parentTaskCatalog.deleteMany();

  for (const c of catalog) {
    const row = await prisma.parentTaskCatalog.create({
      data: {
        name: c.name,
        sortOrder: c.sortOrder,
        category: c.category,
        relatedHints: JSON.stringify(c.relatedHints),
        defaultDrivers: JSON.stringify(c.defaultDrivers),
        lineTemplates: {
          create: c.templates.map((t) => ({
            description: t.description,
            units: t.units,
            isLab: t.isLab ?? false,
            includesOT: t.includesOT ?? false,
            includesVehicle: t.includesVehicle ?? false,
            sortOrder: t.sortOrder ?? 0,
            qtyHint: t.qtyHint ?? "",
          })),
        },
      },
    });
    console.log("Seeded", row.name);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
