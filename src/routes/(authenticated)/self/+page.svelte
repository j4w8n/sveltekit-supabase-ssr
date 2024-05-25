<script lang="ts">
  export let data
  export let form

  $: ({ session } = data)
</script>

{#if session}
  <h2>Welcome to /self!</h2>
  <h4>Your id is {session.user.id}</h4>
  <h4>Your nickname is {session.user.user_metadata.nickname ?? "not set"}</h4>
  <form method="POST" action="?/update">
    Change your nickname:
    <input name="nickname" type="text" value={ form?.data.nickname ?? ""}>
    <button style="margin-top: 12px;">Update</button>
    <button formaction="?/delete" style="margin-top: 12px;">Delete</button>
  </form>
{/if}

{#if form?.error}
  <p style="color: red;">{form.error}</p>
{/if}
