"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CreditCard,
  Lock,
  Unlock,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Zap,
  ShieldCheck,
  Plus,
  Minus,
  Wallet,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { PageShell } from "@/components/layout/PageShell";
import { api } from "@/lib/api";
import bankDataJson from "@/mocks/banking.json";

const categoryIcons: Record<string, string> = {
  coffee: "☕",
  transport: "🚗",
  groceries: "🛒",
  income: "💰",
  entertainment: "🎬",
  meal: "🍽️",
};

const categoryColors: Record<string, string> = {
  coffee: "#875BF7",
  transport: "#10A861",
  groceries: "#06AED4",
  income: "#10A861",
  entertainment: "#F79009",
  meal: "#2E90FA",
  other: "#737373",
};

type BankData = {
  accountName: string;
  balance: number;
  vaultAmount: number;
  availableBalance: number;
  transactions: Array<{
    id: string;
    date: string;
    merchant: string;
    category: string;
    amount: number;
    balance: number;
  }>;
  nomiInsights: Array<{
    category: string;
    thisMonth: number;
    lastMonth: number;
    trend: string;
    change: number;
  }>;
};

const fallbackBank = bankDataJson as BankData;

export default function BankingPage() {
  const [balance, setBalance] = useState(fallbackBank.balance);
  const [vaultAmount, setVaultAmount] = useState(fallbackBank.vaultAmount);
  const [vaultInput, setVaultInput] = useState("");
  const [vaultMode, setVaultMode] = useState<"add" | "remove" | null>(null);
  const [showVaultConfirm, setShowVaultConfirm] = useState(false);
  const [loading, setLoading] = useState(!!process.env.NEXT_PUBLIC_API_URL);

  const fetchSummary = useCallback(() => {
    if (!process.env.NEXT_PUBLIC_API_URL) return;
    api
      .bankSummary()
      .then((s) => {
        setBalance(s.total);
        setVaultAmount(s.vaults?.default ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_API_URL) {
      setLoading(false);
      return;
    }
    fetchSummary();
  }, [fetchSummary]);

  const available = balance - vaultAmount;
  const bankData = {
    ...fallbackBank,
    balance,
    vaultAmount,
    availableBalance: available,
  };

  const handleVaultChange = (mode: "add" | "remove") => {
    const amt = parseFloat(vaultInput);
    if (isNaN(amt) || amt <= 0) return;
    if (process.env.NEXT_PUBLIC_API_URL) {
      const fn = mode === "add" ? api.bankLock : api.bankUnlock;
      fn(amt, "default", mode === "add" ? "savings" : "withdrawal")
        .then((res) => {
          if (res.ok !== false) {
            setShowVaultConfirm(true);
            setTimeout(() => setShowVaultConfirm(false), 3000);
            fetchSummary();
          }
        })
        .catch(() => {});
    } else {
      if (mode === "add") {
        setVaultAmount((prev) => Math.min(prev + amt, balance));
      } else {
        setVaultAmount((prev) => Math.max(prev - amt, 0));
      }
      setShowVaultConfirm(true);
      setTimeout(() => setShowVaultConfirm(false), 3000);
    }
    setVaultInput("");
    setVaultMode(null);
  };

  const nomiChartData = bankData.nomiInsights.map((insight) => ({
    name: insight.category.replace(" ", "\n"),
    thisMonth: insight.thisMonth,
    lastMonth: insight.lastMonth,
  }));

  if (loading && process.env.NEXT_PUBLIC_API_URL) {
    return (
      <PageShell>
        <div className="p-6 flex items-center justify-center min-h-[200px]">
          <p className="text-gray-500 text-sm font-medium">
            Loading bank summary...
          </p>
        </div>
      </PageShell>
    );
  }

  const vaultPercent = Math.round((vaultAmount / bankData.balance) * 100);
  const availPercent = 100 - vaultPercent;

  return (
    <PageShell>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div
          className="flex items-center justify-between animate-fade-up"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-blue/20 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-accent-blue" />
            </div>
            <div>
              <h2 className="text-white text-lg font-bold tracking-tight">
                RBC Banking
              </h2>
              <p className="text-sm text-gray-500 font-medium">
                Mock integration · Nomi-enhanced
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-accent-blue-muted border border-accent-blue/20 px-3 py-1.5 rounded-full">
            <div className="w-1.5 h-1.5 bg-accent-blue rounded-full animate-pulse" />
            <span className="text-xs text-accent-blue font-semibold">
              Live sync
            </span>
          </div>
        </div>

        {/* Balance Cards */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-fade-up"
          style={{ animationDelay: "60ms" }}
        >
          {/* Total Balance */}
          <div className="relative overflow-hidden bg-gradient-to-br from-accent-blue/20 via-surface-2 to-surface-1 border border-accent-blue/15 rounded-xl p-5">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent-blue/5 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <Wallet className="w-4 h-4 text-gray-400" />
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                  {bankData.accountName}
                </p>
              </div>
              <div className="text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
                $
                {bankData.balance.toLocaleString("en-CA", {
                  minimumFractionDigits: 2,
                })}
              </div>
              <p className="text-sm text-gray-500 mt-1 font-semibold">
                Total Balance
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-blue rounded-full progress-bar"
                    style={{ width: `${availPercent}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 font-mono font-semibold tabular-nums">
                  {availPercent}% free
                </span>
              </div>
            </div>
          </div>

          {/* Available */}
          <div className="bg-surface-1 border border-white/[0.06] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-success-muted rounded-lg flex items-center justify-center">
                <Unlock className="w-4 h-4 text-success" />
              </div>
              <span className="text-sm text-gray-400 font-semibold">
                Available
              </span>
            </div>
            <div className="text-2xl text-white font-extrabold font-mono tabular-nums">
              $
              {available.toLocaleString("en-CA", {
                minimumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              Free to spend
            </p>
          </div>

          {/* Vault */}
          <div className="bg-surface-1 border border-success/10 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-success-muted rounded-lg flex items-center justify-center">
                <Lock className="w-4 h-4 text-success" />
              </div>
              <span className="text-sm text-gray-400 font-semibold">
                Savings Vault
              </span>
            </div>
            <div className="text-2xl text-success font-extrabold font-mono tabular-nums">
              $
              {vaultAmount.toLocaleString("en-CA", {
                minimumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              Locked for savings
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-up"
          style={{ animationDelay: "120ms" }}
        >
          {/* Transactions */}
          <div className="lg:col-span-2 bg-surface-1 border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <h3 className="text-[13px] text-gray-200 font-bold">
                Recent Transactions
              </h3>
              <span className="text-[11px] text-gray-600 font-mono">
                Last 8 transactions
              </span>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {bankData.transactions.map((tx) => {
                const isIncome = tx.amount > 0;
                const icon = categoryIcons[tx.category] || "💳";
                const color = categoryColors[tx.category] || "#737373";
                return (
                  <div
                    key={tx.id}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                      style={{ backgroundColor: color + "18" }}
                    >
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-100 font-semibold">
                        {tx.merchant}
                      </p>
                      <p className="text-[11px] text-gray-600 mt-0.5 font-mono">
                        {tx.date} · {tx.category}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p
                          className={`text-sm font-bold font-mono tabular-nums ${
                            isIncome ? "text-success" : "text-gray-100"
                          }`}
                        >
                          {isIncome ? "+" : ""}$
                          {Math.abs(tx.amount).toFixed(2)}
                        </p>
                        <p className="text-[11px] text-gray-600 font-mono tabular-nums">
                          bal: ${tx.balance.toFixed(2)}
                        </p>
                      </div>
                      {isIncome ? (
                        <ArrowDownLeft className="w-4 h-4 text-success flex-shrink-0" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Vault Card */}
            <div className="bg-surface-1 border border-white/[0.06] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-success" />
                <h3 className="text-gray-100 font-bold text-sm">
                  Savings Vault
                </h3>
              </div>

              {showVaultConfirm && (
                <div className="mb-3 bg-success-muted border border-success/20 rounded-lg p-2.5 text-xs text-success font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Vault updated
                  successfully!
                </div>
              )}

              <div className="relative flex justify-center mb-4">
                <div className="w-28 h-28 relative">
                  <svg
                    viewBox="0 0 36 36"
                    className="w-28 h-28 -rotate-90"
                  >
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#10A861"
                      strokeWidth="3"
                      strokeDasharray={`${vaultPercent}, 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Lock className="w-4 h-4 text-success mb-0.5" />
                    <span className="text-sm text-success font-extrabold font-mono">
                      {vaultPercent}%
                    </span>
                    <span className="text-[10px] text-gray-600 font-medium">
                      locked
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-center mb-4">
                <p className="text-lg text-success font-extrabold font-mono tabular-nums">
                  $
                  {vaultAmount.toLocaleString("en-CA", {
                    minimumFractionDigits: 2,
                  })}
                </p>
                <p className="text-xs text-gray-500 font-medium">
                  locked in vault
                </p>
              </div>

              <div className="flex gap-2 mb-3">
                <button
                  onClick={() =>
                    setVaultMode(vaultMode === "add" ? null : "add")
                  }
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold border transition-all ${
                    vaultMode === "add"
                      ? "bg-success text-white border-success"
                      : "bg-success-muted text-success border-success/20 hover:bg-success/20"
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" /> Lock
                </button>
                <button
                  onClick={() =>
                    setVaultMode(vaultMode === "remove" ? null : "remove")
                  }
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold border transition-all ${
                    vaultMode === "remove"
                      ? "bg-warning text-white border-warning"
                      : "bg-warning-muted text-warning border-warning/20 hover:bg-warning/20"
                  }`}
                >
                  <Minus className="w-3.5 h-3.5" /> Unlock
                </button>
              </div>

              {vaultMode && (
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={vaultInput}
                    onChange={(e) => setVaultInput(e.target.value)}
                    placeholder="Amount"
                    className="flex-1 border border-white/[0.08] bg-surface-3 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-accent-blue/40 font-mono"
                  />
                  <button
                    onClick={() => handleVaultChange(vaultMode)}
                    className="px-4 py-2 bg-accent-blue text-white rounded-lg text-sm font-bold hover:bg-accent-blue/80 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* Nomi Insights */}
            <div className="bg-surface-1 border border-white/[0.06] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-accent-blue" />
                <h3 className="text-gray-100 font-bold text-sm">
                  Nomi Insights
                </h3>
              </div>
              <p className="text-[11px] text-gray-600 mb-4 font-medium">
                This month vs last month
              </p>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart
                  data={nomiChartData}
                  margin={{ top: 0, right: 0, left: -25, bottom: 0 }}
                >
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 9, fill: "#737373", fontWeight: 500 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: "#737373" }}
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
                    formatter={(v: number) => [`$${v}`, ""]}
                  />
                  <Bar
                    dataKey="lastMonth"
                    fill="rgba(255,255,255,0.08)"
                    radius={4}
                    name="Last Month"
                  />
                  <Bar
                    dataKey="thisMonth"
                    fill="#2E90FA"
                    radius={4}
                    name="This Month"
                  />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2.5">
                {bankData.nomiInsights.map((insight) => (
                  <div
                    key={insight.category}
                    className="flex items-center justify-between"
                  >
                    <span className="text-xs text-gray-400 font-semibold">
                      {insight.category}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {insight.trend === "down" ? (
                        <TrendingDown className="w-3 h-3 text-success" />
                      ) : (
                        <TrendingUp className="w-3 h-3 text-destructive" />
                      )}
                      <span
                        className={`text-xs font-bold font-mono tabular-nums ${
                          insight.trend === "down"
                            ? "text-success"
                            : "text-destructive"
                        }`}
                      >
                        {insight.change > 0 ? "+" : ""}
                        {insight.change}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
