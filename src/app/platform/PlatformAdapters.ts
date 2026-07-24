export type LifecycleState = "active" | "background";
export type HapticStrength = "light" | "medium" | "strong";

export interface StorageAdapter {
  read(key: string): Promise<string | null>;
  write(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

export interface AudioAdapter {
  play(cue: string): Promise<void>;
}

export interface HapticsAdapter {
  pulse(strength: HapticStrength): Promise<void>;
}

export interface FullscreenAdapter {
  isActive(): boolean;
  enter(): Promise<boolean>;
  exit(): Promise<boolean>;
}

export interface LifecycleAdapter {
  current(): LifecycleState;
  subscribe(listener: (state: LifecycleState) => void): () => void;
}

export interface AchievementsAdapter {
  unlock(id: string): Promise<void>;
}

export interface PlatformAdapters {
  readonly storage: StorageAdapter;
  readonly audio: AudioAdapter;
  readonly haptics: HapticsAdapter;
  readonly fullscreen: FullscreenAdapter;
  readonly lifecycle: LifecycleAdapter;
  readonly achievements: AchievementsAdapter;
}

export function createNoopPlatformAdapters(): PlatformAdapters {
  return Object.freeze({
    storage: {
      async read() {
        return null;
      },
      async write() {},
      async remove() {},
    },
    audio: {
      async play() {},
    },
    haptics: {
      async pulse() {},
    },
    fullscreen: {
      isActive() {
        return false;
      },
      async enter() {
        return false;
      },
      async exit() {
        return false;
      },
    },
    lifecycle: {
      current() {
        return "active" as const;
      },
      subscribe() {
        return () => {};
      },
    },
    achievements: {
      async unlock() {},
    },
  });
}
