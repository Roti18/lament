<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		code: number;
		message?: string;
		showAction?: boolean;
	}

	let { code, message, showAction = true }: Props = $props();

	let time = $state(new Date().toISOString());

	onMount(() => {
		const interval = setInterval(() => {
			time = new Date().toISOString();
		}, 1000);
		return () => clearInterval(interval);
	});

	let finalMessage = $derived.by(() => {
		if (message) return message;
		switch (code) {
			case 404:
				return 'VOID_DETECTED';
			case 401:
				return 'ACCESS_DENIED';
			case 403:
				return 'FORBIDDEN_ZONE';
			case 500:
				return 'SYSTEM_PANIC';
			default:
				return 'UNKNOWN_EXCEPTION';
		}
	});

	function handleAction() {
		if (code === 404 || code === 403 || code === 401) {
			window.history.back();
		} else {
			window.location.reload();
		}
	}
</script>

<div
	class="relative min-h-screen w-full overflow-hidden bg-bg font-mono text-xs text-text-secondary selection:bg-accent selection:text-bg"
>
	<div class="absolute top-4 left-4 flex flex-col gap-1 opacity-50">
		<p>ERR :: {code}</p>
		<p>REF :: 0x{code.toString(16).toUpperCase()}</p>
	</div>

	<div class="absolute top-4 right-4 text-right opacity-50">
		<p>LAMENT_KERNEL_PANIC</p>
		<p>{time}</p>
	</div>

	<div class="absolute bottom-4 left-4 flex flex-col gap-1 opacity-50">
		<p>MEM_ALLOC: FAIL</p>
		<p>STACK: OVERFLOW</p>
	</div>

	<div class="absolute right-4 bottom-4 text-right opacity-50">
		<p>UID: NULL</p>
		<p>POS: UNKNOWN</p>
	</div>

	<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none">
		<h1
			class="text-[30vw] leading-none font-bold tracking-tighter text-surface-1 opacity-80 blur-[2px]"
		>
			{code}
		</h1>
	</div>

	<div class="relative z-10 flex h-screen w-full flex-col items-center justify-center">
		<div class="flex max-w-md flex-col gap-6 p-8 backdrop-blur-sm">
			<div class="flex flex-col gap-4 border-l-2 border-accent pl-6">
				<div class="flex items-center gap-2">
					<div class="h-1.5 w-1.5 animate-pulse rounded-full bg-accent"></div>
					<span class="text-[10px] tracking-[0.2em] text-text-muted uppercase"
						>Status: Critical</span
					>
				</div>

				<h2 class="text-4xl font-light text-text-primary italic">
					{finalMessage.toLowerCase()}
				</h2>

				<div class="flex flex-col gap-1 text-[10px] text-text-muted opacity-70">
					<p>initiating recovery sequence...</p>
					<p>tracing route context...</p>
					<p>failed to mount component</p>
					<p>{code} exception caught at main loop</p>
				</div>
			</div>

			{#if showAction}
				<button
					class="mt-6 ml-6 flex w-fit cursor-pointer items-center justify-center rounded border border-surface-3 bg-surface-1 px-8 py-3 text-sm font-medium text-text-primary transition-all duration-200 hover:!border-accent hover:!bg-surface-2 hover:!text-accent hover:!shadow-[0_0_15px_rgba(var(--color-accent),0.1)]"
					onclick={handleAction}
				>
					{code === 500 ? 'Reload Page' : 'Go Back'}
				</button>
			{/if}
		</div>
	</div>

	<div
		class="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
		style="background-image: linear-gradient(var(--color-text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-text-primary) 1px, transparent 1px); background-size: 100px 100px;"
	></div>
</div>
