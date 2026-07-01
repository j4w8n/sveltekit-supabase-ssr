<script lang="ts">
  import '../app.css'
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

<nav
  class="flex flex-wrap items-center gap-4 border-b border-slate-200 bg-white px-6 py-3 shadow-sm"
>
  <a href="/" class="font-semibold text-slate-900 hover:text-indigo-600">Home</a>
  {#if session}
    <a href="/app" class="text-slate-600 hover:text-indigo-600">App</a>
    <a href="/self" class="text-slate-600 hover:text-indigo-600">Self</a>
    <div class="ml-auto flex items-center gap-3">
      <img
        class="h-8 w-8 rounded-full ring-2 ring-slate-100"
        src={session.user.user_metadata.avatar_url ?? 'https://api.dicebear.com/8.x/fun-emoji/svg'}
        alt="person_avatar"
      />
      <p class="hidden text-xs text-slate-500 sm:block">
        Session expires: {session?.expires_at
          ? new Date(session.expires_at * 1000).toLocaleString()
          : 'unknown'}
      </p>
      <form method="POST" action="auth?/signout">
        <button
          class="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
        >
          Logout
        </button>
      </form>
    </div>
  {:else}
    <a href="/auth" class="ml-auto text-slate-600 hover:text-indigo-600">Login</a>
  {/if}
</nav>

<main class="min-h-screen bg-slate-50 px-6 py-8">
  {@render children?.()}
</main>
