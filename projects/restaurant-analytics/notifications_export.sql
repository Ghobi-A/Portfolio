-- Read-only PostgreSQL 17. All statuses; GBP; Europe/London calendar.
-- Private import only: never publish production rows or source order keys.
SELECT o.id order_id,
 count(n.id) notification_events,
 count(n.id) FILTER(WHERE n.status='sent') sent_notification_events,
 count(n.id) FILTER(WHERE n.status='failed') failed_notification_events,
 count(n.id) FILTER(WHERE n.status NOT IN ('sent','failed')) pending_notification_events,
 COALESCE(sum(n.attempts),0) notification_attempts,
 COALESCE(sum(greatest(n.attempts-1,0)),0) retry_attempts,
 COALESCE(sum(n.failed_count),0) failed_endpoints,
 COALESCE(sum(n.delivered_count),0) delivered_endpoints,
 CASE WHEN count(n.id) FILTER(WHERE n.status='failed' OR n.failed_count>0)>0 THEN 1 ELSE 0 END has_notification_failure
FROM public.orders o LEFT JOIN public.kitchen_notification_outbox n ON n.order_id=o.id
GROUP BY o.id;
