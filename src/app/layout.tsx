import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CMT Estimate App",
  description: "CMET / materials testing fee estimating MVP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <header className="no-print border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <a href="/" className="text-lg font-semibold tracking-tight text-slate-900">
              CMT Estimate
            </a>
            <nav className="flex items-center gap-4 text-sm text-slate-600">
              <a href="/" className="hover:text-slate-900">
                Projects
              </a>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                v1 MVP
              </span>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
