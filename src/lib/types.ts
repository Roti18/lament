export interface Track {
	id: string;
	title: string;
	artists: { id: string; name: string }[];
	album?: string;
	albumId?: string;
	duration: number;
	coverUrl?: string;
	coverThumb?: string;
	audioUrl: string;
}

export interface Album {
	id: string;
	title: string;
	artist: string;
	artistId: string;
	coverUrl?: string;
	coverThumb?: string;
	releaseYear?: number;
	tracks: Track[];
}

export interface Artist {
	id: string;
	name: string;
	imageUrl?: string;
	imageThumb?: string;
	bio?: string;
	tracks?: Track[];
	albums?: Album[];
}

export interface Playlist {
	id: string;
	title: string;
	description?: string;
	coverUrl?: string;
	coverThumb?: string;
	trackCount: number;
	tracks: Track[];
}

export interface User {
	id: string;
	displayName: string;
	username: string;
	avatarUrl?: string;
	bio?: string;
	stats?: UserStats;
}

export interface UserStats {
	playlistCount?: number;
	followersCount?: number;
	followingCount?: number;
}

export interface PlayerState {
	currentTrack: Track | null;
	isPlaying: boolean;
	isBuffering: boolean;
	queue: Track[];
	queueIndex: number;
	currentTime: number;
	duration: number;
	volume: number;
}

export type RepeatMode = 'off' | 'all' | 'one';

export interface SearchResult {
	artists: Artist[];
	albums: Album[];
	tracks: Track[];
}
