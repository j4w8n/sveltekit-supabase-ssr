<script lang="ts">
	let { children } = $props();
</script>

<h1>You're inside the auth-protected (authenticated) layout group!</h1>
{@render children?.()}
