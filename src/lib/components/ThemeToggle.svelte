<script lang="ts">
	import { theme } from '$lib/stores/theme.svelte';
	import { Sun, Moon } from '@lucide/svelte';
	import Button from '$lib/components/ui/Button.svelte';

	interface Props {
		size?: 'sm' | 'md' | 'icon';
	}

	let { size = 'icon' }: Props = $props();
</script>

<Button
	onclick={() => theme.toggle()}
	variant="ghost"
	size={size}
	class="rounded-xl"
	aria-label={theme.current === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
>
	{#if theme.current === 'dark'}
		<Sun class="h-5 w-5" />
	{:else}
		<Moon class="h-5 w-5" />
	{/if}
</Button>
