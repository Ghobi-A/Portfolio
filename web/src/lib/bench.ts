/** Measured values shown on the bench. Sources: dp-insurance README (five-seed
 *  DP-SGD benchmark), kh4-demand-intel group-CV report, restaurant platform. */
export type Mode = "research" | "applications" | "systems";

export const MODES: { id: Mode; label: string }[] = [
  { id: "research", label: "Research" },
  { id: "applications", label: "Applications" },
  { id: "systems", label: "Systems" },
];

export const BUDGETS = [
  { epsilon: "0.49", auc: 0.933, low: 0.909, high: 0.957, noise: 1 },
  { epsilon: "2", auc: 0.944, low: 0.927, high: 0.96, noise: 0.42 },
  { epsilon: "6", auc: 0.945, low: 0.928, high: 0.961, noise: 0.16 },
] as const;
export const REFERENCE_AUC = 0.953;

/** Strip position for an AUC on the .90–.97 scale (svg units). */
export const strip = (value: number) => 10 + ((value - 0.9) / 0.07) * 300;
export const three = (value: number) => value.toFixed(3).replace(/^0/, "");

/** First 20 of a 200-comment queue. Expected counts: prevalence 0.30 × 20 = 6
 *  in random order; × Lift@10% 2.5 = 15 under the model's ranking. */
export const QUEUE_HITS = {
  random: [1, 4, 8, 11, 15, 18],
  ranked: [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 12, 13, 15, 17, 19],
} as const;
export const QUEUE_COPY = {
  random: ["≈6 of 20", "actionable when the first 10% of a 200-comment queue is read in random order."],
  ranked: ["≈15 of 20", "actionable in the first 10% of a 200-comment queue, ranked by the model."],
} as const;

export const STEPS = [
  { label: "Validate", text: "Server pricing, opening hours and delivery area. The browser never sets the price." },
  { label: "Pay", text: "Stripe checkout with idempotent requests, so a retried click cannot charge twice." },
  { label: "Confirm", text: "A signed webhook confirms payment. The browser returning from checkout is not proof.", critical: true },
  { label: "Kitchen", text: "Realtime updates reach a staff-only kitchen view once the server has confirmed." },
] as const;
