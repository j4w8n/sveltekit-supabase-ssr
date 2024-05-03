<script lang="ts">
  export let data
  
  $: ({ session } = data)
</script>

{#if session}
  <h2>Welcome to /self!</h2>
  <h4>Your id is {session.user.id}</h4>
{/if}
