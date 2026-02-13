<script lang="ts">
	import { page } from '$app/state';
	import ErrorPage from '$lib/components/ErrorPage.svelte';

	let code = $derived(page.status || 500);
	let message = $derived(page.error?.message || 'Something went wrong');
</script>

<svelte:head>
	<title>{code} | Lament</title>
</svelte:head>

<ErrorPage {code} {message} />
