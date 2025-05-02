<script lang="ts">
  import { goto, invalidate } from '$app/navigation'
  import { onMount } from 'svelte'

  let { data, children } = $props()

  /**
   * We use the $derived rune so that
   * `supabase` and `session` are updated
   * during invalidation. $state doesn't do this.
   * 
   * An updated supabase client isn't typically needed,
   * but the ssr libary returns a cached client
   * for us during invalidation. Otherwise we'd be
   * initializing a client during every invalidation.
   */
  let { supabase, session } = $derived(data)

  onMount(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, _session) => {
      /**
       * Instead of invalidating, you could call
       * `session = _session` below and you wouldn't
       * necessarily need to call `invalidate`.
       */
      if (_session?.expires_at !== session?.expires_at) {
        /**
         * We typically only call `signOut()` on the server side,
         * but if `_session` is null - from the user
         * being deleted or the supabase client
         * failing to refresh a token, for example -
         * the SIGNED_OUT event is fired, and
         * calling `goto` ensures the user's screen 
         * reflects that they're logged out.
         * Note that the invalidation still happens.
         */
        if (event === 'SIGNED_OUT') await goto('/')

        invalidate('supabase:auth')
      }
    })

    return () => subscription.unsubscribe()
  })
</script>

<nav style="border: solid; border-width: 0 0 2px; padding-bottom: 5px;">
  <a href="/">Home</a>
  {#if session}
    <a href="/app">App</a>
    <a href="/self">Self</a>
    <img 
      style="width: 32px; height: 32px; border-radius: 9999px;" 
      src={session.user.user_metadata.avatar_url ?? 'https://api.dicebear.com/8.x/fun-emoji/svg'} 
      alt="person_avatar"
    >
    <p>
      Session expires at: {
        session?.expires_at 
        ? new Date(session.expires_at * 1000).toLocaleString() 
        : 'unknown'
      }
    </p>
    <form method="POST" action="auth?/signout">
      <button>Logout</button>
    </form>
  {:else}
    <a href='/auth'>Login</a>
  {/if}
</nav>

{@render children?.()}
