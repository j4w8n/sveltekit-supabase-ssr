# Auth and User Demo

Uses SvelteKit, Supabase, and SSR Auth.

## Code Showcase

- Email sign-up/sign-in.
- Phone OTP sign-in.
- Reset password for email sign-in.
- Anonymous sign in.
- Convert Anonymous user to permanent user.
- GitHub sign-in. Can easily be changed to other oauth providers.
- Requires a session to access all pages under the `authenticated` layout group.
- Add, change, remove custom `nickname` user_metadata on the `/self` page.
- Add or change a user's phone number on the `/self` page.
- Delete a user on the `/self` page - if needed, when playing around with the demo.

> All actions happen server-side.

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
    
    Rename the `.env.example` file to `.env.local` in your project's root directory and assign values. They can be found in your Supabase project's dashboard at Project Settings > Data API. !!! Never expose your `JWT_SECRET` on the client side !!!
    ```
    PUBLIC_SUPABASE_ANON_KEY=<your-project-anon-key>
    PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
    JWT_SECRET=<your-project-jwt-secret>
    SUPABASE_SERVICE_ROLE_KEY=<your-project-service-role-key>
    ```

2. If using the signup, magiclink, or reset password features, change their email template anchor links per the below. In your Supabase project's dashboard, go to Authentication > Emails.

    All need this: `href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email"`, which should replace the `{{ .ConfirmationURL }}`, and then there are some additions for magic link and reset:

    - Magic Link: add `&next=/app` at the end of the above href.
    - Reset Password: add `&next=/self` at the end of the above href.

3. Site URL and Redirect URLs. In your Supabase project's dashboard, go to Authentication > URL Configuration, and change them to reflect the below.
    - Site:
        - `http://localhost:5173`
    - Redirects:
        - `http://localhost:5173/auth/confirm`
        - `http://localhost:5173/auth/callback`

4. User and provider settings. In your Supabase project's dashbord, go to Authentication > Sign In / Up
    - Under "User Signups", ensure that all three settings are enabled.
    - Under "Auth Providers", enable and configure the relevant ones for you.
        - If using the phone OTP login, you must setup an SMS provider. You can use Twilio Verify and get a $15 credit.

## Run!

```
npm run dev
```

Open a browser to http://localhost:5173

## Security

Within the `(authenticated)` layout group, we have a `+page.server.ts` file for each route. This ensures that even during client navigation the `hooks.server.ts` file is run so that we can verify there's still a session before rendering the page.

We check for and fully validate the session by calling `event.locals.getSession()`. Inside that function, we verify the `access_token`, aka JWT, and use it's decoded contents to help create a validated session for use on the server-side.

Full validation is important because sessions are stored in a cookie sent from a client. The client could be an attacker with just enough information to bypass checks within `supabase.auth.getSession()` and possibly render data for a victim user. See [this discussion](https://github.com/orgs/supabase/discussions/23224) for details.

!!! Just verifying the JWT does not validate other information within getSession's `session.user` object; this is a big reason why we do the "full validation" by replacing its contents using info from the verified and decoded JWT. See discussion link above. !!!
