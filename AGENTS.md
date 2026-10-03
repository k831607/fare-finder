<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project architecture

- Backend is the user-owned Supabase project `wvzrjguaerlzdxrtuubf` (FlightPriceNotifier001), configured via `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY`. Use Supabase's built-in `auth.users` record only; v1 intentionally has no profile or domain tables because route subscriptions come later.
- This is a plain Vite + React SPA (no SSR, no TanStack Start, no Cloudflare/wrangler). `vite build` emits a static site to `dist/`; `vercel.json` rewrites every path to `index.html` so deep links resolve client-side.
- Routes live in `src/router.tsx` (React Router). Pages live in `src/pages/`.
- Keep signed-in screens nested under the `<RequireAuth />` layout route (`src/components/layout/require-auth.tsx`) so access checks stay centralized and consistent.
- Only `VITE_*` env vars reach the browser bundle; never put secrets (e.g. service-role keys) in them.
