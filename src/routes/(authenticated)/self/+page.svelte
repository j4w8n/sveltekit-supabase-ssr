<script lang="ts">
  let { data, form } = $props()
  let { session } = $derived(data)
  
  let has_email_provider = $state(false)

  $effect(() => {
    const providers = session?.user.app_metadata.providers
    has_email_provider = providers 
      ? providers.some((p: string) => p === 'email') 
      : session?.user.app_metadata.provider === 'email'
  })
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
    <input name="nickname" type="text" value={form?.nickname ?? ""}>
    <button style="margin-top: 12px;">Update</button>
    <button formaction="?/delete_nickname" style="margin-top: 12px;">Delete</button>
  </form>
  <form method="POST" action="?/update_phone">
    Change your phone number:
    <input name="phone" type="text">
    <button style="margin-top: 12px;">Update</button>
  </form>
  {#if has_email_provider}
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
  <form method="POST" action="?/verify_otp" style="display: flex; flex-direction: column; width: 25%">
    <input name="otp" width="200" placeholder={`OTP sent to ${form?.phone ?? form?.email}`} type="text">
    {#if form?.password_prompt}
    <input name="password" placeholder="Enter new password" type="password">
    {/if}
    {#if form?.phone}<input name="phone" type="hidden" value={form.phone}>{/if}
    {#if form?.email}<input name="email" type="hidden" value={form.email}>{/if}
    <button style="margin-top: 12px;">Verify</button>
  </form>
{/if}
