<script lang="ts">
  export let data
  export let form

  let { session } = data
  $: ({ session } = data)

  const provider = session?.user.app_metadata.provider
</script>

{#if session}
  <h2>Welcome to /self!</h2>
  <h4>Your id is {session.user.id}</h4>
  <h4>Your nickname is {session.user.user_metadata.nickname ?? "not set"}</h4>
  <form method="POST" action="?/delete_user">
    Delete a user:
    <input name="user" type="text">
    <button style="margin-top: 12px;">Delete</button>
  </form>
  <form method="POST" action="?/update">
    Change your nickname:
    <input name="nickname" type="text" value={ form?.data?.nickname ?? ""}>
    <button style="margin-top: 12px;">Update</button>
    <button formaction="?/delete" style="margin-top: 12px;">Delete</button>
  </form>
  {#if provider === 'email'}
    <form method="POST" action="?/password">
      Change your password:
      <input name="password" type="password">
      <button style="margin-top: 12px;">Change</button>
    </form>
  {/if}
  {#if session.user.is_anonymous}
    <form method="POST" action="?/convert_provider">
      Convert to a permanent user:
      <button style="margin-top: 12px;" name="provider" value="github">Use GitHub auth</button>
    </form>
    <form method="POST" action="?/convert_email">
      Convert to a permanent user:
      <input name="email" type="email" placeholder="email">
      <button style="margin-top: 12px;">Use email auth</button>
    </form>
  {/if}
{/if}

{#if form?.message}
  <p>{form.message}</p>
{/if}
{#if form?.error}
  <p style="color: red;">{form.error}</p>
{/if}
