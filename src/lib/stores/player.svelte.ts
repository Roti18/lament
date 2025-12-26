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

function persistVolume(volume: number): void {
    if (!browser) return;
    localStorage.setItem(VOLUME_STORAGE_KEY, String(volume));
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

function initAudio(): void {
    if (audio || !browser) return;

    audio = createAudioElement();
    if (!audio) return;

    volume = loadPersistedVolume();
    audio.volume = volume;

    audio.addEventListener('loadstart', () => {
        isBuffering = true;
    });

    audio.addEventListener('canplay', () => {
        isBuffering = false;
    });

    audio.addEventListener('waiting', () => {
        isBuffering = true;
    });

    audio.addEventListener('playing', () => {
        isBuffering = false;
        isPlaying = true;
    });

    audio.addEventListener('pause', () => {
        isPlaying = false;
    });

    audio.addEventListener('ended', () => {
        isPlaying = false;

        if (repeatMode === 'one') {
            seek(0);
            play();
        } else {
            const nextIndex = getNextIndex();
            if (nextIndex !== -1) {
                queueIndex = nextIndex;
                play(queue[nextIndex]);
            } else if (repeatMode === 'all' && queue.length > 0) {
                queueIndex = 0;
                play(queue[0]);
            }
        }
    });

    audio.addEventListener('loadedmetadata', () => {
        duration = audio?.duration ?? 0;
    });

    audio.addEventListener('durationchange', () => {
        duration = audio?.duration ?? 0;
    });

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
        console.error('Audio playback error:', audio?.error);
    });
}

function play(track?: Track): void {
    initAudio();
    if (!audio) return;

    if (track) {
        currentTrack = track;
        audio.src = track.audioUrl;
        audio.load();

        const trackIndex = queue.findIndex((t) => t.id === track.id);
        if (trackIndex === -1) {
            queue = [track];
            queueIndex = 0;
        } else {
            queueIndex = trackIndex;
        }
    }

    audio.play().catch((err) => {
        console.error('Playback failed:', err);
        isPlaying = false;
    });
}

function pause(): void {
    if (!audio) return;
    audio.pause();
}

function toggle(): void {
    if (isPlaying) {
        pause();
    } else {
        play();
    }
}

function seek(time: number): void {
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(time, duration));
    currentTime = audio.currentTime;
}

function setVolume(level: number): void {
    const clampedVolume = Math.max(0, Math.min(1, level));
    volume = clampedVolume;
    if (audio) {
        audio.volume = clampedVolume;
    }
    persistVolume(clampedVolume);
}

function getNextIndex(): number {
    if (queue.length === 0) return -1;
    const nextIndex = queueIndex + 1;
    if (nextIndex < queue.length) return nextIndex;
    if (repeatMode === 'all') return 0;
    return -1;
}

function next(): void {
    const nextIndex = getNextIndex();
    if (nextIndex !== -1) {
        queueIndex = nextIndex;
        play(queue[nextIndex]);
    }
}

function getPreviousIndex(): number {
    if (queue.length === 0) return -1;
    const prevIndex = queueIndex - 1;
    if (prevIndex >= 0) return prevIndex;
    if (repeatMode === 'all') return queue.length - 1;
    return -1;
}

function previous(): void {
    if (!audio) return;

    if (currentTime > 3) {
        seek(0);
        return;
    }

    const prevIndex = getPreviousIndex();
    if (prevIndex !== -1) {
        queueIndex = prevIndex;
        play(queue[prevIndex]);
    } else {
        seek(0);
    }
}

function toggleShuffle(): void {
    shuffleEnabled = !shuffleEnabled;

    if (shuffleEnabled) {
        const currentId = currentTrack?.id;
        const tracksToShuffle = [...queue];

        const currentIndexInQueue = tracksToShuffle.findIndex(t => t.id === currentId);
        let current: Track | null = null;
        if (currentIndexInQueue !== -1) {
            [current] = tracksToShuffle.splice(currentIndexInQueue, 1);
        }

        for (let i = tracksToShuffle.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tracksToShuffle[i], tracksToShuffle[j]] = [tracksToShuffle[j], tracksToShuffle[i]];
        }

        if (current) {
            queue = [current, ...tracksToShuffle];
            queueIndex = 0;
        } else {
            queue = tracksToShuffle;
            queueIndex = 0;
        }
    } else {
        const currentId = currentTrack?.id;
        queue = [...originalQueue];
        const newIndex = queue.findIndex(t => t.id === currentId);
        queueIndex = newIndex !== -1 ? newIndex : 0;
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

        for (let i = rest.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [rest[i], rest[j]] = [rest[j], rest[i]];
        }

        queue = [firstTrack, ...rest];
        queueIndex = 0;
    } else {
        queue = [...tracks];
        queueIndex = Math.max(0, Math.min(startIndex, tracks.length - 1));
    }

    if (queue.length > 0) {
        play(queue[queueIndex]);
    }
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
    get currentTrack() {
        return currentTrack;
    },
    get isPlaying() {
        return isPlaying;
    },
    get isBuffering() {
        return isBuffering;
    },
    get queue() {
        return queue;
    },
    get queueIndex() {
        return queueIndex;
    },
    get currentTime() {
        return currentTime;
    },
    get duration() {
        return duration;
    },
    get volume() {
        return volume;
    },
    get shuffleEnabled() {
        return shuffleEnabled;
    },
    get repeatMode() {
        return repeatMode;
    },

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
