"use client";

import { useState, useEffect } from "react";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Crown,
  Medal,
  Star,
  Target,
  ChevronUp,
  ChevronDown,
  Flame,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { PageShell } from "@/components/layout/PageShell";
import { api } from "@/lib/api";

const COLORS = [
  "#10A861",
  "#2E90FA",
  "#875BF7",
  "#F79009",
  "#EC2222",
  "#06AED4",
];

type LeaderboardEntry = {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  spent: number;
  target: number;
  status: "under" | "over";
  avatarColor: string;
  isCurrentUser?: boolean;
};

const fallbackLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    id: "u1",
    name: "Jordan Lee",
    avatar: "JL",
    spent: 62,
    target: 274,
    status: "under",
    avatarColor: "#10A861",
  },
  {
    rank: 2,
    id: "u2",
    name: "Alex Chen",
    avatar: "AC",
    spent: 85,
    target: 274,
    status: "under",
    avatarColor: "#2E90FA",
    isCurrentUser: true,
  },
  {
    rank: 3,
    id: "u3",
    name: "Sam Park",
    avatar: "SP",
    spent: 134,
    target: 274,
    status: "under",
    avatarColor: "#875BF7",
  },
  {
    rank: 4,
    id: "u4",
    name: "Taylor Kim",
    avatar: "TK",
    spent: 198,
    target: 274,
    status: "under",
    avatarColor: "#F79009",
  },
  {
    rank: 5,
    id: "u5",
    name: "Riley Nguyen",
    avatar: "RN",
    spent: 312,
    target: 274,
    status: "over",
    avatarColor: "#EC2222",
  },
  {
    rank: 6,
    id: "u6",
    name: "Morgan Walsh",
    avatar: "MW",
    spent: 0,
    target: 274,
    status: "under",
    avatarColor: "#06AED4",
  },
];

const allTimeLeaderboard = [
  {
    rank: 1,
    name: "Jordan Lee",
    avatar: "JL",
    points: 3120,
    wins: 8,
    color: "#10A861",
  },
  {
    rank: 2,
    name: "Sam Park",
    avatar: "SP",
    points: 2780,
    wins: 7,
    color: "#875BF7",
  },
  {
    rank: 3,
    name: "Alex Chen",
    avatar: "AC",
    points: 2340,
    wins: 6,
    color: "#2E90FA",
    isCurrentUser: true,
  },
  {
    rank: 4,
    name: "Morgan Walsh",
    avatar: "MW",
    points: 1950,
    wins: 5,
    color: "#06AED4",
  },
  {
    rank: 5,
    name: "Taylor Kim",
    avatar: "TK",
    points: 1640,
    wins: 4,
    color: "#F79009",
  },
  {
    rank: 6,
    name: "Riley Nguyen",
    avatar: "RN",
    points: 890,
    wins: 2,
    color: "#EC2222",
  },
];

