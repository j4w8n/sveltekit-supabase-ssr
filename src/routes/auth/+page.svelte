<script lang="ts">
  export let form
</script>

<form method="POST" action="?/signin_email">
  <input name="email" placeholder="email" type="email" value={form?.data?.email ?? ""}>
  <input name="password" placeholder="password" type="password">
  <button style="margin-top: 12px;">Login</button>
  <button formaction="?/signup" style="margin-top: 12px;">Signup</button>
</form>
<form method="POST" action="?/oauth">
  <button style="margin-top: 12px;" name="provider" value="github">Login with GitHub</button>
</form>
<form method="POST" action="?/magic">
  <input name="email" placeholder="email" type="email">
  <button style="margin-top: 12px;">Login with magic link</button>
</form>
<form method="POST" action="?/signin_otp">
  <input name="phone" placeholder="phone number" type="text">
  <button style="margin-top: 12px;">Login with phone OTP</button>
</form>
<form method="POST" action="?/anon">
  <button style="margin-top: 12px;">Login Anonymously</button>
</form>
<form method="POST" action="?/reset">
  <input name="email" placeholder="email" type="email">
  <button style="margin-top: 12px;">Reset Your Password</button>
</form>

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
