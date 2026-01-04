<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	let { class: className, value = $bindable(), ...rest }: HTMLInputAttributes = $props();
</script>

<input
	bind:value
	class="w-full rounded-xl border border-white/10 bg-surface-1 px-4 py-3 text-text-primary transition-all outline-none placeholder:text-text-muted focus:border-accent/50 focus:ring-1 focus:ring-accent/50 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/50 focus-visible:outline-none {className}"
	style="outline: none !important;"
	{...rest}
/>
