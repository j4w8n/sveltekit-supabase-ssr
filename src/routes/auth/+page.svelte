<script lang="ts">
  import type { Provider } from '@supabase/supabase-js'

  export let data, form

  let { supabase } = data
  $: ({ supabase } = data)

  const signInWithOAuth = async (provider: Provider) => {
    const { error } = await supabase.auth.signInWithOAuth({ 
      provider
    })
    if (error) console.error(error)
  }
</script>

{#if form?.message}
  <p>{form.message}</p>
{/if}

<form method="POST" action="?/signin">
  <input name="email" placeholder="email">
  <input name="password" placeholder="password">
  <button style="margin-top: 12px;">Login</button>
  <button formaction="?/signup" style="margin-top: 12px;">Signup</button>
</form>
<form method="POST" action="?/signin">
  <button style="margin-top: 12px;" name="provider" value="github">Login with GitHub ServerSide</button>
</form>
<button style="margin-top: 12px;" on:click={() => signInWithOAuth('github')}>Login with GitHub ClientSide</button>