const fallbackChallenge = {
  name: "Weekend Warrior",
  target: 274,
  deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  reward: 650,
};

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<"current" | "alltime">("current");
  const [extendedLeaderboard, setExtendedLeaderboard] =
    useState(fallbackLeaderboard);
  const [activeChallenge, setActiveChallenge] = useState(fallbackChallenge);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_API_URL) return;
    api
      .getDashboard()
      .then((data) => {
        const list = data.challenges?.list ?? [];
        const lb = data.challenges?.leaderboard ?? [];
        const ch = list[0];
        if (ch && lb.length > 0) {
          setActiveChallenge({
            name: ch.name,
            target: ch.goal,
            deadline: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000
            ).toISOString(),
            reward: 650,
          });
          setExtendedLeaderboard(
            lb.map(
              (
                e: { rank: number; name: string; value: number },
                i: number
              ) => ({
                rank: e.rank,
                id: `u${i + 1}`,
                name: e.name,
                avatar: e.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2),
                spent: e.value,
                target: ch.goal,
                status: (e.value <= ch.goal ? "under" : "over") as "under" | "over",
                avatarColor: COLORS[i % COLORS.length],
                ...(e.name === "You" ? { isCurrentUser: true } : {}),
              })
            )
          );
        }
      })
      .catch(() => {});
  }, []);

  const barData = extendedLeaderboard.map((p) => ({
    name: p.name.split(" ")[0],
    spent: p.spent,
    target: p.target,
    color: p.avatarColor,
    isCurrentUser: "isCurrentUser" in p && p.isCurrentUser,
  }));

  const getRankIcon = (rank: number) => {
    if (rank === 1)
      return (
        <Crown className="w-4 h-4 text-warning-strong fill-warning-strong" />
      );
    if (rank === 2)
      return <Medal className="w-4 h-4 text-gray-400 fill-gray-400" />;
    if (rank === 3)
      return <Medal className="w-4 h-4 text-warning fill-warning" />;
    return (
      <span className="text-sm text-gray-500 w-4 text-center font-bold font-mono">
        {rank}
      </span>
    );
  };

  const daysRemaining = Math.ceil(
    (new Date(activeChallenge.deadline).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <PageShell>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Hero Banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-accent-blue/15 via-accent-purple/10 to-surface-1 border border-accent-blue/10 rounded-2xl p-6 animate-fade-up">
          <div className="absolute -top-10 -right-10 w-44 h-44 bg-accent-blue/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-8 w-52 h-52 bg-accent-purple/5 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-warning-strong fill-warning-strong" />
                  <span className="text-sm text-gray-400 font-semibold">
                    Active Group Challenge
                  </span>
                </div>
                <h2 className="text-white text-xl font-extrabold tracking-tight mb-1">
                  {activeChallenge.name}
                </h2>
                <p className="text-sm text-gray-400 font-medium">
                  Target: Stay under ${activeChallenge.target} this weekend
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl text-white font-extrabold font-mono tabular-nums">
                  {daysRemaining}d
                </div>
                <p className="text-xs text-gray-500 font-semibold">
                  remaining
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <div className="flex -space-x-2">
                {extendedLeaderboard.slice(0, 5).map((p) => (
                  <div
                    key={p.id}
                    className="w-8 h-8 rounded-full border-2 border-surface-1 flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: p.avatarColor }}
                  >
                    {p.avatar}
                  </div>
                ))}
              </div>
              <span className="text-sm text-gray-400 font-medium">
                {extendedLeaderboard.length} participants
              </span>
              <div className="ml-auto flex items-center gap-1.5">
                <Star className="w-4 h-4 text-warning-strong fill-warning-strong" />
                <span className="text-sm text-warning-strong font-bold">
                  {activeChallenge.reward} pts prize
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Toggle */}
        <div
          className="flex gap-1 bg-surface-2 p-1 rounded-lg w-fit animate-fade-up"
          style={{ animationDelay: "60ms" }}
        >
          {(["current", "alltime"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                activeTab === tab
                  ? "bg-surface-4 text-white shadow-border-xs"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab === "current" ? "Current Challenge" : "All-Time Rankings"}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-up"
          style={{ animationDelay: "120ms" }}
        >
          <div className="lg:col-span-2">
            {activeTab === "current" ? (
              <div className="bg-surface-1 border border-white/[0.06] rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                  <h3 className="text-gray-200 font-bold text-[13px]">
                    Weekend Warrior Rankings
                  </h3>
                  <span className="text-[11px] text-gray-600 bg-surface-3 px-2 py-1 rounded-md font-mono font-medium">
                    Live · Updated now
                  </span>
                </div>
                <div className="divide-y divide-white/[0.04]">
                  {extendedLeaderboard.map((participant) => {
                    const pct = Math.round(
                      (participant.spent / participant.target) * 100
                    );
                    const isCurrentUser =
                      "isCurrentUser" in participant &&
                      participant.isCurrentUser;
                    const isOver = participant.status === "over";
                    return (
                      <div
                        key={participant.id}
                        className={`flex items-center gap-4 px-5 py-4 transition-colors ${
                          isCurrentUser
                            ? "bg-accent-blue-muted"
                            : "hover:bg-white/[0.02]"
                        }`}
                      >
                        <div className="w-6 flex justify-center flex-shrink-0">
                          {getRankIcon(participant.rank)}
                        </div>
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{
                            backgroundColor: participant.avatarColor,
                          }}
                        >
                          {participant.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p
                              className={`text-sm text-gray-100 ${
                                isCurrentUser
                                  ? "font-extrabold"
                                  : "font-semibold"
                              }`}
                            >
                              {participant.name}
                              {isCurrentUser && (
                                <span className="ml-1 text-accent-blue font-bold">
                                  (You)
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="mt-1.5 h-1.5 bg-white/[0.06] rounded-full overflow-hidden w-32">
                            <div
                              className="h-full rounded-full progress-bar"
                              style={{
                                width: `${Math.min(pct, 100)}%`,
                                backgroundColor: isOver
                                  ? "#EC2222"
                                  : participant.avatarColor,
                              }}
                            />
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-white font-bold font-mono tabular-nums">
                            ${participant.spent}
                          </p>
                          <p className="text-[11px] text-gray-600 font-mono">
                            of ${participant.target}
                          </p>
                        </div>
                        <div
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isOver
                              ? "bg-destructive-muted text-destructive border border-destructive/20"
                              : "bg-success-muted text-success border border-success/20"
                          }`}
                        >
                          {isOver ? (
                            <>
                              <TrendingUp className="w-3 h-3" /> over
                            </>
                          ) : (
                            <>
                              <TrendingDown className="w-3 h-3" /> under
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-surface-1 border border-white/[0.06] rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/[0.06]">
                  <h3 className="text-gray-200 font-bold text-[13px]">
                    All-Time Points Leaderboard
                  </h3>
                </div>
                <div className="divide-y divide-white/[0.04]">
                  {allTimeLeaderboard.map((participant) => (
                    <div
                      key={participant.rank}
                      className={`flex items-center gap-4 px-5 py-4 ${
                        participant.isCurrentUser
                          ? "bg-accent-blue-muted"
                          : "hover:bg-white/[0.02]"
                      } transition-colors`}
                    >
                      <div className="w-6 flex justify-center flex-shrink-0">
                        {getRankIcon(participant.rank)}
                      </div>
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: participant.color }}
                      >
                        {participant.avatar}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-sm text-gray-100 ${
                            participant.isCurrentUser
                              ? "font-extrabold"
                              : "font-semibold"
                          }`}
                        >
                          {participant.name}
                          {participant.isCurrentUser && (
                            <span className="ml-1 text-accent-blue font-bold">
                              (You)
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-gray-600 font-medium">
                          {participant.wins} challenge wins
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-warning-strong fill-warning-strong" />
                        <span className="text-sm text-gray-200 font-bold font-mono tabular-nums">
                          {participant.points.toLocaleString()} pts
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Chart */}
            <div className="bg-surface-1 border border-white/[0.06] rounded-xl p-5">
              <h3 className="text-gray-100 font-bold text-sm mb-4">
                Spending Comparison
              </h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={barData}
                  margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                >
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "#737373", fontWeight: 500 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#737373" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      background: "#1c1c20",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 8,
                      color: "#e4e4e7",
                      fontWeight: 600,
                    }}
                    formatter={(v: number) => [`$${v}`, "Spent"]}
                  />
                  <ReferenceLine
                    y={activeChallenge.target}
                    stroke="#EC2222"
                    strokeDasharray="4 4"
                    strokeOpacity={0.5}
                  />
                  <Bar dataKey="spent" radius={4}>
                    {barData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.isCurrentUser ? "#2E90FA" : entry.color}
                        opacity={entry.isCurrentUser ? 1 : 0.7}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-gray-500 font-medium">
                <span className="border-t-2 border-dashed border-destructive w-3" />{" "}
                Target: ${activeChallenge.target}
              </div>
            </div>

            {/* Your Position */}
            <div className="bg-surface-1 border border-white/[0.06] rounded-xl p-5">
              <h3 className="text-gray-100 font-bold text-sm mb-3">
                Your Position
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-accent-blue flex items-center justify-center text-white font-bold">
                  AC
                </div>
                <div>
                  <p className="text-sm text-white font-extrabold">
                    Rank #2 of 6
                  </p>
                  <p className="text-xs text-gray-500 font-mono font-medium">
                    $85 spent · $189 remaining
                  </p>
                </div>
              </div>
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-semibold">
                    vs Jordan Lee (#1)
                  </span>
                  <span className="text-destructive flex items-center gap-1 font-bold font-mono text-xs">
                    <ChevronUp className="w-3.5 h-3.5" /> +$23 behind
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-semibold">
                    vs Sam Park (#3)
                  </span>
                  <span className="text-success flex items-center gap-1 font-bold font-mono text-xs">
                    <ChevronDown className="w-3.5 h-3.5" /> $49 ahead
                  </span>
                </div>
              </div>
            </div>

            {/* AI Tip */}
            <div className="bg-warning-muted border border-warning/15 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-warning" />
                <h3 className="text-warning font-bold text-sm">AI Tip</h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-medium">
                Skip the Jazz Concert this Friday and you&apos;ll jump to{" "}
                <strong className="text-white font-bold">#1</strong> on the
                leaderboard, saving $95 and putting you well under target!
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
