<script lang="ts">
  import { 
    convertEmail,
    convertProvider,
    deleteNickname,
    updateNickname,
    updatePassword,
    updatePhone,
    verifyOtp
  } from "./self.remote.js"
  import { getSession } from "$lib/supabase/supabase.remote.js"
  import * as v from "valibot"

  let session = $derived(await getSession())
  
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
  <form {...updateNickname.preflight(v.object({ nickname: v.string() }))}>
    Change your nickname:
    <input {...updateNickname.fields.nickname.as("text")}>
    {#each updateNickname.fields.nickname.issues() as issue}
      <p style:color='red' style:width="250px">nickname: {issue.message}</p>
    {/each}
    <button style="margin-top: 12px;">Update</button>
    <button {...deleteNickname.fields.action.as("submit", "_")} style="margin-top: 12px;">Delete</button>
  </form>
  <p style="color: red;">{updateNickname.result?.message || deleteNickname.result?.message}</p>

  <form {...updatePhone}>
    Change your phone number:
    <input {...updatePhone.fields.phone.as("text")}>
    {#each updatePhone.fields.phone.issues() as issue}
      <p style:color='red' style:width="250px">phone: {issue.message}</p>
    {/each}
    <button style="margin-top: 12px;">Update</button>
  </form>
  <p style="color: red;">{updatePhone.result?.message}</p>

  {#if has_email_provider}
    <form {...updatePassword}>
      Change your password:
      <input {...updatePassword.fields._password.as("password")}>
      {#each updatePassword.fields._password.issues() as issue}
        <p style:color='red' style:width="250px">password: {issue.message}</p>
      {/each}
      <button style="margin-top: 12px;">Change</button>
    </form>
    <p style="color: red;">{updatePassword.result?.message}</p>
  {/if}

  {#if session.user.is_anonymous}
    <form {...convertProvider}>
      Convert to a permanent user:
      <button style="margin-top: 12px;" name="provider" value="github">Use GitHub auth</button>
    </form>
    <p style="color: red;">{convertProvider.result?.message}</p>
    <form {...convertEmail}>
      Convert to a permanent user:
      <input {...convertEmail.fields.email.as("email")} placeholder="email">
      {#each convertEmail.fields.email.issues() as issue}
        <p style:color='red' style:width="250px">email: {issue.message}</p>
      {/each}
      <button style="margin-top: 12px;">Use email auth</button>
    </form>
    <p style="color: red;">{convertEmail.result?.message}</p>
  {/if}
{/if}

{#if updatePhone.result?.verify}
  <form {...verifyOtp} style="display: flex; flex-direction: column; width: 25%">
    <input 
      {...verifyOtp.fields.otp.as("text")}
      placeholder="Enter the OTP"
      width="200"
    >
    {#each verifyOtp.fields.otp.issues() as issue}
      <p style:color='red' style:width="250px">otp: {issue.message}</p>
    {/each}
    <input name="phone" type="hidden" value={updatePhone.result?.phone}>
    <button style="margin-top: 12px;">Verify</button>
  </form>
  <p style="color: red;">{verifyOtp.result?.message}</p>
{/if}

{#if convertEmail.result?.verify}
  <form {...verifyOtp} style="display: flex; flex-direction: column; width: 25%">
    <input 
      {...verifyOtp.fields.otp.as("text")}
      placeholder="Enter the OTP"
      width="200"
    >
    {#each verifyOtp.fields.otp.issues() as issue}
      <p style:color='red' style:width="250px">otp: {issue.message}</p>
    {/each}
    <input 
      {...verifyOtp.fields._password.as("password")}
      placeholder="Enter new password"
    >
    {#each verifyOtp.fields._password.issues() as issue}
      <p style:color='red' style:width="250px">password: {issue.message}</p>
    {/each}
    <input {...convertEmail.fields.email.as("hidden", convertEmail.result?.email)}>
    <button style="margin-top: 12px;">Verify</button>
  </form>
  <p style="color: red;">{verifyOtp.result?.message}</p>
{/if}
