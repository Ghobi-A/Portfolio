/**
 * The owner's Power BI "Publish to web" report for the UK Asia Grill case study
 * (enabled by the owner on 20 October 2026; the same URL is configured in
 * projects/restaurant-analytics/powerbi-embed.js).
 *
 * Publish to web makes a report public to anyone with the link. Only configure a
 * report whose entire underlying dataset may be public; see docs/EVIDENCE.md.
 */
export const POWER_BI_REPORT_URL =
  "https://app.powerbi.com/view?r=eyJrIjoiODgwY2JlNmMtZGMxNC00YmRkLTlhMjQtZjliODY3OGEwNTE3IiwidCI6IjNjODI5NDhhLTBlMjEtNDk1MC1iYjI0LWZjMWFmMzI0OTRkYSJ9";

/** Accept only an https app.powerbi.com Publish-to-web view URL (mirrors powerbi-embed.js). */
export function safeReportUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || parsed.hostname !== "app.powerbi.com" || parsed.pathname !== "/view" || !parsed.searchParams.has("r")) return null;
    return parsed.href;
  } catch {
    return null;
  }
}

/** Pages and headline cards as shown in the published report (read 25 November 2026).
 *  The six cards match the observed SQL snapshot published on this site. */
export const REPORT_PAGES = ["Executive overview", "Menu & customer demand", "Kitchen operations", "Payments & data quality"] as const;
export const REPORT_CARDS = [
  ["Total orders", "53"],
  ["Gross order value", "£1.03K"],
  ["Average order value", "£19.47"],
  ["Confirmed card value", "£373.77"],
  ["Cancellation rate", "22.6%"],
  ["Payment failure rate", "7.5%"],
] as const;
