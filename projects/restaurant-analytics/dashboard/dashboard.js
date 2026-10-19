/* No network requests, credentials, customer data, libraries or production connection. */
(function () {
  const A = globalThis.Analytics,
    D = globalThis.DEMO_DATA,
    el = (id) => document.getElementById(id),
    money = (v) =>
      v === null
        ? "—"
        : new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(v),
    num = (v) =>
      v === null ? "—" : new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 }).format(v),
    pct = (n, d) => (d ? num((n / d) * 100) + "%" : "—");
  const escape = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
    );
  const min = D.orders.map((o) => o.order_date).sort()[0],
    max = D.orders
      .map((o) => o.order_date)
      .sort()
      .at(-1);
  let page = 0;
  function card(label, value, note = "", warn = false) {
    return `<div class="kpi ${warn ? "warn" : ""}" title="${escape(note)}"><div class="kpi-label">${escape(label)}</div><div class="kpi-value">${escape(value)}</div><div class="kpi-note">${escape(note)}</div></div>`;
  }
  function panel(title, sub, content, wide = false) {
    return `<section class="panel ${wide ? "wide" : ""}"><h2>${escape(title)}</h2><p class="sub">${escape(sub)}</p>${content}</section>`;
  }
  function bars(rows, format = num, color = "#087f8c") {
    const max = Math.max(1, ...rows.map((r) => r.value));
    return rows.length
      ? '<div class="bars">' +
          rows
            .map(
              (r) =>
                `<div class="bar" title="${escape(r.label)}: ${escape(format(r.value))}"><span class="bar-label">${escape(r.label.replaceAll("_", " "))}</span><div class="track"><div class="fill" style="width:${Math.max(0, (r.value / max) * 100)}%;background:${color}"></div></div><span class="bar-value">${escape(format(r.value))}</span></div>`,
            )
            .join("") +
          "</div>"
      : '<p class="empty">No observations in this view.</p>';
  }
  function table(head, rows) {
    return rows.length
      ? '<div class="tablewrap"><table><thead><tr>' +
          head.map((x) => "<th>" + escape(x) + "</th>").join("") +
          "</tr></thead><tbody>" +
          rows
            .map((r) => "<tr>" + r.map((x) => "<td>" + escape(x) + "</td>").join("") + "</tr>")
            .join("") +
          "</tbody></table></div>"
      : '<p class="empty">No records match this view.</p>';
  }
  function line(rows) {
    if (!rows.length) return '<p class="empty">No observations.</p>';
    const max = Math.max(1, ...rows.map((r) => r.value)),
      x = (i) => 35 + (i * 640) / Math.max(1, rows.length - 1),
      y = (v) => 160 - (v / max) * 140;
    return `<svg class="linechart" viewBox="0 0 700 190" role="img" aria-label="Daily recorded order counts, including zero-order dates"><line x1="35" y1="160" x2="680" y2="160" stroke="#dbe3e1"/><line x1="35" y1="20" x2="680" y2="20" stroke="#edf2ef"/><text x="4" y="24" fill="#5c7075" font-size="11">${max}</text><text x="15" y="163" fill="#5c7075" font-size="11">0</text><polyline fill="none" stroke="#087f8c" stroke-width="2.5" points="${rows.map((r, i) => x(i) + "," + y(r.value)).join(" ")}"/>${rows.map((r, i) => `<circle cx="${x(i)}" cy="${y(r.value)}" r="2" fill="#087f8c"><title>${escape(r.label)}: ${r.value} orders</title></circle>`).join("")}</svg><div class="chartlabels"><span>${escape(rows[0].label)}</span><span>${escape(rows.at(-1).label)}</span></div>`;
  }
  function render() {
    const f = {
        start: el("start").value,
        end: el("end").value,
        type: el("type").value,
        status: el("status").value,
      },
      o = A.filter(D, f),
      s = A.summarize(D, o),
      n = s.orders;
    el("scope").textContent =
      `${n} of ${D.orders.length} fictional orders · ${f.start || min} to ${f.end || max} · ${f.type || "All fulfilment types"} · ${f.status || "All statuses"}`;
    const sorted = (r) => r.sort((a, b) => b.value - a.value);
    let html = "";
    if (page === 0) {
      html =
        '<div class="kpis">' +
        card("Total recorded orders", num(n), "All filtered statuses") +
        card("Gross order value", money(s.gross), "Includes unpaid & cancelled orders") +
        card("Average order value", money(s.aov), "Gross value ÷ recorded orders") +
        card("Confirmed card value", money(s.card), "Application-paid card records") +
        card(
          "Cancellation rate",
          pct(s.cancellations, n),
          `${s.cancellations} cancelled / ${n} orders`,
          true,
        ) +
        card(
          "Payment failure rate",
          pct(s.failures, n),
          `${s.failures} failed / ${n} orders`,
          true,
        ) +
        '</div><div class="grid">' +
        panel(
          "Daily order volume",
          "Zero-order dates retained within the selected calendar window",
          line(A.daily(o, f.start || min, f.end || max)),
        ) +
        panel(
          "Order status",
          "Recorded orders, including unsuccessful transactions",
          bars(sorted(A.group(o, "order_status"))),
        ) +
        panel(
          "Monthly recorded orders",
          "Partial months are not directly comparable",
          bars(
            A.group(o, (r) => r.order_date.slice(0, 7)).sort((a, b) =>
              a.label.localeCompare(b.label),
            ),
          ),
        ) +
        panel(
          "Delivery versus collection",
          "Demand across all filtered statuses",
          bars(sorted(A.group(o, "order_type"))),
        ) +
        "</div>";
    }
    if (page === 1) {
      const products = A.products(s.menu);
      html =
        '<div class="kpis">' +
        card(
          "Recorded item units",
          num(A.sum(s.menu, "quantity")),
          "Includes mixed-status demand",
        ) +
        card(
          "Products in selected orders",
          num(products.length),
          "Distinct normalized menu products",
        ) +
        card(
          "Indicative item value",
          money(A.sum(s.menu, "indicative_line_value_gbp")),
          "Listed price × quantity; not profit",
        ) +
        '</div><div class="grid">' +
        panel(
          "Top 10 products by units",
          "Units requested, not verified purchases",
          bars(products.slice(0, 10)),
        ) +
        panel(
          "Peak ordering hours",
          "Europe/London local hour; small or synthetic samples are not staffing evidence",
          bars(sorted(A.group(o, (r) => String(r.order_hour).padStart(2, "0") + ":00"))),
        ) +
        panel(
          "Frequently paired products",
          "Each unordered pair counts once per order; no causal cross-sell claim",
          bars(A.pairs(D, o).slice(0, 7)),
        ) +
        panel(
          "Menu demand by fulfilment",
          "Item units linked to the current filtered order set",
          bars(
            A.group(s.menu, (r) => o.find((x) => x.order_id === r.order_id).order_type, "quantity"),
          ),
        ) +
        panel(
          "Product rankings",
          "Dense rank by units; indicative value excludes order-level fees",
          table(
            ["Rank", "Product", "Units", "Orders containing", "Indicative value"],
            products.map((p) => [p.rank, p.label, num(p.value), p.orders, money(p.lineValue)]),
          ),
          true,
        ) +
        panel(
          "Product demand over time",
          "Monthly item units; use the current date/type/status filters",
          table(
            [
              "Product",
              ...A.group(o, (r) => r.order_date.slice(0, 7))
                .map((x) => x.label)
                .sort(),
            ],
            products.slice(0, 10).map((p) => [
              p.label,
              ...A.group(o, (r) => r.order_date.slice(0, 7))
                .map((x) => x.label)
                .sort()
                .map((m) =>
                  num(
                    A.sum(
                      s.menu.filter(
                        (l) =>
                          l.product_key === p.key &&
                          o.find((x) => x.order_id === l.order_id).order_date.startsWith(m),
                      ),
                      "quantity",
                    ),
                  ),
                ),
            ]),
          ),
          true,
        ) +
        "</div>";
    }
    if (page === 2) {
      const bands = A.group(o, (r) => {
        const v = r.raw_preparation_minutes;
        return v === null
          ? "Missing pair"
          : v < 0
            ? "Invalid negative"
            : v <= 5
              ? "0–5 min"
              : v <= 15
                ? "5–15 min"
                : v <= 30
                  ? "15–30 min"
                  : v <= 60
                    ? "30–60 min"
                    : v <= 120
                      ? "60–120 min"
                      : v <= 1440
                        ? "120–1440 min"
                        : "Over 24 hours";
      });
      html =
        '<div class="kpis">' +
        card("Median preparation", num(s.median) + " min", `${s.timed} nonnegative timed pairs`) +
        card("P90 preparation", num(s.p90) + " min", "Interpolated 90th percentile") +
        card(
          "Preparation over 120 min",
          num(s.outliers),
          "Review threshold; retained in statistics",
          true,
        ) +
        card(
          "Median acknowledgement",
          num(s.medianAck) + " min",
          "Valid created → acknowledged pairs",
        ) +
        card(
          "Failed notification events",
          num(s.failedEvents),
          `${s.events} outbox events in scope`,
          true,
        ) +
        card("Notification retries", num(s.retries), `${s.attempts} cumulative attempts`) +
        '</div><div class="grid">' +
        panel(
          "Preparation-time distribution",
          "Missing and invalid timestamps remain visible",
          bars(bands, num, "#5568a8"),
        ) +
        panel(
          "Measurement coverage & comparison",
          "Time statistics are descriptive; timestamps are not a service-level guarantee",
          table(
            ["Metric", "Value"],
            [
              ["Timed preparation coverage", pct(s.timed, n)],
              ["Mean preparation", num(s.mean) + " min"],
              ["Median lifecycle", num(s.medianLife) + " min"],
              ["Overnight preparation records", num(A.sum(o, "is_overnight_prep"))],
              ["Invalid timestamp sequences", num(A.sum(o, "invalid_timestamp_sequence"))],
              ["Notification sent rate", pct(s.sent, s.events)],
              ["Orders with notification failures", num(s.failureOrders)],
            ],
          ),
        ) +
        panel(
          "Preparation by order type",
          "Compare distributions before inferring operational bottlenecks",
          table(
            ["Fulfilment", "Timed n", "Median min", "P90 min"],
            ["delivery", "collection"].map((t) => {
              const v = o.filter((x) => x.order_type === t).map((x) => x.preparation_minutes);
              return [
                t,
                v.filter((x) => x !== null).length,
                num(A.percentile(v, 0.5)),
                num(A.percentile(v, 0.9)),
              ];
            }),
          ),
        ) +
        panel(
          "Preparation by time of day",
          "Local order hour; missing pairs excluded from duration medians",
          table(
            ["Local hour", "Timed n", "Median min"],
            A.group(o, "order_hour")
              .sort((a, b) => +a.label - +b.label)
              .map((x) => {
                const v = o
                  .filter((r) => r.order_hour === +x.label)
                  .map((r) => r.preparation_minutes);
                return [
                  x.label + ":00",
                  v.filter((y) => y !== null).length,
                  num(A.percentile(v, 0.5)),
                ];
              }),
          ),
        ) +
        panel(
          "Records requiring timestamp review",
          "Fictional IDs only. Outliers are not removed from median, mean or P90.",
          table(
            ["Demo order", "Type", "Status", "Raw prep min", "Overnight", "Invalid sequence"],
            o
              .filter((x) => x.is_prep_outlier || x.invalid_timestamp_sequence)
              .map((x) => [
                x.order_id,
                x.order_type,
                x.order_status,
                num(x.raw_preparation_minutes),
                x.is_overnight_prep ? "Yes" : "No",
                x.invalid_timestamp_sequence ? "Yes" : "No",
              ]),
          ),
          true,
        ) +
        "</div>";
    }
    if (page === 3) {
      html =
        '<div class="kpis">' +
        card("Confirmed card value", money(s.card), "Not independently settled revenue") +
        card(
          "Unverified order value",
          money(s.gross - s.card),
          "Gross minus application-paid card",
        ) +
        card("Offline order value", money(s.offline), "Includes cancelled offline orders") +
        card("Failed payment orders", num(s.failures), "All filtered methods") +
        card(
          "Card payment failure rate",
          pct(
            A.sum(
              o.filter((x) => x.payment_method === "card"),
              "is_payment_failed",
            ),
            s.cardOrders,
          ),
          `Denominator: ${s.cardOrders} card orders`,
          true,
        ) +
        card(
          "Payment inconsistencies",
          num(A.sum(o, "inconsistent_payment_state")),
          "Flags require reconciliation",
          true,
        ) +
        '</div><div class="grid">' +
        panel(
          "Payment method distribution",
          "Recorded order counts",
          bars(sorted(A.group(o, "payment_method"))),
        ) +
        panel(
          "Payment value classification",
          "All values GBP; offline payment collection is unverified",
          bars(
            [
              { label: "Application-paid card", value: s.card },
              { label: "All remaining order value", value: s.gross - s.card },
            ],
            money,
          ),
        ) +
        panel(
          "Missing operational timestamps",
          "Counts overlap; do not sum as distinct bad orders",
          bars(
            [
              { label: "Preparing", value: A.sum(o, "missing_preparing") },
              { label: "Ready", value: A.sum(o, "missing_ready") },
              { label: "Completed", value: A.sum(o, "missing_completed") },
              { label: "Acknowledged", value: A.sum(o, "missing_acknowledged") },
            ],
            num,
            "#b4374c",
          ),
        ) +
        panel(
          "Data-quality warnings",
          "Current fee model £0.50; >£500 is a review threshold, not proof of error",
          table(
            ["Check", "Count"],
            [
              ["Invalid timestamp sequence", A.sum(o, "invalid_timestamp_sequence")],
              ["Invalid / non-array items", A.sum(o, "invalid_items_container")],
              ["Empty item arrays", A.sum(o, "empty_items")],
              ["Invalid line items", A.sum(o, "invalid_item_lines")],
              ["Money warnings", A.sum(o, "money_warning")],
              [
                "Item vs subtotal mismatch >1p",
                o.filter(
                  (x) =>
                    x.item_subtotal_delta_gbp !== null &&
                    Math.abs(x.item_subtotal_delta_gbp) > 0.01,
                ).length,
              ],
              [
                "Total vs fee model mismatch >1p",
                o.filter(
                  (x) =>
                    x.order_total_delta_gbp !== null && Math.abs(x.order_total_delta_gbp) > 0.01,
                ).length,
              ],
            ],
          ),
        ) +
        panel(
          "Payment-state reconciliation",
          "Order status and payment status are different concepts",
          table(
            ["Method", "Payment status", "Order status", "Orders", "Gross value"],
            [
              ...new Set(
                o.map((x) => [x.payment_method, x.payment_status, x.order_status].join("|")),
              ),
            ]
              .sort()
              .map((k) => {
                const v = o.filter(
                  (x) => [x.payment_method, x.payment_status, x.order_status].join("|") === k,
                );
                return [...k.split("|"), v.length, money(A.sum(v, "gross_order_value_gbp"))];
              }),
          ),
          true,
        ) +
        "</div>";
    }
    el("content").innerHTML = html;
  }
  document.querySelectorAll("nav button").forEach((b) =>
    b.addEventListener("click", () => {
      page = Number(b.dataset.page);
      document.querySelectorAll("nav button").forEach((x) => x.removeAttribute("aria-current"));
      b.setAttribute("aria-current", "page");
      el("page-title").textContent = [
        "Executive overview",
        "Menu & customer demand",
        "Kitchen operations",
        "Payments & data quality",
      ][page];
      render();
    }),
  );
  for (const id of ["start", "end", "type", "status"]) el(id).addEventListener("change", render);
  function reset() {
    el("start").value = min;
    el("end").value = max;
    el("type").value = "";
    el("status").value = "";
    render();
  }
  el("reset").addEventListener("click", reset);
  el("export").addEventListener("click", () => {
    const rows = A.filter(D, {
        start: el("start").value,
        end: el("end").value,
        type: el("type").value,
        status: el("status").value,
      }),
      keys = [
        "order_id",
        "order_date",
        "order_type",
        "order_status",
        "payment_method",
        "payment_status",
        "gross_order_value_gbp",
        "confirmed_card_value_gbp",
        "preparation_minutes",
      ];
    const csv = [
      keys.join(","),
      ...rows.map((r) =>
        keys.map((k) => '"' + String(r[k] ?? "").replaceAll('"', '""') + '"').join(","),
      ),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" })),
      a = document.createElement("a");
    a.href = url;
    a.download = "synthetic-filtered-orders.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  reset();
})();
