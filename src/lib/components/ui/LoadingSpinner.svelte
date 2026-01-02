<script lang="ts">
	import { fade } from 'svelte/transition';

	let {
		fullScreen = false,
		size = 'md',
		class: className = ''
	} = $props<{
		fullScreen?: boolean;
		size?: 'sm' | 'md' | 'lg';
		class?: string;
	}>();

	const sizeClasses = {
		sm: 'h-5 w-5 border-2',
		md: 'h-8 w-8 border-3',
		lg: 'h-12 w-12 border-4'
	};
</script>

<div
	in:fade={{ duration: 200 }}
	class="flex items-center justify-center {fullScreen
		? 'fixed inset-0 z-[100] bg-surface-0/10 backdrop-blur-sm'
		: 'h-full min-h-[200px] w-full'} {className}"
>
	<div
		class="{sizeClasses[
			size as keyof typeof sizeClasses
		]} animate-spin rounded-full border-surface-2 border-t-accent shadow-[0_0_15px_rgba(var(--accent-rgb),0.2)]"
	></div>
</div>
