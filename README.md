# Morrow Anime 2 - Requested Anime Providers

This package follows the Nuvio local-scraper contract used by the upstream GitHub repositories:

- `manifest.json` contains the scraper registry.
- Every manifest `filename` exists under `providers/`.
- Every enabled provider exports `getStreams(tmdbId, mediaType, season, episode)`.

The requested anime adapters use the existing resolver-backed implementation so they can request the current SUB/DUB server roster without duplicating unstable site APIs. Returned streams are labeled `resolverBacked: true`; the label identifies the requested site, but the resolver may select a current server from its shared roster.

The resolver cache deduplicates concurrent requests and keeps the server roster and extracted streams warm for five minutes, avoiding the same request once for every enabled alias.

Use Naruto TMDB ID `46260` for validation. TMDB ID `20` is not Naruto and is not a valid anime smoke-test input.

`Manga 1` was supplied without a domain, so it is not included as a provider entry.
