<script lang="ts">
  export let data
  
  $: ({ session } = data)
</script>

{#if session}
  <h1>Welcome to /admin!</h1>
  <h4>The session is working across pages!</h4>
  <h4>Your id is {session.user.id}</h4>
{/if}