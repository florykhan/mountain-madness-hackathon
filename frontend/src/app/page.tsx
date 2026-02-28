import Link from "next/link";
import { Calendar, Upload, ArrowRight, CheckCircle2 } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { ScrollArrow } from "@/components/landing/ScrollArrow";
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
      {/* Dark wrapper: no white at edges or when scrolling to end */}
      <div className="relative min-h-screen w-full min-w-full overflow-x-hidden bg-slate-950">
        {/* Fixed background: full viewport, no white margins (sides / top / bottom) */}
        <div
          className="fixed z-0 bg-slate-950"
          style={{
            left: 0,
            top: 0,
            width: "100vw",
            minWidth: "100vw",
            height: "100dvh",
            minHeight: "100vh",
          }}
          aria-hidden
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              minWidth: "100%",
              minHeight: "100%",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
            }}
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
          />
        </div>

        {/* Scrollable content on top */}
        <div className="relative z-10">
          {/* Hero — full viewport height below nav */}
          <section className="relative flex min-h-[calc(100vh-3.5rem)] w-full items-center justify-center px-5 py-20 text-center sm:px-8">
            <ScrollArrow targetId="steps" />
            <div className="flex flex-col items-center justify-center">
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

          {/* Steps — glass panel so background stays visible (like portfolio intro box) */}
          <section id="steps" className="scroll-mt-20 px-4 py-16 sm:px-6">
            <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-slate-900/50 p-6 shadow-xl backdrop-blur-xl sm:p-8">
              <h2 className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Get started in 3 steps
              </h2>
              <p className="mt-3 text-center text-slate-300">
                Set up once and see your spending forecast.
              </p>
              <div className="mt-10 grid gap-5 sm:grid-cols-1">
                {STEPS.map((step, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-5 rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition hover:bg-white/10"
                  >
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary-500/20 text-lg font-bold text-primary-300">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-white">{step.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-300">{step.body}</p>
                    </div>
                    <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-primary-400" />
                  </div>
                ))}
              </div>
              <div className="mt-10 flex justify-center">
                <Link
                  href="/dashboard"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-base font-semibold text-slate-900 shadow-lg transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                  Go to Dashboard
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
