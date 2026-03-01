/**
 * Sankey data transformer — converts forecast/cashflow data into
 * the nodes + links format consumed by the CashflowSankey component.
 *
 * Designed to be pluggable: when a real backend is available, the API
 * can return the SankeyData shape directly and skip transformation.
 */

// ── Public types ──────────────────────────────────────────────

export interface SankeyNode {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface SankeyLink {
  source: number;
  target: number;
  value: number;
  color: string;
  percentage: number;
}

export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
  currencySymbol: string;
}

// ── Category colors (matching Sure's palette) ─────────────────

const CATEGORY_COLORS: Record<string, string> = {
  food: "#2E90FA",
  transport: "#10A861",
  social: "#F79009",
  shopping: "#875BF7",
  subscriptions: "#737373",
  entertainment: "#06AED4",
  health: "#EC2222",
  other: "#9E9E9E",
};

const SUCCESS = "#10A861";
const DESTRUCTIVE = "#EC2222";

// ── Transformer ───────────────────────────────────────────────

interface CategoryEntry {
  name: string;
  value: number;
  key: string;
}

interface ForecastInput {
  next7DaysTotal: number;
  remainingBudget: number;
  monthlyBudget: number;
  byCategory: CategoryEntry[];
}

/**
 * Build Sankey nodes/links from our forecast shape.
 *
 * Layout:
 *   Budget ─→ Predicted Spending ─→ [Category nodes]
 *                                 └─→ Remaining (if any)
 */
export function buildSankeyFromForecast(
  forecast: ForecastInput,
  currencySymbol = "$"
): SankeyData {
  const nodes: SankeyNode[] = [];
  const links: SankeyLink[] = [];

  const totalSpend = forecast.next7DaysTotal;
  const remaining = Math.max(0, forecast.remainingBudget);
  const budget = totalSpend + remaining;

  // 0 — Weekly Budget (source)
  nodes.push({
    name: "Weekly Budget",
    value: budget,
    percentage: 100,
    color: SUCCESS,
  });

  // 1 — Cash Flow (central)
  nodes.push({
    name: "Cash Flow",
    value: budget,
    percentage: 100,
    color: SUCCESS,
  });

  // Link: Budget → Cash Flow
  links.push({
    source: 0,
    target: 1,
    value: budget,
    color: SUCCESS,
    percentage: 100,
  });

  // Category nodes (targets)
  const categories = forecast.byCategory.filter((c) => c.value > 0);
  categories.forEach((cat) => {
    const idx = nodes.length;
    const pct = budget > 0 ? (cat.value / budget) * 100 : 0;
    const color = CATEGORY_COLORS[cat.key] ?? "#9E9E9E";

    nodes.push({
      name: cat.name,
      value: cat.value,
      percentage: Math.round(pct * 10) / 10,
      color,
    });

    links.push({
      source: 1,
      target: idx,
      value: cat.value,
      color,
      percentage: Math.round(pct * 10) / 10,
    });
  });

  // Remaining budget node
  if (remaining > 0) {
    const idx = nodes.length;
    const pct = budget > 0 ? (remaining / budget) * 100 : 0;
    nodes.push({
      name: "Remaining",
      value: remaining,
      percentage: Math.round(pct * 10) / 10,
      color: SUCCESS,
    });
    links.push({
      source: 1,
      target: idx,
      value: remaining,
      color: SUCCESS,
      percentage: Math.round(pct * 10) / 10,
    });
  }

  return { nodes, links, currencySymbol };
}

/**
 * Passthrough: if backend already returns SankeyData, validate and return it.
 */
export function parseSankeyResponse(raw: unknown): SankeyData | null {
  if (
    raw &&
    typeof raw === "object" &&
    "nodes" in raw &&
    "links" in raw &&
    Array.isArray((raw as SankeyData).nodes) &&
    Array.isArray((raw as SankeyData).links)
  ) {
    return raw as SankeyData;
  }
  return null;
}
