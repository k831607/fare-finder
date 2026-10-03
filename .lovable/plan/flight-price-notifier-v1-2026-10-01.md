# Flight Price Notifier v1

## Goal
Build a polished bilingual landing page, email/password authentication, and a protected placeholder dashboard for budget-focused travelers.

## Public experience
- Replace the starter screen at `/` with a dark, near-black landing page using violet accents and Inter typography.
- Add a compact header with the product name and a top-right “Sign in / 登入” action.
- Create an editorial hero that clearly presents “Flight Price Notifier,” the supplied Chinese value proposition, English subtitle, and a sign-in call to action.
- Add exactly three feature cards using the supplied bilingual titles and descriptions.
- Finish with `© 2026 Flight Price Notifier`.
- Use restrained route-line and fare-alert visuals plus subtle entrance animation, with motion reduced when the visitor requests it.

## Authentication
- Use Supabase Auth (email/password) on the user-owned Supabase project `wvzrjguaerlzdxrtuubf`, using only the built-in user account record—no profiles or custom tables.
- Disable email confirmation so successful signup can immediately continue into the app, as requested for this v1.
- Add a public auth page with distinct Sign In and Sign Up modes, clear validation, loading, and error states.
- Keep authentication state synchronized globally so navigation reflects sign-in and sign-out immediately.

## Authenticated app
- Add a protected `/app` page that redirects signed-out visitors to authentication.
- Show `Hi {user.email}`, the supplied bilingual dashboard placeholder, and a header Sign Out control.
- On sign out, clear private cached state and return the user to the auth page.

## Quality and verification
- Add route-specific page titles, descriptions, Open Graph metadata, and Twitter card metadata.
- Confirm desktop and mobile layouts, sign-up/sign-in/sign-out behavior, protected-route redirection, keyboard focus, readable contrast, and reduced-motion behavior.
- Do not add route subscriptions, target prices, fares, payments, or custom database tables.

## Technical notes
- Keep the existing TanStack Start routing and use the Lovable-managed authentication client and protected-route pattern.
- Define all colors and typography through shared semantic design tokens; use existing project controls where available and create only the small shared controls needed by this v1.
