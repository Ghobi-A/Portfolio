/* Pure calculation kernel, shared by the rendered dashboard and Node regression tests. */
(function (root) {
  const sum = (rows, key) => rows.reduce((s, r) => s + (Number(r[key]) || 0), 0);
  const valid = (values) => values.filter((v) => typeof v === "number" && Number.isFinite(v));
  function percentile(values, p) {
    const a = valid(values).sort((a, b) => a - b);
    if (!a.length) return null;
    const i = (a.length - 1) * p,
      l = Math.floor(i);
    return a[l] + (a[Math.ceil(i)] - a[l]) * (i - l);
  }
  function filter(data, f = {}) {
    return data.orders.filter(
      (o) =>
        (!f.start || o.order_date >= f.start) &&
        (!f.end || o.order_date <= f.end) &&
        (!f.type || o.order_type === f.type) &&
        (!f.status || o.order_status === f.status),
    );
  }
  function summarize(data, orders) {
    const ids = new Set(orders.map((o) => o.order_id)),
      menu = data.menu_items.filter((l) => ids.has(l.order_id) && l.is_invalid_line === 0),
      notifications = data.notifications.filter((n) => ids.has(n.order_id));
    const timings = valid(orders.map((o) => o.preparation_minutes));
    return {
      orders: orders.length,
      gross: sum(orders, "gross_order_value_gbp"),
      card: sum(orders, "confirmed_card_value_gbp"),
      offline: sum(orders, "offline_order_value_gbp"),
      aov: orders.length ? sum(orders, "gross_order_value_gbp") / orders.length : null,
      cancellations: sum(orders, "is_cancelled"),
      failures: sum(orders, "is_payment_failed"),
      cardOrders: sum(orders, "is_card_order"),
      timed: timings.length,
      median: percentile(timings, 0.5),
      p90: percentile(timings, 0.9),
      mean: timings.length ? timings.reduce((a, b) => a + b, 0) / timings.length : null,
      outliers: sum(orders, "is_prep_outlier"),
      medianAck: percentile(
        orders.map((o) => o.acknowledgement_minutes),
        0.5,
      ),
      medianLife: percentile(
        orders.map((o) => o.lifecycle_minutes),
        0.5,
      ),
      menu,
      notifications,
      events: sum(notifications, "notification_events"),
      sent: sum(notifications, "sent_notification_events"),
      failedEvents: sum(notifications, "failed_notification_events"),
      retries: sum(notifications, "retry_attempts"),
      attempts: sum(notifications, "notification_attempts"),
      failureOrders: sum(notifications, "has_notification_failure"),
    };
  }
  function group(rows, key, value) {
    const map = new Map();
    for (const r of rows) {
      const k = typeof key === "function" ? key(r) : r[key];
      map.set(k, (map.get(k) || 0) + (value ? Number(r[value]) || 0 : 1));
    }
    return [...map].map(([label, value]) => ({ label: String(label), value }));
  }
  function products(lines) {
    const m = new Map();
    for (const l of lines) {
      if (l.is_invalid_line) continue;
      const r = m.get(l.product_key) || {
        label: l.product_name,
        key: l.product_key,
        value: 0,
        ids: new Set(),
        lineValue: 0,
      };
      r.value += l.quantity;
      r.lineValue += l.indicative_line_value_gbp || 0;
      r.ids.add(l.order_id);
      m.set(l.product_key, r);
    }
    const a = [...m.values()].sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
    let rank = 0,
      last;
    return a.map((r) => {
      if (r.value !== last) {
        rank++;
        last = r.value;
      }
      return { ...r, orders: r.ids.size, rank };
    });
  }
  function pairs(data, orders) {
    const ids = new Set(orders.map((o) => o.order_id));
    const m = new Map();
    for (const p of data.item_pairs.filter((p) => ids.has(p.order_id))) {
      const k = p.product_a + "|" + p.product_b;
      const r = m.get(k) || { label: p.name_a + " + " + p.name_b, value: 0 };
      r.value++;
      m.set(k, r);
    }
    return [...m.values()].sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
  }
  function daily(orders, start, end) {
    if (!start || !end) return [];
    const map = new Map(group(orders, "order_date").map((x) => [x.label, x.value])),
      a = [];
    for (
      let d = new Date(start + "T00:00:00Z");
      d <= new Date(end + "T00:00:00Z");
      d.setUTCDate(d.getUTCDate() + 1)
    ) {
      const label = d.toISOString().slice(0, 10);
      a.push({ label, value: map.get(label) || 0 });
    }
    return a;
  }
  root.Analytics = { sum, percentile, filter, summarize, group, products, pairs, daily };
})(globalThis);
