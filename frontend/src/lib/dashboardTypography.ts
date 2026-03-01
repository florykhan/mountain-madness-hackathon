const DASHBOARD_FONT_WEIGHT_SCALE = 1.4;

export function scaledDashboardWeight(baseWeight: number): number {
  return Math.min(900, Math.round(baseWeight * DASHBOARD_FONT_WEIGHT_SCALE));
}
