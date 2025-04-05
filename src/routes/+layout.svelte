<script lang="ts">
  import { goto, invalidate } from '$app/navigation'
  import { onMount } from 'svelte'

  let { data, children } = $props()
  let { supabase, session } = $state(data)

  /**
   * We use `data.session` on this page,
   * so that when the value changes during invalidation
   * the UI updates automatically.
   * 
   * It's possible you might want to destructure `session`
   * from `$state(data)`, and use that in certain places,
   * but be careful or you can break functionality.
   */

  onMount(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, _session) => {
      /**
       * We check against `data.session`. Otherwise there would be 
       * invalidations for every event, because `session` isn't updated
       * during invalidations. The value of `session`
       * comes from initial page load or the last page refresh,
       * unless changed somewhere else on the page. e.g. you could call
       * `session = _session` below and you wouldn't need to use
       * `data.session` or necessarily call invalidate.
       */
      if (_session?.expires_at !== data.session?.expires_at) {
        /**
         * We only call `signOut()` on the server side,
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
  <!-- 
      We use `data.session` so that if it's `null`,
      the UI updates automatically.
    -->
  {#if data.session}
    <a href="/app">App</a>
    <a href="/self">Self</a>
    <!-- 
        If avatar_url will never change in realtime, or you don't care
        if it does, then using `session` instead of `data.session` would be ok.
        A page refresh would then be needed to reflect any updates.
      -->
    <img 
      style="width: 32px; height: 32px; border-radius: 9999px;" 
      src={data.session.user.user_metadata.avatar_url ?? 'https://api.dicebear.com/8.x/fun-emoji/svg'} 
      alt="person_avatar"
    >
    <!-- 
      We use `data.session` so that when the value changes
      from a session refresh, and therefore invalidation,
      the UI updates automatically.
      -->
    <p>
      Session expires at: {
        data.session?.expires_at 
        ? new Date(data.session.expires_at * 1000).toLocaleString() 
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
