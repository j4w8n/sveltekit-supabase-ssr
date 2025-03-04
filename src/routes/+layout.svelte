<script lang="ts">
  import { invalidate } from '$app/navigation'

  let { data, children } = $props()
  let { supabase, session } = $state(data)

  $effect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, _session) => {
      if (_session?.expires_at !== session?.expires_at) {
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
    <!-- 
      We use `data.session` so that when the value changes during invalidation,
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
