<script lang="ts">
  export let form
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
