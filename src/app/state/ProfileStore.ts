import type { StorageAdapter } from "../platform/PlatformAdapters";
import {
  createProfile,
  decodeProfile,
  type Profile,
  type ProfileDecodeSource,
} from "../../domain/profile/Profile";

export const PROFILE_STORAGE_KEY = "twistris.profile";

export interface ProfileLoadResult {
  readonly profile: Profile;
  readonly source: ProfileDecodeSource | "created";
  readonly persisted: boolean;
}

export interface ProfilePersistence {
  save(profile: Profile): Promise<void>;
  reset(): Promise<Profile>;
}

export class ProfileStore implements ProfilePersistence {
  constructor(
    private readonly storage: StorageAdapter,
    private readonly key = PROFILE_STORAGE_KEY,
  ) {}

  async load(): Promise<ProfileLoadResult> {
    let serialized: string | null;

    try {
      serialized = await this.storage.read(this.key);
    } catch {
      return Object.freeze({
        profile: createProfile(),
        source: "recovered",
        persisted: false,
      });
    }

    if (serialized === null) {
      const profile = createProfile();
      return Object.freeze({
        profile,
        source: "created",
        persisted: await this.trySave(profile),
      });
    }

    let raw: unknown;
    try {
      raw = JSON.parse(serialized);
    } catch {
      raw = null;
    }

    const decoded = decodeProfile(raw);
    const persisted = decoded.needsSave
      ? await this.trySave(decoded.profile)
      : true;

    return Object.freeze({
      profile: decoded.profile,
      source: decoded.source,
      persisted,
    });
  }

  async save(profile: Profile): Promise<void> {
    await this.storage.write(this.key, JSON.stringify(profile));
  }

  async reset(): Promise<Profile> {
    const profile = createProfile();
    await this.storage.remove(this.key);
    await this.save(profile);
    return profile;
  }

  private async trySave(profile: Profile): Promise<boolean> {
    try {
      await this.save(profile);
      return true;
    } catch {
      return false;
    }
  }
}
