<script lang="ts">
	export let width: string = '100%';
	export let height: string = '1rem';
	export let borderRadius: string = '0.5rem';
	export let className: string = '';
</script>

<div
	class="skeleton {className}"
	style="width: {width}; height: {height}; border-radius: {borderRadius};"
></div>

<style>
	.skeleton {
		background: linear-gradient(
			90deg,
			rgba(255, 255, 255, 0.05) 25%,
			rgba(255, 255, 255, 0.1) 50%,
			rgba(255, 255, 255, 0.05) 75%
		);
		background-size: 200% 100%;
		animation: loading 1.5s infinite;
	}

	@keyframes loading {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}
</style>
