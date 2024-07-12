<script lang="ts">
  export let data
  export let form

  let { session } = data
  $: ({ session } = data)

  const provider = session?.user.app_metadata.provider
</script>

{#if session}
  <h2>Welcome to /self!</h2>
  <h3>User Information:</h3>
  <p style="margin-left: 10px;">ID: {session.user.id}</p>
  <p style="margin-left: 10px;">Email: {session.user.email || "not set"}</p>
  <p style="margin-left: 10px;">Phone Number: {session.user.phone || "not set"}</p>
  <p style="margin-left: 10px;">Nickname: {session.user.user_metadata.nickname || "not set"}</p>
  <form method="POST" action="?/delete_user">
    Delete a user by ID:
    <input name="user" type="text">
    <button style="margin-top: 12px;">Delete</button>
  </form>
  <form method="POST" action="?/update_nickname">
    Change your nickname:
    <input name="nickname" type="text" value={ form?.data?.nickname ?? ""}>
    <button style="margin-top: 12px;">Update</button>
    <button formaction="?/delete_nickname" style="margin-top: 12px;">Delete</button>
  </form>
  <form method="POST" action="?/update_phone">
    Change your phone number:
    <input name="phone" type="text">
    <button style="margin-top: 12px;">Update</button>
  </form>
  {#if provider === 'email'}
    <form method="POST" action="?/update_password">
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
{#if form?.verify}
  <form method="POST" action="?/verify_otp">
    <input name="otp" placeholder={`OTP sent to ${form?.phone}`} type="text">
    <input name="phone" type="hidden" value={form?.phone}>
    <button style="margin-top: 12px;">Verify</button>
  </form>
{/if}
