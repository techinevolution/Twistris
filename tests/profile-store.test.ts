import { describe, expect, it, vi } from "vitest";

import type { StorageAdapter } from "../src/app/platform/PlatformAdapters";
import {
  PROFILE_STORAGE_KEY,
  ProfileStore,
} from "../src/app/state/ProfileStore";
import { createProfile } from "../src/domain/profile/Profile";

function createStorage(initial: string | null = null): {
  storage: StorageAdapter;
  read: ReturnType<typeof vi.fn>;
  write: ReturnType<typeof vi.fn>;
  remove: ReturnType<typeof vi.fn>;
} {
  let value = initial;
  const read = vi.fn(async () => value);
  const write = vi.fn(async (_key: string, next: string) => {
    value = next;
  });
  const remove = vi.fn(async () => {
    value = null;
  });
  return {
    storage: { read, write, remove },
    read,
    write,
    remove,
  };
}

describe("ProfileStore", () => {
  it("creates and stores a missing profile", async () => {
    const fake = createStorage();
    const result = await new ProfileStore(fake.storage).load();

    expect(result).toEqual({
      profile: createProfile(),
      source: "created",
      persisted: true,
    });
    expect(fake.read).toHaveBeenCalledWith(PROFILE_STORAGE_KEY);
    expect(fake.write).toHaveBeenCalledOnce();
  });

  it("loads a valid profile without rewriting it", async () => {
    const profile = {
      ...createProfile(),
      inventory: { duds: 5, pulseCharges: 2, bits: 1 },
    };
    const fake = createStorage(JSON.stringify(profile));
    const result = await new ProfileStore(fake.storage).load();

    expect(result.source).toBe("loaded");
    expect(result.profile.inventory).toEqual(profile.inventory);
    expect(fake.write).not.toHaveBeenCalled();
  });

  it("recovers malformed JSON and replaces it with a valid profile", async () => {
    const fake = createStorage("{broken");
    const result = await new ProfileStore(fake.storage).load();

    expect(result.source).toBe("recovered");
    expect(result.persisted).toBe(true);
    expect(result.profile).toEqual(createProfile());
    expect(fake.write).toHaveBeenCalledOnce();
  });

  it("migrates version zero and stores the current version", async () => {
    const fake = createStorage(JSON.stringify({
      version: 0,
      bankedDuds: 9,
      bankedPulseCharges: 4,
    }));
    const result = await new ProfileStore(fake.storage).load();

    expect(result.source).toBe("migrated");
    expect(result.profile.inventory.duds).toBe(9);
    expect(result.profile.version).toBe(1);
    expect(fake.write).toHaveBeenCalledOnce();
  });

  it("returns a usable profile when storage cannot write", async () => {
    const fake = createStorage();
    fake.write.mockRejectedValue(new Error("storage unavailable"));
    const result = await new ProfileStore(fake.storage).load();

    expect(result.source).toBe("created");
    expect(result.persisted).toBe(false);
    expect(result.profile).toEqual(createProfile());
  });

  it("resets storage to a new default profile", async () => {
    const fake = createStorage(JSON.stringify({
      ...createProfile(),
      inventory: { duds: 20, pulseCharges: 4, bits: 2 },
    }));
    const store = new ProfileStore(fake.storage);
    const profile = await store.reset();

    expect(profile).toEqual(createProfile());
    expect(fake.remove).toHaveBeenCalledWith(PROFILE_STORAGE_KEY);
    expect(fake.write).toHaveBeenCalledOnce();
  });
});
