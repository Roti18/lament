import { browser } from '$app/environment';
import type { Track, RepeatMode } from '$lib/types';

const VOLUME_STORAGE_KEY = 'lament:volume';
const TIME_UPDATE_INTERVAL = 100;

function createAudioElement(): HTMLAudioElement | null {
    if (!browser) return null;
    const audio = new Audio();
    audio.preload = 'metadata';
    return audio;
}

function loadPersistedVolume(): number {
    if (!browser) return 1;
    const stored = localStorage.getItem(VOLUME_STORAGE_KEY);
    return stored ? parseFloat(stored) : 1;
}

function persistVolume(vol: number): void {
    if (!browser) return;
    localStorage.setItem(VOLUME_STORAGE_KEY, String(vol));
}

let audio: HTMLAudioElement | null = null;

let currentTrack = $state<Track | null>(null);
let isPlaying = $state(false);
let isBuffering = $state(false);
let originalQueue = $state<Track[]>([]);
let queue = $state<Track[]>([]);
let queueIndex = $state(0);
let shuffleEnabled = $state(false);
let repeatMode = $state<RepeatMode>('off');
let currentTime = $state(0);
let duration = $state(0);
let volume = $state(1);

let lastTimeUpdate = 0;

function updateMediaSession(track: Track): void {
    if (!browser || !('mediaSession' in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artists.map(a => a.name).join(', '),
        album: track.album || '',
        artwork: track.coverUrl ? [{ src: track.coverUrl, sizes: '512x512' }] : []
    });
}

function initAudio(): void {
    if (audio || !browser) return;

    audio = createAudioElement();
    if (!audio) return;

    volume = loadPersistedVolume();
    audio.volume = volume;

    audio.addEventListener('loadstart', () => { isBuffering = true; });
    audio.addEventListener('canplay', () => { isBuffering = false; });
    audio.addEventListener('waiting', () => { isBuffering = true; });

    audio.addEventListener('playing', () => {
        isBuffering = false;
        isPlaying = true;
        if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
    });

    audio.addEventListener('pause', () => {
        isPlaying = false;
        if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
    });

    audio.addEventListener('ended', () => {
        isPlaying = false;
        if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';

        if (repeatMode === 'one') {
            seek(0);
            play();
        } else {
            const nextIdx = getNextIndex();
            if (nextIdx !== -1) {
                queueIndex = nextIdx;
                play(queue[nextIdx]);
            } else if (repeatMode === 'all' && queue.length > 0) {
                queueIndex = 0;
                play(queue[0]);
            }
        }
    });

    audio.addEventListener('loadedmetadata', () => { duration = audio?.duration ?? 0; });
    audio.addEventListener('durationchange', () => { duration = audio?.duration ?? 0; });

    audio.addEventListener('timeupdate', () => {
        const now = performance.now();
        if (now - lastTimeUpdate >= TIME_UPDATE_INTERVAL) {
            lastTimeUpdate = now;
            currentTime = audio?.currentTime ?? 0;
        }
    });

    audio.addEventListener('error', () => {
        isBuffering = false;
        isPlaying = false;
    });

    if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', () => play());
        navigator.mediaSession.setActionHandler('pause', () => pause());
        navigator.mediaSession.setActionHandler('previoustrack', () => previous());
        navigator.mediaSession.setActionHandler('nexttrack', () => next());
        navigator.mediaSession.setActionHandler('seekto', (details) => {
            if (details.seekTime !== undefined) seek(details.seekTime);
        });
    }
}

function play(track?: Track): void {
    initAudio();
    if (!audio) return;

    if (track) {
        currentTrack = track;
        audio.src = track.audioUrl;
        audio.load();
        updateMediaSession(track);

        const trackIndex = queue.findIndex((t) => t.id === track.id);
        if (trackIndex === -1) {
            queue = [track];
            queueIndex = 0;
        } else {
            queueIndex = trackIndex;
        }
    }

    audio.play().catch(() => { isPlaying = false; });
}

