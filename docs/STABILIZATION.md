# Atlas stabilization

## Data model

- `wines` is the authenticated public catalogue. `user_wines` stores private favorites, ratings, tasting notes and purchase data.
- `library_items` is the authenticated public catalogue. `user_library_items` stores private progress, favorites and notes.
- `friendships` is mutual only after an incoming request is accepted. There are no followers, likes, rankings or feeds.
- `memories` and map routes use `private`, `friends` and `public`; RLS, not client filtering, decides which rows are returned.
- `wine-photos` stores canonical paths such as `{user_id}/{uuid}.webp`. Database rows never store signed URLs.

Apply migrations in timestamp order and then run `supabase/tests/stabilization_checks.sql`. Historical photo normalization is recorded in `atlas_migration_audit` under `historical_wine_photos_normalized`.

## PWA security

The service worker caches only the offline page, manifest and icons. Navigations are network-first and private API, Supabase and authorized requests are never cached. Atlas deliberately does not expose private records offline.

Android Chrome can install Atlas from the browser install prompt. On iPhone, use Safari → Share → Add to Home Screen.

## Later native packaging

After the PWA is stable, Capacitor can wrap the production web build for App Store and Google Play. That later phase requires native signing, privacy declarations, push-notification decisions and store review; none are introduced by this stabilization.

## Production verification

The execution environment used for this change could not reach Vercel or Supabase because its outbound proxy returned HTTP 403. Therefore migrations were prepared but not remotely applied, and authenticated multi-user/storage flows must be verified in the Vercel preview after the repository remote and deployment integration are available.
