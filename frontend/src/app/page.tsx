import Link from "next/link";
import { Calendar, Upload, ArrowRight, CheckCircle2 } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { TAGLINE } from "@/lib/constants";

const STEPS = [
  {
    title: "Connect your calendars",
    body: "Link work, personal, and social calendars so we can predict spending triggers.",
  },
  {
    title: "Upload or link transactions",
    body: "Optional CSV upload or connect your bank for accurate insights.",
  },
  {
    title: "See your forecast & join challenges",
    body: "Get a 7-day spending forecast, insights, and savings challenges with friends.",
  },
];

export default function HomePage() {
  return (
    <PageShell withSidebar={false}>
      <div className="w-full min-w-full overflow-x-hidden bg-slate-950">
        {/* Hero — video background, consistent overlay */}
        <section className="relative min-h-[calc(100vh-3.5rem)] w-full flex items-center justify-center overflow-hidden bg-slate-950">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
            style={{ minWidth: "100%", minHeight: "100%", objectFit: "cover" }}
            aria-hidden
          >
            <source src="/background.mov" type="video/quicktime" />
          </video>
          <div className="absolute inset-0 bg-slate-900/55" />
          <div
            className="absolute inset-0 mix-blend-overlay opacity-40"
            style={{
              background:
                "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(52, 211, 153, 0.3), transparent 65%), linear-gradient(180deg, rgba(16, 185, 129, 0.12) 0%, transparent 45%)",
            }}
            aria-hidden
          />

          <div className="relative z-10 flex flex-col items-center justify-center px-5 py-20 text-center sm:px-8">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl md:leading-tight [text-shadow:0_2px_20px_rgba(0,0,0,0.3)]">
              {TAGLINE}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-200 sm:text-xl [text-shadow:0_1px_10px_rgba(0,0,0,0.25)]">
              Turn your calendar into a spending forecast. Get insights, stay on budget, and win
              challenges with friends.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="inline-flex h-12 items-center justify-center gap-2.5 rounded-xl bg-white px-6 text-base font-semibold text-slate-900 shadow-lg shadow-black/20 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                <Calendar className="h-5 w-5" />
                Connect Calendar (mock)
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex h-12 items-center justify-center gap-2.5 rounded-xl border border-white/30 bg-white/5 px-6 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                <Upload className="h-5 w-5" />
                Upload Transactions CSV (mock)
              </Link>
            </div>
            <p className="mt-6 rounded-full bg-white/5 px-4 py-2 text-sm text-slate-400 backdrop-blur-sm">
              Demo mode — data is mocked. Connect real sources in production.
            </p>
          </div>
        </section>

        {/* Steps — same design language: radii, spacing, primary accent */}
        <section className="relative border-t border-slate-800 bg-slate-50 px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Get started in 3 steps
            </h2>
            <p className="mt-3 text-center text-slate-600">
              Set up once and see your spending forecast.
            </p>
            <div className="mt-10 grid gap-5 sm:grid-cols-1">
              {STEPS.map((step, i) => (
                <div
                  key={i}
                  className="flex items-start gap-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary-100 text-lg font-bold text-primary-600">
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{step.body}</p>
                  </div>
                  <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-primary-500" />
                </div>
              ))}
            </div>
            <div className="mt-10 flex justify-center">
              <Link
                href="/dashboard"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 text-base font-semibold text-white shadow-md transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Go to Dashboard
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
