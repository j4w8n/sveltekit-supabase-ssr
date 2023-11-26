<script lang="ts">
  export let form
</script>

<form method="POST" action="?/signin">
  <input name="email" placeholder="email" type="email" value={form?.data?.email ?? ""}>
  <input name="password" placeholder="password" type="password">
  <button style="margin-top: 12px;">Login</button>
  <button formaction="?/signup" style="margin-top: 12px;">Signup</button>
</form>
<form method="POST" action="?/signin">
  <button style="margin-top: 12px;" name="provider" value="github">Login with GitHub</button>
</form>

{#if form?.message}
  <p>{form.message}</p>
{/if}
{#if form?.error}
  <p>{form.error}</p>
{/if}