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
      <body className="min-h-screen antialiased text-umber">
        <header className="no-print bg-paper/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
            <a
              href="/"
              className="text-xl font-semibold tracking-tight text-umber"
            >
              CMT Estimate
            </a>
            <nav className="flex items-center gap-4 text-sm text-umber-muted">
              <a href="/" className="hover:text-umber transition-colors">
                Projects
              </a>
              <span className="rounded-full bg-sage-soft px-3 py-1 text-xs font-medium text-olive">
                v1 MVP
              </span>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
