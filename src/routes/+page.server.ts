import { api } from '$lib/server/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const [tracks, albums, artists] = await Promise.all([
        api.getRandTracks(10),
        api.getRandAlbums(4),
        api.getRandArtists(6)
    ]);

    return {
        recentTracks: tracks.slice(0, 5),
        albums: albums.slice(0, 4),
        artists: artists.slice(0, 6)
    };
};
