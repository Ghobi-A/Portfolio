-- Read-only PostgreSQL 17. All statuses; GBP; Europe/London calendar.
-- Private import only: never publish production rows or source order keys.
WITH expanded AS (
 SELECT o.id AS order_id, o.status AS order_status, o.order_type,
  (o.created_at AT TIME ZONE 'Europe/London')::date AS order_date,
  i.ordinality AS line_number, i.item
 FROM public.orders o
 CROSS JOIN LATERAL jsonb_array_elements(
  CASE WHEN jsonb_typeof(o.items)='array' THEN o.items ELSE '[]'::jsonb END
 ) WITH ORDINALITY AS i(item, ordinality)
), parsed AS (
 SELECT order_id,order_status,order_type,order_date,line_number,
  CASE WHEN jsonb_typeof(item->'name')='string' THEN NULLIF(btrim(item->>'name'),'') END AS product_name,
  CASE WHEN item->>'qty' ~ '^[0-9]{1,9}$' THEN (item->>'qty')::numeric END AS quantity,
  CASE WHEN item->>'price' ~ '^[0-9]{1,9}([.][0-9]{1,4})?$'
   THEN (item->>'price')::numeric END AS listed_unit_price_gbp,
  jsonb_typeof(item) AS element_type
 FROM expanded
), lines AS (
 SELECT *,md5(lower(COALESCE(product_name,'Unknown item'))) AS product_key,
  CASE WHEN element_type='object' AND product_name IS NOT NULL AND quantity>0
   AND listed_unit_price_gbp IS NOT NULL THEN 0 ELSE 1 END AS is_invalid_line,
  CASE WHEN quantity>0 AND listed_unit_price_gbp IS NOT NULL
   THEN quantity*listed_unit_price_gbp END AS indicative_line_value_gbp
 FROM parsed
), line_totals AS (
 SELECT order_id,count(*) line_count,sum(is_invalid_line) invalid_lines,
  CASE WHEN sum(is_invalid_line)=0 THEN sum(indicative_line_value_gbp) END AS line_value
 FROM lines GROUP BY order_id
), facts AS (
 SELECT o.id AS order_id,
  o.created_at AS order_datetime_utc,
  o.created_at AT TIME ZONE 'Europe/London' AS order_datetime_local,
  (o.created_at AT TIME ZONE 'Europe/London')::date AS order_date,
  extract(hour from o.created_at AT TIME ZONE 'Europe/London')::int AS order_hour,
  COALESCE(o.order_type,'unknown') order_type,
  COALESCE(o.status,'unknown') order_status,
  COALESCE(o.payment,'unknown') payment_method,
  COALESCE(o.payment_status,'unknown') payment_status,
  COALESCE(o.fulfilment_mode,'unknown') fulfilment_mode,
  o.subtotal subtotal_gbp,o.delivery_fee delivery_fee_gbp,o.total gross_order_value_gbp,
  CASE WHEN o.payment='card' AND o.payment_status='paid' THEN o.total ELSE 0 END confirmed_card_value_gbp,
  CASE WHEN o.payment IN ('cash-on-delivery','pay-at-shop') THEN o.total ELSE 0 END offline_order_value_gbp,
  CASE WHEN o.payment IN ('cash-on-delivery','pay-at-shop') AND o.status='confirmed' THEN o.total ELSE 0 END confirmed_offline_order_value_gbp,
  CASE WHEN o.payment='card' THEN 1 ELSE 0 END is_card_order,
  CASE WHEN o.status='cancelled' THEN 1 ELSE 0 END is_cancelled,
  CASE WHEN o.payment_status='failed' THEN 1 ELSE 0 END is_payment_failed,
  CASE WHEN o.completed_at IS NOT NULL THEN 1 ELSE 0 END has_completion_timestamp,
  CASE WHEN o.preparing_at IS NULL THEN 1 ELSE 0 END missing_preparing,
  CASE WHEN o.ready_at IS NULL THEN 1 ELSE 0 END missing_ready,
  CASE WHEN o.completed_at IS NULL THEN 1 ELSE 0 END missing_completed,
  CASE WHEN o.acknowledged_at IS NULL THEN 1 ELSE 0 END missing_acknowledged,
  CASE WHEN o.created_at IS NULL THEN 1 ELSE 0 END missing_created,
  extract(epoch from o.ready_at-o.preparing_at)/60.0 raw_preparation_minutes,
  CASE WHEN o.ready_at>=o.preparing_at THEN extract(epoch from o.ready_at-o.preparing_at)/60.0 END preparation_minutes,
  CASE WHEN o.acknowledged_at>=o.created_at THEN extract(epoch from o.acknowledged_at-o.created_at)/60.0 END acknowledgement_minutes,
  CASE WHEN o.completed_at>=o.created_at THEN extract(epoch from o.completed_at-o.created_at)/60.0 END lifecycle_minutes,
  CASE WHEN (o.ready_at AT TIME ZONE 'Europe/London')::date > (o.preparing_at AT TIME ZONE 'Europe/London')::date THEN 1 ELSE 0 END is_overnight_prep,
  CASE WHEN o.ready_at-o.preparing_at>interval '120 minutes' THEN 1 ELSE 0 END is_prep_outlier,
  CASE WHEN o.preparing_at<o.created_at OR o.ready_at<o.preparing_at
   OR o.completed_at<o.ready_at OR o.acknowledged_at<o.created_at
   OR o.ready_at<o.created_at OR o.completed_at<o.created_at
   OR o.preparing_at<o.acknowledged_at THEN 1 ELSE 0 END invalid_timestamp_sequence,
  CASE WHEN o.total<0 OR o.subtotal<0 OR o.delivery_fee<0 OR o.total>500
    OR o.total IS NULL OR o.subtotal IS NULL OR o.delivery_fee IS NULL THEN 1 ELSE 0 END money_warning,
  CASE WHEN o.items IS NULL OR jsonb_typeof(o.items) IS DISTINCT FROM 'array' THEN 1 ELSE 0 END invalid_items_container,
  CASE WHEN o.items='[]'::jsonb THEN 1 ELSE 0 END empty_items,
  COALESCE(l.line_count,0) item_line_count,COALESCE(l.invalid_lines,0) invalid_item_lines,
  l.line_value indicative_items_value_gbp,
  l.line_value-o.subtotal AS item_subtotal_delta_gbp,
  o.total-o.subtotal-o.delivery_fee AS unitemised_adjustment_gbp,
  0.50::numeric AS model_service_charge_gbp,
  o.subtotal+o.delivery_fee+0.50-o.total AS order_total_delta_gbp,
  CASE WHEN (o.payment_status='paid' AND (o.payment IS DISTINCT FROM 'card' OR o.status IS DISTINCT FROM 'confirmed'))
   OR (o.payment_status='failed' AND o.status IS DISTINCT FROM 'payment_failed')
   OR (o.status='payment_failed' AND o.payment_status IS DISTINCT FROM 'failed')
   OR (o.payment='card' AND o.status='confirmed' AND o.payment_status IS DISTINCT FROM 'paid')
   OR o.payment IS NULL OR o.payment_status IS NULL OR o.status IS NULL THEN 1 ELSE 0 END inconsistent_payment_state
 FROM public.orders o LEFT JOIN line_totals l ON l.order_id=o.id
)
SELECT * FROM facts;
