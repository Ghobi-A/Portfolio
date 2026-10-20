// Configure only with a separately reviewed, public-safe Power BI Publish-to-web URL.
// Never embed a report containing private operational data or customer/order-level records
// without explicitly authorising public disclosure of the entire underlying dataset.
const PUBLIC_POWER_BI_EMBED_URL = "";

(() => {
  if (!PUBLIC_POWER_BI_EMBED_URL) return;
  let parsed;
  try { parsed = new URL(PUBLIC_POWER_BI_EMBED_URL); } catch { return; }
  if (parsed.protocol !== "https:" || parsed.hostname !== "app.powerbi.com" ||
      parsed.pathname !== "/view" || !parsed.searchParams.has("r")) return;
  const frame = document.getElementById("power-bi-report-frame");
  const container = document.getElementById("power-bi-embed-container");
  const fallback = document.getElementById("power-bi-embed-fallback");
  if (!frame || !container || !fallback) return;
  frame.src = parsed.href;
  container.style.display = "block";
  fallback.style.display = "none";
})();