function pause(): void {
    audio?.pause();
}

function toggle(): void {
    isPlaying ? pause() : play();
}

function seek(time: number): void {
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(time, duration));
    currentTime = audio.currentTime;
}

function setVolume(level: number): void {
    const clampedVolume = Math.max(0, Math.min(1, level));
    volume = clampedVolume;
    if (audio) audio.volume = clampedVolume;
    persistVolume(clampedVolume);
}

function getNextIndex(): number {
    if (queue.length === 0) return -1;
    const nextIdx = queueIndex + 1;
    if (nextIdx < queue.length) return nextIdx;
    if (repeatMode === 'all') return 0;
    return -1;
}

function next(): void {
    const nextIdx = getNextIndex();
    if (nextIdx !== -1) {
        queueIndex = nextIdx;
        play(queue[nextIdx]);
    }
}

function getPreviousIndex(): number {
    if (queue.length === 0) return -1;
    const prevIdx = queueIndex - 1;
    if (prevIdx >= 0) return prevIdx;
    if (repeatMode === 'all') return queue.length - 1;
    return -1;
}

function previous(): void {
    if (!audio) return;

    if (currentTime > 3) {
        seek(0);
        return;
    }

    const prevIdx = getPreviousIndex();
    if (prevIdx !== -1) {
        queueIndex = prevIdx;
        play(queue[prevIdx]);
    } else {
        seek(0);
    }
}

function shuffleArray<T>(arr: T[]): T[] {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

function toggleShuffle(): void {
    shuffleEnabled = !shuffleEnabled;

    if (shuffleEnabled) {
        const currentId = currentTrack?.id;
        const tracksToShuffle = [...queue];
        const currentIdx = tracksToShuffle.findIndex(t => t.id === currentId);
        let current: Track | null = null;

        if (currentIdx !== -1) {
            [current] = tracksToShuffle.splice(currentIdx, 1);
        }

        const shuffled = shuffleArray(tracksToShuffle);
        queue = current ? [current, ...shuffled] : shuffled;
        queueIndex = 0;
    } else {
        const currentId = currentTrack?.id;
        queue = [...originalQueue];
        const newIdx = queue.findIndex(t => t.id === currentId);
        queueIndex = newIdx !== -1 ? newIdx : 0;
    }
}

function setRepeatMode(mode: RepeatMode): void {
    repeatMode = mode;
}

function setQueue(tracks: Track[], startIndex = 0): void {
    originalQueue = [...tracks];

    if (shuffleEnabled) {
        const firstTrack = tracks[startIndex];
        const rest = tracks.filter((_, i) => i !== startIndex);
        queue = [firstTrack, ...shuffleArray(rest)];
        queueIndex = 0;
    } else {
        queue = [...tracks];
        queueIndex = Math.max(0, Math.min(startIndex, tracks.length - 1));
    }

    if (queue.length > 0) play(queue[queueIndex]);
}

function clearQueue(): void {
    pause();
    queue = [];
    queueIndex = 0;
    currentTrack = null;
    currentTime = 0;
    duration = 0;
}

function formatTime(seconds: number): string {
    if (!isFinite(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export const player = {
    get currentTrack() { return currentTrack; },
    get isPlaying() { return isPlaying; },
    get isBuffering() { return isBuffering; },
    get queue() { return queue; },
    get queueIndex() { return queueIndex; },
    get currentTime() { return currentTime; },
    get duration() { return duration; },
    get volume() { return volume; },
    get shuffleEnabled() { return shuffleEnabled; },
    get repeatMode() { return repeatMode; },

    play,
    pause,
    toggle,
    seek,
    setVolume,
    next,
    previous,
    setQueue,
    clearQueue,
    toggleShuffle,
    setRepeatMode,
    formatTime,
    init: initAudio
};
