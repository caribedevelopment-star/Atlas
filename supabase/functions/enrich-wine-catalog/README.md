# enrich-wine-catalog

Deploy this function without gateway JWT verification because it validates the
caller itself and must accept both user access tokens and the cron service key:

```bash
supabase functions deploy enrich-wine-catalog --no-verify-jwt
```

Set `WINE_CATALOG_PROVIDERS` to a JSON array. Providers must expose a normalized
`results` array and explicitly declare a reusable image license:

```json
[
  {
    "name": "licensed-catalog",
    "searchUrl": "https://provider.example/search?q={query}",
    "token": "optional-provider-token",
    "reusableLicenses": ["CC0-1.0", "CC-BY-4.0"]
  }
]
```

Each result may contain `name`, `winery`, `vintage`, `imageUrl`, `sourceUrl`,
`license`, `reusable`, `imageType`, `description`, `country`, `region`,
`denomination`, and `grapes`. An image is rejected
unless its identity matches, its source and image use HTTPS, its license is
allow-listed, its metadata identifies it as a bottle or label, and the URL
responds with an image content type.

Create `project_url` and `service_role_key` in Supabase Vault so the hourly cron
can invoke the function. Never place either secret in the migration or client.
