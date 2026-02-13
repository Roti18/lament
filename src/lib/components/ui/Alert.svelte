<script lang="ts">
	type AlertVariant = 'error' | 'warning' | 'success' | 'info';

	let {
		children,
		variant = 'error',
		class: className = ''
	}: { children: any; variant?: AlertVariant; class?: string } = $props();

	const variants: Record<AlertVariant, string> = {
		error: 'border-red-500/20 bg-red-500/10 text-red-400',
		warning: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400',
		success: 'border-green-500/20 bg-green-500/10 text-green-400',
		info: 'border-blue-500/20 bg-blue-500/10 text-blue-400'
	};
</script>

<div
	class="rounded-lg border p-4 text-sm {variants[variant] || variants.error} {className}"
	role="alert"
>
	{@render children()}
</div>
