/**
 * FutureSpend API client.
 * Base URL: set NEXT_PUBLIC_API_URL in .env.local (e.g. http://localhost:8000).
 */

const getBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL ?? "";
  }
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
};

async function request<T>(
  path: string,
  options: RequestInit & { method?: string; body?: unknown } = {}
): Promise<T> {
  const base = getBaseUrl();
  if (!base) {
    throw new Error("NEXT_PUBLIC_API_URL is not set");
  }
  const url = path.startsWith("http") ? path : `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
  const { method = "GET", body, ...rest } = options;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(rest.headers as HeadersInit),
  };
  const res = await fetch(url, {
    ...rest,
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${method} ${path}: ${res.status} ${text}`);
  }
  if (res.headers.get("content-type")?.includes("application/json")) {
    return res.json() as Promise<T>;
  }
  return undefined as unknown as T;
}

/** Check if the API is available (e.g. backend running). */
export async function healthCheck(): Promise<boolean> {
  try {
    const base = getBaseUrl();
    if (!base) return false;
    const res = await fetch(`${base.replace(/\/$/, "")}/`, { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}

export const api = {
  /** Full dashboard payload (events, forecast, insights, challenges). No auth required. */
  getDashboard: () =>
    request<{
      events: Array<{
        id: string;
        title: string;
        start: string;
        end: string;
        calendarType: string;
        predictedSpend: number;
        category: string;
        why?: string;
      }>;
      forecast: {
        next7DaysTotal: number;
        remainingBudget: number;
        monthlyBudget: number;
        riskScore: string;
        daily?: Array<{ date: string; predictedSpend: number; [k: string]: unknown }>;
        byCategory: Array<{ name: string; value: number; key: string }>;
        recommendedActions?: Array<{ id: string; label: string; impact: string; type: string }>;
      };
      insights: Array<{ id: string; title: string; description: string; type: string; icon?: string }>;
      challenges: {
        list: Array<{
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
          leaderboard?: Array<{ rank: number; name: string; value: number; avatar?: string }>;
        }>;
        leaderboard: Array<{ rank: number; name: string; value: number; avatar?: string }>;
        badges: Array<{ id: string; name: string; description: string; earned: boolean; icon: string }>;
      };
    }>("/api/demo/dashboard"),

  /** Raw calendar events (no predictions). Use for pipeline input. */
  getCalendarEvents: () =>
    request<
      Array<{
        id: string;
        title: string;
        start: string;
        end?: string;
        calendarType?: string;
        location?: string;
        attendees?: number;
      }>
    >("/api/calendar/events"),

  /** Predict spending from a list of events. */
  predict: (events: Array<{ title: string; location?: string; start_time: string; attendees?: number }>) =>
    request<{
      predicted_total: number;
      confidence: number;
      breakdown: Record<string, number>;
      features?: unknown[];
    }>("/predict", { method: "POST", body: { events } }),

  /** Generate a savings challenge from predicted total. */
  createChallenge: (predicted_total: number, user_id?: string) =>
    request<{
      challenge_id: string;
      target_spending: number;
      points: number;
      suggested_friends: string[];
      message: string;
    }>("/challenge", { method: "POST", body: { predicted_total, user_id: user_id ?? "default_user" } }),

  /** Get leaderboard ranking. */
  getLeaderboard: (
    participants: Array<{ name: string; spent: number }>,
    challenge_target?: number
  ) =>
    request<{
      leaderboard: Array<{ name: string; spent: number; rank: number; status: string | null }>;
    }>("/leaderboard", { method: "POST", body: { participants, challenge_target } }),

  /** AI coach chat. */
  coachChat: (message: string, session_id = "default", events: unknown[] = [], monthly_budget = 1000) =>
    request<{
      reply: { id: string; role: string; content: string; timestamp: string };
      actions: Array<{ id: string; label: string; impact: string; type: string }>;
    }>("/api/coach/chat", {
      method: "POST",
      body: { message, session_id, events, monthly_budget },
    }),

  /** Mock bank summary (checking, vaults, recent transactions). */
  bankSummary: () =>
    request<{
      checking: number;
      vaults: Record<string, number>;
      total: number;
      recent_transactions: Array<{
        type: string;
        amount: number;
        vault?: string;
        reason?: string;
        checking_after?: number;
        vault_after?: number;
      }>;
    }>("/api/bank/summary"),

  /** Lock funds into a vault. */
  bankLock: (amount: number, vault_name = "default", reason = "savings") =>
    request<{ ok: boolean; error?: string; checking_after?: number; vault_after?: number }>(
      "/api/bank/lock",
      { method: "POST", body: { action: "lock", amount, vault_name, reason, session_id: "default" } }
    ),

  /** Unlock funds from a vault. */
  bankUnlock: (amount: number, vault_name = "default", reason = "withdrawal") =>
    request<{ ok: boolean; error?: string; checking_after?: number; vault_after?: number }>(
      "/api/bank/unlock",
      { method: "POST", body: { action: "unlock", amount, vault_name, reason, session_id: "default" } }
    ),

  /** Run full pipeline with custom events (returns events, forecast, insights, challenges). */
  runPipeline: (events: unknown[], monthly_budget = 1000, spent_so_far = 0) =>
    request<{
      events: Array<{ id: string; title: string; start: string; end: string; calendarType: string; predictedSpend: number; category: string; why?: string }>;
      forecast: { next7DaysTotal: number; remainingBudget: number; monthlyBudget: number; riskScore: string; byCategory: Array<{ name: string; value: number; key: string }>; recommendedActions?: Array<{ id: string; label: string; impact: string; type: string }> };
      insights: unknown[];
      challenges: { list: unknown[]; leaderboard: unknown[]; badges: unknown[] };
    }>("/api/pipeline", {
      method: "POST",
      body: { events, monthly_budget, spent_so_far, session_id: "default" },
    }),
};
