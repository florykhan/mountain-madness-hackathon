import Link from "next/link";
import { ArrowLeft, Trophy, Fire } from "@phosphor-icons/react/dist/ssr";
import { PageShell } from "@/components/layout/PageShell";
import { Leaderboard } from "@/components/challenges/Leaderboard";
import { BadgesGrid } from "@/components/challenges/BadgesGrid";
import { formatCurrency } from "@/lib/format";
import { formatDate } from "@/lib/format";
import challengesData from "@/mocks/challenges.json";

interface Params {
  params: Promise<{ id: string }>;
}

export default async function ChallengeDetailPage({ params }: Params) {
  const { id } = await params;
  const data = challengesData as {
    list: {
      id: string;
      name: string;
      goal: number;
      unit: string;
      endDate: string;
      participants: number;
      joined?: boolean;
      progress?: number;
      streak?: number;
      description?: string;
    }[];
    leaderboard: { rank: number; name: string; value: number }[];
    badges: { id: string; name: string; description: string; earned: boolean; icon: string }[];
  };

  const challenge = data.list.find((c) => c.id === id) || data.list[0];
  const pct = challenge.goal > 0 ? Math.min(100, ((challenge.progress || 0) / challenge.goal) * 100) : 0;

  function formatGoal(goal: number, unit: string) {
    if (unit === "CAD" || unit === "USD") return formatCurrency(goal);
    return `${goal} ${unit}`;
  }

  return (
    <PageShell>
      <div className="p-6 lg:p-8 space-y-6">
        <Link
          href="/challenges"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-200 transition-colors font-medium"
        >
          <ArrowLeft size={18} weight="bold" />
          Back to challenges
        </Link>

        {/* Hero */}
        <div className="bg-surface-1 border border-white/[0.06] rounded-xl p-5 animate-fade-up">
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={20} weight="fill" className="text-warning-strong" />
            <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Challenge Details</span>
          </div>
          <h1 className="text-zinc-100 text-xl font-semibold tracking-tight mb-1">
            {challenge.name}
          </h1>
          {challenge.description && (
            <p className="text-sm text-zinc-400">{challenge.description}</p>
          )}
          <p className="mt-2 text-sm text-zinc-500">
            Goal: {formatGoal(challenge.goal, challenge.unit)} · Ends {formatDate(challenge.endDate)}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 animate-fade-up" style={{ animationDelay: "60ms" }}>
          <div className="space-y-4">
            {/* Progress Card */}
            <div className="bg-surface-1 border border-white/[0.06] rounded-xl p-4">
              <h3 className="mb-3 font-semibold text-zinc-100 text-sm">Your Progress</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-accent-blue progress-bar"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm text-gray-400 font-medium">
                      {formatGoal(challenge.progress || 0, challenge.unit)} / {formatGoal(challenge.goal, challenge.unit)}
                    </p>
                    <span className="text-sm text-white font-bold font-mono tabular-nums">
                      {Math.round(pct)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Streak Card */}
            {challenge.streak != null && (
              <div className="bg-surface-1 border border-white/[0.06] rounded-xl p-4">
                <h3 className="mb-2 font-semibold text-zinc-100 text-sm">Streak</h3>
                <div className="flex items-center gap-2">
                  <Fire size={20} weight="fill" className="text-warning" />
                  <p className="text-2xl font-semibold text-warning font-mono tabular-nums">{challenge.streak} days</p>
                </div>
              </div>
            )}

            <Leaderboard
              entries={data.leaderboard}
              valueLabel="saved"
              valueFormat={(v) => `$${v}`}
            />
          </div>
          <div>
            <BadgesGrid badges={data.badges} />
          </div>
        </div>
      </div>
    </PageShell>
  );
}
