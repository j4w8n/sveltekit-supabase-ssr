# MVP for "SSalSA" stack

SvelteKit, Supabase, and lovely SSR Auth

## Code Showcase

- Email sign-up.
- Email/password login.
- Server-side GitHub login. Can easily be changed to other oauth providers.
- Requires a session to access all pages under the `authenticated` layout group.

## Install

> Tweak your Sveltekit creation as desired.

```
npm create svelte@latest sveltekit-supabase-ssr
  > Skeleton project
  > Yes, using Typescript syntax
  > none

cd sveltekit-supabase-ssr
npm install

npm install @supabase/supabase-js @supabase/ssr
```

## Setup

1. Supabase types
    ```
    supabase init
    supabase link --project-ref <your-project-id>
    supabase gen types typescript --linked > src/lib/database.d.ts
    ```

2. Environment variables.
    
    Create a `src/env.local` file.
    ```
    PUBLIC_SUPABASE_ANON_KEY=<your-project-anon-key>
    PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
    ```

3. Change email templates, per [official docs](https://supabase.com/docs/guides/auth/server-side/email-based-auth-with-pkce-flow-for-ssr?framework=sveltekit#update-email-templates-with-url-for-api-endpoint)

## Run!

```
npm run dev
```

Open a browser to http://localhost:5173