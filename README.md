# Auth and User Demo

Uses SvelteKit, Supabase, and SSR Auth.

## Code Showcase

- Email sign-up/sign-in.
- Anon sign in.
- GitHub sign-in. Can easily be changed to other oauth providers.
- Requires a session to access all pages under the `authenticated` layout group.
- Add, change, remove custom `nickname` user_metadata on the `/self` page.

> All sign-up and sign-ins happen server-side.

## Prerequisites

1. A Supabase account.
2. A Supabase project.

## Install

```
git clone https://github.com/j4w8n/sveltekit-supabase-ssr.git
cd sveltekit-supabase-ssr
npm install
```

## Setup

1. Environment variables.
    
    Create a `.env.local` file in your project's root directory, adding the below. The values can be found in your Supabase project's dashboard at Project Settings > API. !!! Never expose your `JWT_SECRET` on the client side !!!
    ```
    PUBLIC_SUPABASE_ANON_KEY=<your-project-anon-key>
    PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
    JWT_SECRET=<your-project-jwt-secret>
    ```

2. If using the demo's signup or magiclink login, change your email template links per the below. You can find these settings in your Supabase project's dashboard at Authentication > Email Templates.

    - Confirm signup: `href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email"`
    - Magic Link: `href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email"`

3. Site URL and Redirect URLs

    Login to your Supabase dashboard, then go to your project > Authentication > URL Configuration, and add these:
    - Site:
        - `http://localhost:5173`
    - Redirects:
        - `http://localhost:5173/auth/confirm`
        - `http://localhost:5173/auth/callback`

## Run!

```
npm run dev
```

Open a browser to http://localhost:5173

## Security

Within the `(authenticated)` layout group, we have a `+page.server.ts` file for each route. This ensures that even during client navigation we can verify there's still a session before rendering the page.

We check for and fully validate the session by calling `event.locals.getSession()`. Inside that function, we verify the `access_token`, aka JWT, and use it's decoded contents to help create a validated session for use on the server-side.

Full validation is important because sessions are stored in a cookie sent from a client. The client could be an attacker with just enough information to bypass checks within `supabase.auth.getSession()` and possibly render data for a victim user. See [this discussion](https://github.com/orgs/supabase/discussions/23224) for details.

!!! Simply verifying the JWT does not validate the `session.user` object, for using it's info to render sensitive user data on the server-side. See discussion link above. !!!
