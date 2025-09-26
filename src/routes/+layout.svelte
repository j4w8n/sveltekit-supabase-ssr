<script lang="ts">
  import { goto } from "$app/navigation"
  import { createBrowserClient } from "$lib/supabase/browser.js"
  import { onMount } from "svelte"
  import { signout } from "./auth/auth.remote.js"
  import { getSession } from "$lib/supabase/supabase.remote.js"

  let { children } = $props()
  let session = $derived(getSession())

  // We mostly use this browser client and onAuthStateChange
  // to refresh tokens and update the session for demo app purposes.
  // They're not strictly needed.

  const supabase = createBrowserClient()
  onMount(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, _session) => {
      if (_session?.expires_at !== session.current?.expires_at) {
        // Keep session updated for demo purposes in the nav bar.
        getSession().set(_session)

        /**
         * We typically only call `signOut()` on the server side,
         * but if `_session` is null - from the user
         * being deleted or the supabase client
         * failing to refresh a token, for example -
         * the SIGNED_OUT event is fired, and
         * calling `goto` ensures the user's screen 
         * reflects that they're logged out.
         */
        if (event === 'SIGNED_OUT') await goto('/')
      }
    })

    return () => subscription.unsubscribe()
  })
</script>

<svelte:boundary>
<nav style="border: solid; border-width: 0 0 2px; padding-bottom: 5px;">
  <a href="/">Home</a>
  {#if session.current}
    <a href="/app">App</a>
    <a href="/self">Self</a>
    <img 
      style="width: 32px; height: 32px; border-radius: 9999px;" 
      src={session.current.user.user_metadata.avatar_url ?? 'https://api.dicebear.com/8.x/fun-emoji/svg'} 
      alt="person_avatar"
    >
    <p>
      Session expires at: {
        session.current.expires_at 
        ? new Date(session.current.expires_at * 1000).toLocaleString() 
        : 'unknown'
      }
    </p>
    <form {...signout}>
      <button>Logout</button>
    </form>
  {:else}
    <a href='/auth'>Login</a>
  {/if}
</nav>
{#snippet pending()}
  <p>Loading...</p>
{/snippet}
</svelte:boundary>

{@render children?.()}
