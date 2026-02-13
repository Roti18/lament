<script lang="ts">
	let { size = '40px', class: className = '' } = $props<{ size?: string; class?: string }>();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 128 128"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	class={className}
>
	<text
		x="50%"
		y="55%"
		text-anchor="middle"
		dominant-baseline="middle"
		font-family="Georgia, 'Times New Roman', serif"
		font-size="110"
		font-weight="400"
		font-style="italic"
		fill="currentColor"
	>
		L
	</text>
</svg>
