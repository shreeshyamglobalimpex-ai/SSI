# Product import — formatting guide

Bulk-import products into the admin panel from an **`.xlsx`**, **`.xls`** or
**`.csv`** file. Records are processed in **batches of 100**, so large files are
split into many small, individually-reportable requests. Each batch is saved in
a single transaction — a batch either fully lands or fully rolls back.

## Step 1 — Get the template

In **Admin → Products → Import**, click **Download template**. It downloads
`product-import-template.xlsx` with the correct headers and three filled-in
example rows so you can see the expected layout at a glance.

## Step 2 — Format your data

The **first row must be the header row**. Column names are matched
case-insensitively and ignore extra spaces, so `Product Name`, `product name`
and `PRODUCT  NAME` all map to `name`. Unknown columns are ignored, so you can
leave helper columns in your own sheet.

### Columns

| Column        | Required | Type    | Notes                                                              |
| ------------- | -------- | ------- | ------------------------------------------------------------------ |
| `name`        | ✅       | text    | 2–200 characters. This is the product title.                       |
| `category`    | ✅       | text    | Created automatically if it doesn't exist yet.                     |
| `sku`         | —        | text    | Optional. Up to 100 characters.                                    |
| `slug`        | —        | text    | Leave **blank** to auto-generate from `name`. Must be unique.      |
| `description` | —        | text    | Up to 5,000 characters.                                            |
| `priceInr`    | —        | number  | ≥ 0. Price in Indian Rupees. Plain numbers (`25.5`), no symbols.   |
| `priceUsd`    | —        | number  | ≥ 0. Price in US Dollars. Plain numbers (`0.30`), no symbols.      |
| `stock`       | —        | integer | ≥ 0. Defaults to `0`.                                             |
| `lowStockAt`  | —        | integer | ≥ 0. The "low stock" threshold. Defaults to `5`.                  |
| `active`      | —        | boolean | `TRUE`/`FALSE` (also accepts `yes`/`no`, `1`/`0`). Defaults `TRUE`. |

### Rules & tips

- **Matching products.** A row updates an existing product when its `slug`
  matches; otherwise a new product is created. So re-importing a file with the
  same names updates rather than duplicates.
- **Slugs.** If you leave `slug` blank it is generated from `name`. If two rows
  resolve to the same slug within one batch, the second is skipped and reported.
- **Two price columns.** Supply both `priceInr` (₹) and `priceUsd` ($) when you
  price in multiple currencies. A lone `price` header is treated as `priceInr`.
- **Prices.** Do not include `₹`, `$`, or thousands separators. Use `1250.00`,
  not `₹1,250.00`.
- **Numbers.** `stock` and `lowStockAt` must be whole numbers.
- **Empty optional fields** are treated as "not provided" (not as zero/empty
  string) — except `stock`, which defaults to `0`.

## Example

See [`example-products.csv`](./example-products.csv) for a copy-paste-ready
sample, or download the richer `.xlsx` template from the UI.

```csv
name,category,sku,slug,description,priceInr,priceUsd,stock,lowStockAt,active
Paracetamol 500mg Tablets,Analgesics,PAR-500,,Strip of 10 tablets. For fever and mild pain.,25.5,0.30,1200,100,TRUE
Amoxicillin 250mg Capsules,Antibiotics,AMX-250,,Box of 20 capsules. Prescription required.,180,2.20,350,50,TRUE
Vitamin C 1000mg Effervescent,Supplements,VIT-C-1000,,Tube of 20 tablets.,320,3.85,0,25,FALSE
```

## After you import

The panel shows a live progress bar (batch _n_ of _m_) and a final summary:
**created · updated · skipped · errors**. Any rows that failed validation are
listed with the row number and reason so you can fix and re-import just those.
