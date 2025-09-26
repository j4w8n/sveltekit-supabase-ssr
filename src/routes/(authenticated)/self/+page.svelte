<script lang="ts">
  import { 
    convertEmail,
    convertProvider,
    deleteUser,
    deleteNickname,
    updateNickname,
    updatePassword,
    updatePhone,
    verifyOtp
  } from "./self.remote"
  import { getSession } from '$lib/supabase/supabase.remote.js'

  let session = $derived(getSession())
  
  let has_email_provider = $state(false)

  $effect(() => {
    const providers = session?.current?.user.app_metadata.providers
    has_email_provider = providers 
      ? providers.some((p: string) => p === 'email') 
      : session?.current?.user.app_metadata.provider === 'email'
  })
</script>

<svelte:boundary>
{#if session.current}
  <h2>Welcome to /self!</h2>
  <h3>User Information:</h3>
  <p style="margin-left: 10px;">ID: {session.current.user.id}</p>
  <p style="margin-left: 10px;">Email: {session.current.user.email || "not set"}</p>
  <p style="margin-left: 10px;">Phone Number: {session.current.user.phone || "not set"}</p>
  <p style="margin-left: 10px;">Nickname: {session.current.user.user_metadata.nickname || "not set"}</p>
  <form {...deleteUser}>
    Delete a user by ID:
    <input name="user" type="text">
    <button style="margin-top: 12px;">Delete</button>
  </form>
  <p style="color: red;">{deleteUser.result?.message}</p>
  <form {...updateNickname}>
    Change your nickname:
    <input name="nickname" type="text">
    <button style="margin-top: 12px;">Update</button>
    <button {...deleteNickname.buttonProps} style="margin-top: 12px;">Delete</button>
  </form>
  <p style="color: red;">{updateNickname.result?.message || deleteNickname.result?.message}</p>
  <form {...updatePhone}>
    Change your phone number:
    <input name="phone" type="text">
    <button style="margin-top: 12px;">Update</button>
  </form>
  <p style="color: red;">{updatePhone.result?.message}</p>
  {#if has_email_provider}
    <form {...updatePassword}>
      Change your password:
      <input name="password" type="password">
      <button style="margin-top: 12px;">Change</button>
    </form>
    <p style="color: red;">{updatePassword.result?.message}</p>
  {/if}
  {#if session.current.user.is_anonymous}
    <form {...convertProvider}>
      Convert to a permanent user:
      <button style="margin-top: 12px;" name="provider" value="github">Use GitHub auth</button>
    </form>
    <p style="color: red;">{convertProvider.result?.message}</p>
    <form {...convertEmail}>
      Convert to a permanent user:
      <input name="email" type="email" placeholder="email">
      <button style="margin-top: 12px;">Use email auth</button>
    </form>
    <p style="color: red;">{convertEmail.result?.message}</p>
  {/if}
{/if}

{#if updatePhone.result?.verify}
  {@const phone = updatePhone.input?.phone}
  <form {...verifyOtp} style="display: flex; flex-direction: column; width: 25%">
    <input name="otp" width="200" placeholder={`OTP sent to ${phone}`} type="text">
    {#if phone}<input name="phone" type="hidden" value={phone}>{/if}
    <button style="margin-top: 12px;">Verify</button>
  </form>
  <p style="color: red;">{verifyOtp.result?.message}</p>
{/if}
{#if convertEmail.result?.password_prompt}
  {@const email = convertEmail.input?.email}
  <form {...verifyOtp} style="display: flex; flex-direction: column; width: 25%">
    <input name="otp" width="200" placeholder={`OTP sent to ${email}`} type="text">
    {#if convertEmail.result?.password_prompt}
    <input name="password" placeholder="Enter new password" type="password">
    {/if}
    {#if email}<input name="email" type="hidden" value={email}>{/if}
    <button style="margin-top: 12px;">Verify</button>
  </form>
  <p style="color: red;">{verifyOtp.result?.message}</p>
{/if}

{#snippet pending()}
  <p>Loading...</p>
{/snippet}
</svelte:boundary>
