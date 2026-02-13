<script lang="ts">
	import { X } from 'lucide-svelte';
	import { fade, scale } from 'svelte/transition';
	import Button from '$lib/components/ui/Button.svelte';

	let {
		open = $bindable(false),
		title,
		children,
		onclose
	}: {
		open: boolean;
		title?: string;
		children: any;
		onclose?: () => void;
	} = $props();

	function close() {
		open = false;
		if (onclose) onclose();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div
		class="fixed inset-0 z-[100] flex items-center justify-center p-4"
		transition:fade={{ duration: 200 }}
	>
		>
		<div
			class="absolute inset-0 bg-black/60 backdrop-blur-sm"
			onclick={close}
			onkeydown={(e) => e.key === 'Enter' && close()}
			role="button"
			tabindex="-1"
			aria-label="Close modal"
		></div>

		<div
			class="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-surface-1 shadow-2xl"
			transition:scale={{ start: 0.95, duration: 200 }}
			role="dialog"
			aria-modal="true"
			tabindex="-1"
		>
			{#if title}
				<div
					class="flex items-center justify-between border-b border-white/5 bg-surface-2/50 px-6 py-4"
				>
					<h2 class="text-xl font-bold text-text-primary">
						{title}
					</h2>
					<Button onclick={close} variant="ghost" size="icon" aria-label="Close">
						<X class="h-5 w-5" />
					</Button>
				</div>
			{/if}

			<div class="p-6">
				{@render children()}
			</div>
		</div>
	</div>
{/if}
