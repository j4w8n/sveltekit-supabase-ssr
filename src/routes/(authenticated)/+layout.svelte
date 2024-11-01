<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<h1>You're inside the auth-protected (authenticated) layout group!</h1>
{@render children?.()}
