import { Navbar } from "./Navbar";

interface PageShellProps {
  children: React.ReactNode;
  /** If true, use app layout (dashboard, calendar, etc.). If false, full-width (landing). */
  withSidebar?: boolean;
}

export function PageShell({ children, withSidebar = true }: PageShellProps) {
  if (!withSidebar) {
    return (
      <>
        <Navbar />
        <main className="w-full min-w-0 bg-transparent pt-14">{children}</main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-3.5rem)] bg-app-bg">
        <main className="w-full overflow-auto bg-app-bg pt-14">{children}</main>
      </div>
    </>
  );
}
