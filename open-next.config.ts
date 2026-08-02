import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Sites runs the Worker build without a user-managed cache binding. The
// adapter's default cache keeps the app deployable while API responses still
// control their own HTTP caching headers.
export default defineCloudflareConfig({});
