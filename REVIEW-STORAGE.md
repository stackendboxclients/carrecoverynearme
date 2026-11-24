# Review storage verification

Preview deployments use the `preview-customer-reviews-v1/` namespace. Production uses `customer-reviews-v1/`. Technical test submissions must use Preview, never the public customer feed.

The private Vercel store `carrecoverynearme-reviews` is connected only to the `carrecoverynearme` project in Production and Preview, using rotating OIDC credentials.

Run `node review-check.mjs` for validation, cooldown, negative-rating, persistence and failure-handling tests. Production GET `/api/reviews` must return JSON, and invalid POST bodies must return 400 without saving anything.
