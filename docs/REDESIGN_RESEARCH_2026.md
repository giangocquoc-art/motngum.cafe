# Một Ngụm — Product and Design Research

## Executive decision

Một Ngụm should behave like a guided studio configurator, not a hosting storefront and not a café website. The primary journey is deliberately short: research a domain, select a website package, select a visual direction, review one consolidated estimate, then move the conversation to Zalo.

The visual system is derived from the supplied brand asset: caramel, burgundy, espresso and cream; generous negative space; a restrained coffee motif; and a handwritten mark used only as a brand accent. The product UI uses a clean Vietnamese sans serif. The memorable device is the final “studio receipt”: a quote that accumulates the selected domain, template, package and included Mail Pro entitlement.

## Evidence and synthesis

### Domain discovery

ICANN states that RDAP replaced WHOIS as the definitive source for generic top-level-domain registration information from 28 January 2025. RDAP has standardized responses, authoritative service discovery and better internationalization. The implementation therefore uses the IANA RDAP bootstrap file to query registry endpoints directly for international domains, while `.vn` remains an iNET/VNNIC path.^1

iNET’s current developer documentation requires an API key in the `Authorization` header. Its older reseller API uses a DMS token and documents separate domain availability and suffix-price endpoints. The provider boundary must therefore preserve both authentication models and never expose either credential to the browser.^2

The retail price shown to visitors is a service price, not raw registry cost. It is modeled as provider base cost plus a configurable 100,000 VND setup margin. The interface describes the outcome—domain, setup support and Mail Pro connection—rather than exposing internal margin math.

### Template discovery

Framer’s marketplace groups templates by audience and intent (professional services, ecommerce, health, real estate, education, travel) and supports style and price filters. Squarespace similarly lets visitors narrow by site type and topic. Both patterns support showing a small, curated set first and treating categories as progressive narrowing rather than a giant undifferentiated grid.^3 ^4

For Một Ngụm, six curated starting points are more credible than hundreds of generic thumbnails. Each preview is presented inside a browser frame, includes a category and plain-language fit statement, and has one explicit selection action. Selection is persistent in the quote.

### Pricing and quote clarity

The key pricing decision is compositional clarity: website price and domain price remain separate, while included Mail Pro is visible but not charged again. A semantic definition list is used in the quote because Vercel’s Geist guidance recommends `dl`, `dt` and `dd` for concise key/value metadata.^5

The recommended package is emphasized once. Competing badges, discount banners and annualized-price tricks are excluded. The visitor sees the actual package price, the domain service price and the total estimate in the same unit.

### WordPress administration

WordPress’s Site Editor can manage global styles, pages, navigation, templates and patterns when a block theme is active. This makes it appropriate for marketing copy and page composition. Structured commercial data—packages, domain markup and template records—should live in a small custom plugin rather than being encoded into arbitrary page blocks.^6

The recommended split is:

- Gutenberg/FSE: headline, supporting copy, FAQ, promotions, blog and reusable content patterns.
- `motngum-studio` plugin: package records, package prices, Mail Pro entitlements, template records, demo URLs, preview images and domain markup.
- Next.js frontend: fast customer-facing configurator consuming a read-only WordPress REST endpoint.
- iNET adapter: server-side availability and pricing only; no registration or billable action in this phase.

## Design system

| Role | Token | Value |
|---|---|---|
| Canvas | Cream | `#F7F0E7` |
| Surface | Paper | `#FFFAF4` |
| Primary accent | Caramel | `#C87B35` |
| Secondary accent | Burgundy | `#762B2B` |
| Dark surface | Espresso | `#2B1712` |
| Primary text | Ink | `#35221C` |

The hero uses an oversized sans headline, a restrained serif italic phrase, and one cold-brew object inside a product-like orbit. This is the single expressive moment. The remainder of the interface uses disciplined cards, hairline borders and precise pricing typography.

## Interaction model

1. The visitor enters a brand/domain stem.
2. The server checks six TLDs and returns `registered`, `unregistered` or `unknown`; outages never become false “available” results.
3. The visitor selects a domain candidate.
4. The visitor chooses one of four packages.
5. The visitor filters and selects one of six template directions.
6. The receipt recomputes website, domain and total while showing Mail Pro as included.
7. “Copy quote” creates a complete handoff message and Zalo opens at `0583799593`.

No account, cart, checkout, payment, registration, DNS mutation or provisioning is present.

## Safety and performance

- iNET credentials remain server-only environment variables.
- Domain checks have eight-second timeouts and return an unknown state on provider failure.
- The API does not call registration, renewal, DNS or other write endpoints.
- Template previews are local SVGs, avoiding third-party tracking and layout shift.
- Hero artwork is local and optimized; animation is disabled under reduced-motion preferences.
- Public CTA links use `noopener noreferrer` when opening a new tab.

## WordPress implementation plan

Use a lightweight block theme and one small custom plugin. Do not add WooCommerce because there is no cart or checkout. The plugin should expose a read-only endpoint such as `/wp-json/motngum/v1/catalog` and sanitize all editable fields. Next.js should cache the catalog briefly and retain compiled fallback data so WordPress downtime does not remove pricing from the sales site.

The WordPress deployment remains pending hosting credentials. Until then, the production configurator uses the researched fallback catalog and configurable environment variables.

## Sources

1. ICANN. “[ICANN Update: Launching RDAP; Sunsetting WHOIS](https://www.icann.org/en/announcements/details/icann-update-launching-rdap-sunsetting-whois-27-01-2025-en).” 27 January 2025.
2. iNET Developers. “[Xác thực API](https://developers.inet.vn/docs/getting-started/authentication).” Accessed September 2026; iNET reseller documentation, “[iNET.vn API repository](https://github.com/thesunbg/iNET.vn).”
3. Framer. “[Template Categories](https://www.framer.com/community/marketplace/templates/categories/).” Accessed September 2026.
4. Squarespace. “[Website Templates](https://www.squarespace.com/templates/browse/topic/all-templates/type/services).” Accessed September 2026.
5. Vercel. “[Geist Description component](https://vercel.com/geist/description).” Accessed September 2026.
6. WordPress.org. “[Site Editor](https://wordpress.org/documentation/article/site-editor/).” Updated 19 August 2026.
