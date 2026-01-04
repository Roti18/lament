<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass' | 'danger';
	type Size = 'xs' | 'sm' | 'md' | 'lg' | 'icon';

	let {
		children,
		variant = 'primary',
		size = 'md',
		class: className = '',
		loading = false,
		disabled = false,
		href = undefined,
		type = 'button',
		...rest
	}: {
		children: Snippet;
		variant?: Variant;
		size?: Size;
		class?: string;
		loading?: boolean;
		disabled?: boolean;
		href?: string;
		type?: 'button' | 'submit' | 'reset';
		[key: string]: any;
	} = $props();

	const baseStyles =
		'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]';

	const variants = {
		primary: 'bg-accent text-black font-bold border-2 border-white/30 hover:bg-accent-hover',
		secondary: 'bg-surface-2 text-text-primary border border-white/20 hover:bg-surface-3',
		outline: 'border border-white/10 bg-transparent hover:bg-surface-2 hover:text-text-primary',
		ghost: 'hover:bg-surface-2 hover:text-text-primary',
		glass:
			'border border-white/10 bg-surface-2/50 text-text-primary hover:bg-surface-2 hover:border-white/20',
		danger: 'bg-red-500 text-white font-bold border-2 border-red-400 hover:bg-red-600'
	};

	const sizes = {
		xs: 'h-7 px-2 text-[10px]',
		sm: 'h-8 px-3 text-xs',
		md: 'h-10 px-4 py-2',
		lg: 'h-12 px-8 py-3',
		icon: 'h-9 w-9'
	};
</script>

{#if href}
	<a {href} class="{baseStyles} {variants[variant]} {sizes[size]} {className}" {...rest}>
		{@render children()}
	</a>
{:else}
	<button
		{type}
		class="{baseStyles} {variants[variant]} {sizes[size]} {className}"
		disabled={loading || disabled}
		{...rest}
	>
		{#if loading}
			<svg
				class="mr-2 h-4 w-4 animate-spin"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
			>
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
				></circle>
				<path
					class="opacity-75"
					fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
				></path>
			</svg>
		{/if}
		{@render children()}
	</button>
{/if}
