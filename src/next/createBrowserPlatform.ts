import type {
  HapticStrength,
  LifecycleState,
  PlatformAdapters,
} from "../app/platform/PlatformAdapters";

function currentLifecycleState(): LifecycleState {
  return document.visibilityState === "hidden" ? "background" : "active";
}

export function createBrowserPlatform(): PlatformAdapters {
  return Object.freeze({
    storage: {
      async read(key: string) {
        try {
          return window.localStorage.getItem(key);
        } catch {
          return null;
        }
      },
      async write(key: string, value: string) {
        window.localStorage.setItem(key, value);
      },
      async remove(key: string) {
        window.localStorage.removeItem(key);
      },
    },
    audio: {
      async play() {
        // Audio cues are connected when the real sound layer is introduced.
      },
    },
    haptics: {
      async pulse(strength: HapticStrength) {
        const duration = strength === "strong" ? 32 : strength === "medium" ? 20 : 12;
        navigator.vibrate?.(duration);
      },
    },
    fullscreen: {
      isActive() {
        return Boolean(document.fullscreenElement);
      },
      async enter() {
        if (!document.documentElement.requestFullscreen) return false;
        await document.documentElement.requestFullscreen();
        return true;
      },
      async exit() {
        if (!document.fullscreenElement || !document.exitFullscreen) return false;
        await document.exitFullscreen();
        return true;
      },
    },
    lifecycle: {
      current: currentLifecycleState,
      subscribe(listener: (state: LifecycleState) => void) {
        const handleVisibility = () => listener(currentLifecycleState());
        document.addEventListener("visibilitychange", handleVisibility);
        return () => {
          document.removeEventListener("visibilitychange", handleVisibility);
        };
      },
    },
    achievements: {
      async unlock() {
        // Browser builds have no achievement provider.
      },
    },
  });
}
