"use client";

type Row = {
  parent: string;
  description: string;
  quantity: number;
  units: string;
  trips: number | null;
};

export function WorksheetActions({
  projectName,
  rows,
}: {
  projectName: string;
  rows: Row[];
}) {
  function toCsv() {
    const header = ["Parent", "Description", "Quantity", "Units", "Trips"];
    const lines = [
      header.join(","),
      ...rows.map((r) =>
        [
          csv(r.parent),
          csv(r.description),
          r.quantity,
          csv(r.units),
          r.trips ?? "",
        ].join(",")
      ),
    ];
    return lines.join("\n");
  }

  function csv(v: string) {
    if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
    return v;
  }

  function download() {
    const blob = new Blob([toCsv()], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, "_")}_worksheet.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copy() {
    const text = rows
      .map(
        (r) =>
          `${r.parent}\t${r.description}\t${r.quantity}\t${r.units}\t${r.trips ?? ""}`
      )
      .join("\n");
    const header = "Parent\tDescription\tQuantity\tUnits\tTrips\n";
    await navigator.clipboard.writeText(header + text);
    alert("Copied tab-separated worksheet to clipboard");
  }

  return (
    <div className="no-print mb-4 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={download}
        className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
      >
        Export CSV
      </button>
      <button
        type="button"
        onClick={copy}
        className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
      >
        Copy table
      </button>
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
      >
        Print
      </button>
    </div>
  );
}
