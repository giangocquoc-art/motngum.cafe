# Chim Sẻ AI setup

## Provider

The tutor endpoint is `POST /api/ai/tutor`, a Vercel Node function. It accepts OpenAI-compatible chat completions from `https://api.psharehub.com/v1` and only allows the seven ordinary HSK1 practice scenes listed in `api/ai/tutor.js`. Checkpoints, the lost-notebook encounter, exam scenes and completed stories are rejected by the server even if a client tries to call it directly.

The function accepts up to four API keys in `PSHAREHUB_API_KEYS` (comma or newline separated), or the single `PSHAREHUB_API_KEY`. The model list below is tried in order; the backend rotates across model/key pairs and stops at the first non-empty answer. To discover models automatically instead, leave `PSHAREHUB_MODEL_IDS` blank and the function will read `/models`. Each provider request is capped at 1.2–2.2 seconds; with the four-key/four-model maximum, retries fit within the function's 60-second limit, including model discovery and the short failure alert. The endpoint requires a matching same-origin HTTPS `Origin` header; local HTTP is allowed for localhost development. It has a 12-request/minute per-instance limit, bounds request sizes, and keeps question text out of logs. This endpoint serves the public practice UI and does not establish an account identity. Do not prefix secrets with `VITE_`, `NEXT_PUBLIC_`, or put them in HTML/JavaScript.

Configured model IDs:

```text
nast/deepseek-ai/DeepSeek-V4.1-Flash
gemma-26b-a4b-it
glm-5.3-flash
tdug/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4
```

For Vercel, add `PSHAREHUB_MODEL_IDS` with these comma-separated IDs to the Preview and Production environments. Add the provider key using Vercel's encrypted environment-variable settings; the local `.env` file is not uploaded during deployment.

For local use, fill `hsk-story/.env` and run the project through Vercel local development so the serverless route and env file are both loaded. For the hosted project, add the same variable names under **Vercel → hsk-hai-que-huong → Settings → Environment Variables** for Preview/Production, then redeploy. Vercel deployments do not read an uploaded `.env` file.

## Failure email

After every configured AI model/key pair has failed, the function sends a generic alert to `admin@motngum.cafe`. The message includes a request ID, timestamp and count only; it contains no learner prompt or provider key. A warm function instance sends at most one alert every 15 minutes.

Cloudflare Email Sending must first have an onboarded sender domain, such as `motngum.cafe`. The From address in `CLOUDFLARE_ALERT_FROM` must belong to that onboarded domain, and Cloudflare DNS must have the Email Sending SPF/DKIM records. Create a Cloudflare API token scoped to **Email Sending: Edit** and fill `CLOUDFLARE_EMAIL_API_TOKEN`. The recipient is fixed in the backend. Email sending is not active until the sender domain is onboarded and the token is filled; without both, the AI still works and the alert attempt safely skips.

Cloudflare setup reference: [Send emails](https://developers.cloudflare.com/email-service/get-started/send-emails/), [Email Sending REST API](https://developers.cloudflare.com/email-service/api/send-emails/rest-api/).

## Fillable file

`hsk-story/.env` is the local, ignored file prepared for the owner. Its provider and email tokens are blank. `hsk-story/.env.example` is the safe template for sharing/version control.
