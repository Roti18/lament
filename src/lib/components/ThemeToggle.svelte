<script lang="ts">
	import { theme } from '$lib/stores/theme.svelte';
	import { Sun, Moon } from '@lucide/svelte';
</script>

<button
	onclick={() => theme.toggle()}
	class="flex h-10 w-10 items-center justify-center rounded-xl text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary active:scale-95"
	aria-label={theme.current === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
>
	{#if theme.current === 'dark'}
		<Sun class="h-5 w-5" />
	{:else}
		<Moon class="h-5 w-5" />
	{/if}
</button>
