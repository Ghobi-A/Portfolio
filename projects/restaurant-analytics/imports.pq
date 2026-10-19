// Each Query section is a separate named Power Query query. Import mode only.
// Parameter query: DataFolder (Text); set to a local synthetic or PRIVATE export directory.
DataFolder = "C:\RestaurantAnalytics\dashboard\"

// Query: LoadCsv (function)
(filename as text) as table =>
let
    Source = Csv.Document(File.Contents(DataFolder & filename), [Delimiter=",", Encoding=65001, QuoteStyle=QuoteStyle.Csv]),
    Headers = Table.PromoteHeaders(Source, [PromoteAllScalars=true])
    ,BlanksToNull = Table.ReplaceValue(Headers, "", null, Replacer.ReplaceValue, Table.ColumnNames(Headers))
in BlanksToNull

// Query: Orders
let
    Source = LoadCsv("orders.csv"),
    // Nulls remain null; monetary amounts are pounds.
    Typed = Table.TransformColumnTypes(Source, {
        {"order_id", type text},
        {"order_datetime_utc", type datetimezone},
        {"order_datetime_local", type datetime},
        {"order_date", type date},
        {"order_hour", Int64.Type},
        {"order_type", type text},
        {"order_status", type text},
        {"payment_method", type text},
        {"payment_status", type text},
        {"fulfilment_mode", type text},
        {"subtotal_gbp", Currency.Type},
        {"delivery_fee_gbp", Currency.Type},
        {"gross_order_value_gbp", Currency.Type},
        {"confirmed_card_value_gbp", Currency.Type},
        {"offline_order_value_gbp", Currency.Type},
        {"confirmed_offline_order_value_gbp", Currency.Type},
        {"is_card_order", Int64.Type},
        {"is_cancelled", Int64.Type},
        {"is_payment_failed", Int64.Type},
        {"has_completion_timestamp", Int64.Type},
        {"missing_preparing", Int64.Type},
        {"missing_ready", Int64.Type},
        {"missing_completed", Int64.Type},
        {"missing_acknowledged", Int64.Type},
        {"missing_created", Int64.Type},
        {"raw_preparation_minutes", type number},
        {"preparation_minutes", type number},
        {"acknowledgement_minutes", type number},
        {"lifecycle_minutes", type number},
        {"is_overnight_prep", Int64.Type},
        {"is_prep_outlier", Int64.Type},
        {"invalid_timestamp_sequence", Int64.Type},
        {"money_warning", Int64.Type},
        {"invalid_items_container", Int64.Type},
        {"empty_items", Int64.Type},
        {"item_line_count", Int64.Type},
        {"invalid_item_lines", Int64.Type},
        {"indicative_items_value_gbp", Currency.Type},
        {"item_subtotal_delta_gbp", Currency.Type},
        {"unitemised_adjustment_gbp", Currency.Type},
        {"model_service_charge_gbp", Currency.Type},
        {"order_total_delta_gbp", Currency.Type},
        {"inconsistent_payment_state", Int64.Type}
    }, "en-GB")
in Typed

// Query: MenuItems
let
    Source = LoadCsv("menu_items.csv"),
    // Nulls remain null; monetary amounts are pounds.
    Typed = Table.TransformColumnTypes(Source, {
        {"order_id", type text},
        {"line_number", Int64.Type},
        {"product_key", type text},
        {"product_name", type text},
        {"quantity", Int64.Type},
        {"listed_unit_price_gbp", Currency.Type},
        {"indicative_line_value_gbp", Currency.Type},
        {"is_invalid_line", Int64.Type}
    }, "en-GB")
in Typed

// Query: Notifications
let
    Source = LoadCsv("notifications.csv"),
    // Nulls remain null; monetary amounts are pounds.
    Typed = Table.TransformColumnTypes(Source, {
        {"order_id", type text},
        {"notification_events", Int64.Type},
        {"sent_notification_events", Int64.Type},
        {"failed_notification_events", Int64.Type},
        {"pending_notification_events", Int64.Type},
        {"notification_attempts", Int64.Type},
        {"retry_attempts", Int64.Type},
        {"failed_endpoints", Int64.Type},
        {"delivered_endpoints", Int64.Type},
        {"has_notification_failure", Int64.Type}
    }, "en-GB")
in Typed

// Query: ItemPairs
let
    Source = LoadCsv("item_pairs.csv"),
    // Nulls remain null; monetary amounts are pounds.
    Typed = Table.TransformColumnTypes(Source, {
        {"order_id", type text},
        {"product_a", type text},
        {"product_b", type text},
        {"name_a", type text},
        {"name_b", type text}
    }, "en-GB")
in Typed

// Query: Products (reference MenuItems; unique normalized key)
let
    Source = Table.Group(MenuItems, {"product_key"}, {{"product_name", each List.Min(List.RemoveNulls([product_name])), type text}})
in Source
