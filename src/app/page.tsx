import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteProject } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { parents: true } } },
  });

  return (
    <div>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-umber">
            Your projects
          </h1>
          <p className="page-lead mt-2">
            Build a materials-testing estimate step by step, then copy the
            worksheet into Pricing Tool.
          </p>
        </div>
        <Link href="/projects/new" className="btn-primary text-sm">
          Start a new estimate
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <p className="text-lg font-medium text-umber">No estimates yet</p>
          <p className="mt-2 text-umber-muted">
            Start with the project name and location — you can add plan
            quantities next.
          </p>
          <Link href="/projects/new" className="btn-primary mt-6 text-sm">
            Create your first estimate
          </Link>
        </div>
      ) : (
        <div className="table-wrap-soft">
          <table className="table-soft min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-umber-muted">
              <tr>
                <th className="px-5 py-4">Project</th>
                <th className="px-5 py-4">Location</th>
                <th className="px-5 py-4">Scope items</th>
                <th className="px-5 py-4">Last updated</th>
                <th className="px-5 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p, i) => (
                <tr
                  key={p.id}
                  className={i % 2 === 1 ? "bg-sand/25" : undefined}
                >
                  <td className="px-5 py-4 font-medium text-umber">
                    <Link
                      href={`/projects/${p.id}`}
                      className="hover:text-terracotta transition-colors"
                    >
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-umber-muted">
                    {p.location || "—"}
                  </td>
                  <td className="px-5 py-4 text-umber-muted">
                    {p._count.parents}
                  </td>
                  <td className="px-5 py-4 text-umber-faint">
                    {p.updatedAt.toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/projects/${p.id}/worksheet`}
                        className="text-xs font-medium text-terracotta hover:text-terracotta-hover"
                      >
                        Worksheet
                      </Link>
                      <form action={deleteProject.bind(null, p.id)}>
                        <button
                          type="submit"
                          className="text-xs font-medium text-danger hover:opacity-80"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
