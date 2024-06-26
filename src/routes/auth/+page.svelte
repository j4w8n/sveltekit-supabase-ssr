<script lang="ts">
  export let form
</script>

<form method="POST" action="?/signin">
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