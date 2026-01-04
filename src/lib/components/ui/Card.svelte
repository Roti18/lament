<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'default' | 'interactive' | 'glass';

	let {
		children,
		header,
		footer,
		variant = 'default',
		class: className = '',
		href = undefined,
		...rest
	}: {
		children: Snippet;
		header?: Snippet;
		footer?: Snippet;
		variant?: Variant;
		class?: string;
		href?: string;
		[key: string]: any;
	} = $props();

	const baseStyles =
		'rounded-2xl border border-surface-2 overflow-hidden transition-all duration-300';

	const variants = {
		default: 'bg-surface-1',
		interactive:
			'bg-surface-1 hover:border-surface-3 hover:bg-surface-2 hover:shadow-2xl cursor-pointer',
		glass: 'bg-surface-0/80 backdrop-blur-md border-surface-2'
	};

	const combinedClass = $derived(`${baseStyles} ${variants[variant]} ${className}`);
</script>

{#if href}
	<a {href} class={combinedClass} {...rest}>
		{#if header}
			<div class="border-b border-white/5 px-5 py-4">
				{@render header()}
			</div>
		{/if}
		<div class="p-5">
			{@render children()}
		</div>
		{#if footer}
			<div class="border-t border-white/5 px-5 py-4">
				{@render footer()}
			</div>
		{/if}
	</a>
{:else}
	<div class={combinedClass} {...rest}>
		{#if header}
			<div class="border-b border-white/5 px-5 py-4">
				{@render header()}
			</div>
		{/if}
		<div class="p-5">
			{@render children()}
		</div>
		{#if footer}
			<div class="border-t border-white/5 px-5 py-4">
				{@render footer()}
			</div>
		{/if}
	</div>
{/if}
