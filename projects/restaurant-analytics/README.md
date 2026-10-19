# Restaurant analytics demonstration

All 240 orders are fictional. The generator never reads production.

```sh
python3 projects/restaurant-analytics/generate_demo.py
python3 -m http.server 8000 --directory projects/restaurant-analytics/dashboard
```

Open localhost:8000. Import the four CSVs into Power BI as Orders, MenuItems, Notifications and ItemPairs; use model.json, date_dimension.dax, measures.dax and dashboard-layout.json. Power BI Desktop execution remains pending. SQL files are SELECT-only examples; running them on any real database requires separate authorised read-only access.

Do not publish real order keys, timestamps, customer fields, notes or payment identifiers. No original production rows or private application code are included.
