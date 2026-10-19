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
), baskets AS (SELECT order_id,product_key,min(product_name) product_name FROM lines WHERE is_invalid_line=0 GROUP BY 1,2)
SELECT a.order_id,a.product_key product_a,b.product_key product_b,a.product_name name_a,b.product_name name_b
FROM baskets a JOIN baskets b ON a.order_id=b.order_id AND a.product_key<b.product_key;
