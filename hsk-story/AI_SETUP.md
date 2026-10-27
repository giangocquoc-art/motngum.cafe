# Chim Sẻ AI setup

## Provider

The tutor endpoint is `POST /api/ai/tutor`, a Vercel Node function. It accepts OpenAI-compatible chat completions from `https://api.psharehub.com/v1` and only allows the seven ordinary HSK1 practice scenes listed in `api/ai/tutor.js`. Checkpoints, the lost-notebook encounter, exam scenes and completed stories are rejected by the server even if a client tries to call it directly.

The function accepts up to four API keys in `PSHAREHUB_API_KEYS` (comma or newline separated), or the single `PSHAREHUB_API_KEY`. The model list below is tried in order, interleaved with keys so a slow or unavailable model does not consume every key attempt first. It stops at the first non-empty answer. To discover models automatically instead, leave `PSHAREHUB_MODEL_IDS` blank and the function will read `/models`. Each provider request defaults to 7 seconds (configurable from 3–8 seconds); a 54-second total provider budget leaves room for the generic failure alert inside Vercel's 60-second function limit. The endpoint requires a matching same-origin HTTPS `Origin` header; local HTTP is allowed for localhost development. It has a 12-request/minute per-instance limit, bounds request sizes, and keeps question text out of logs. This endpoint serves the public practice UI and does not establish an account identity. Do not prefix secrets with `VITE_`, `NEXT_PUBLIC_`, or put them in HTML/JavaScript.

Configured model IDs:

```text
deepseek-ai/DeepSeek-V4.1-Flash
gemma-26b-a4b-it
glm-5.3-flash
nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4
```

These are the exact IDs returned by the authenticated `GET /v1/models` catalog. The `nast/` and `tdug/` prefixes shown in the provider dashboard are source labels, not part of the API IDs.

For Vercel, add `PSHAREHUB_MODEL_IDS` with these comma-separated IDs to the Preview and Production environments. Add the provider key using Vercel's encrypted environment-variable settings; the local `.env` file is not uploaded during deployment.

### Current Preview status

As of 2026-10-27, the Vercel project `hsk-hai-que-huong` has `PSHAREHUB_API_BASE_URL`, sensitive `PSHAREHUB_API_KEYS`, `PSHAREHUB_MODEL_IDS`, and `PSHAREHUB_REQUEST_TIMEOUT_MS` set only for Preview branch `codex/chimse-redesign-preview`. Production has not been configured. Preview commit `0f53fc9` is READY. An external POST smoke check is blocked by Vercel SSO (`401 Protected deployment`), so a successful AI response on the hosted Preview is not yet verified. Local provider response has been verified separately; see `docs/DIRECTION_AUDIT_20261027.md`.

For local use, fill `hsk-story/.env` and run the project through Vercel local development so the serverless route and env file are both loaded. For the hosted project, add the same variable names under **Vercel → hsk-hai-que-huong → Settings → Environment Variables** for Preview/Production, then redeploy. Vercel deployments do not read an uploaded `.env` file.

## Failure email

After every configured AI model/key pair has failed, the function sends a generic alert to `admin@motngum.cafe`. The message includes a request ID, timestamp and count only; it contains no learner prompt or provider key. A warm function instance sends at most one alert every 15 minutes.

Cloudflare Email Sending must first have an onboarded sender domain, such as `motngum.cafe`. The From address in `CLOUDFLARE_ALERT_FROM` must belong to that onboarded domain, and Cloudflare DNS must have the Email Sending SPF/DKIM records. Create a Cloudflare API token scoped to **Email Sending: Edit** and fill `CLOUDFLARE_EMAIL_API_TOKEN`. The recipient is fixed in the backend. Email sending is not active until the sender domain is onboarded and the token is filled; without both, the AI still works and the alert attempt safely skips.

Cloudflare setup reference: [Send emails](https://developers.cloudflare.com/email-service/get-started/send-emails/), [Email Sending REST API](https://developers.cloudflare.com/email-service/api/send-emails/rest-api/).

## Fillable file

`hsk-story/.env` is the local, Git-ignored file. The provider key is configured locally; the Cloudflare Email Sending token is still blank. Never copy values from this file into source control or browser code. `hsk-story/.env.example` is the safe blank template for sharing/version control.
