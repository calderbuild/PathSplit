# OAuth Launch Validation

## Goal

Verify that the public PathSplit deployment is both reachable by judges and counted by the hackathon Portal.

## Before Launch

- Confirm `NEXT_PUBLIC_APP_URL` matches the public production domain.
- Confirm `SECONDME_REDIRECT_URI=https://<public-domain>/api/auth/callback`.
- Confirm Portal project page contains the same `SECONDME_CLIENT_ID` used in production.
- Confirm at least one `SECONDME_AGENT_*_REFRESH_TOKEN` is set in production for mixed-mode demo.

## Runtime Checks

- Start one login from Hero:
  - Search logs for `pathsplit_oauth_login_started`
- Finish one login from the evidence-card CTA:
  - Search logs for `pathsplit_oauth_login_completed`
- If a login fails:
  - Search logs for `pathsplit_oauth_login_failed` or `pathsplit_oauth_login_denied`

## Healthy Signals

- Public URL is reachable without Vercel auth.
- `/api/auth/callback` returns to `/` with `auth=connected`.
- Logs show both `pathsplit_oauth_login_started` and `pathsplit_oauth_login_completed`.
- Session API returns `connected: true` after callback.
- Portal team double-checks that `Client ID` and Demo URL are filled in before submission.

## Failure Signals

- Callback lands on `auth=failed-state` or `auth=failed-exchange`.
- No `pathsplit_oauth_login_completed` logs after a real authorization.
- Production cards all show demo mode because no `SECONDME_AGENT_*_REFRESH_TOKEN` is configured.
- Shared URL requires preview auth or internal permissions.
