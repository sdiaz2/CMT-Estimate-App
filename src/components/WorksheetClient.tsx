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
    <div className="no-print mb-5 flex flex-wrap gap-2.5">
      <button type="button" onClick={download} className="btn-primary text-sm">
        Export CSV
      </button>
      <button type="button" onClick={copy} className="btn-secondary text-sm">
        Copy table
      </button>
      <button
        type="button"
        onClick={() => window.print()}
        className="btn-secondary text-sm"
      >
        Print
      </button>
    </div>
  );
}
