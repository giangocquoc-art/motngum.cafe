# WordPress setup

The current production implementation is Next.js because the linked Vercel project
already uses it. WordPress is an optional content/catalog source; it is not required
for domain checking or customer quotes.

## Connect a WordPress host

1. Install and activate `wordpress/motngum-studio/motngum-studio.php` as a plugin.
2. In WordPress admin, add `Mot Ngum packages` and `Mot Ngum templates`. Package
   price, Mail Pro text, feature lines, template category, demo URL and featured image
   are editable from the normal editor.
3. Confirm the public endpoint works:
   `https://YOUR-WP-HOST.example/wp-json/motngum/v1/catalog`
4. Add this Vercel environment variable for Production (and Preview if needed):
   `WORDPRESS_API_URL=https://YOUR-WP-HOST.example`
5. Redeploy. The frontend fetches the catalog through `/api/catalog`; if WordPress is
   unavailable it automatically keeps the compiled fallback prices and templates.

Domain registrar keys must remain server-side. This flow intentionally has no cart,
payment, domain registration or provisioning; customers receive an estimate and
contact the owner through Zalo for confirmation.
