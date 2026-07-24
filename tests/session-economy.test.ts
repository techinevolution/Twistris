import { describe, expect, it } from "vitest";

import {
  applyHarvestResult,
  createSessionEconomyState,
} from "../src/domain/economy/SessionEconomy";

describe("session economy", () => {
  it("starts with an empty immutable bank", () => {
    const state = createSessionEconomyState();

    expect(state.inventory).toEqual({ duds: 0, pulseCharges: 0 });
    expect(state.appliedHarvestResultIds).toEqual([]);
    expect(Object.isFrozen(state)).toBe(true);
    expect(Object.isFrozen(state.inventory)).toBe(true);
  });

  it("applies an entire harvest result in one transaction", () => {
    const initial = createSessionEconomyState();
    const applied = applyHarvestResult(initial, {
      id: "harvest-1",
      earned: { duds: 12, pulseCharges: 3 },
    });

    expect(applied.transaction).toEqual({
      applied: true,
      before: { duds: 0, pulseCharges: 0 },
      after: { duds: 12, pulseCharges: 3 },
      resultId: "harvest-1",
    });
    expect(applied.state.inventory).toEqual({
      duds: 12,
      pulseCharges: 3,
    });
    expect(initial.inventory).toEqual({ duds: 0, pulseCharges: 0 });
  });

  it("does not apply the same result twice", () => {
    const result = {
      id: "harvest-1",
      earned: { duds: 12, pulseCharges: 3 },
    };
    const first = applyHarvestResult(createSessionEconomyState(), result);
    const duplicate = applyHarvestResult(first.state, result);

    expect(duplicate.transaction.applied).toBe(false);
    expect(duplicate.transaction.before).toBe(first.state.inventory);
    expect(duplicate.transaction.after).toBe(first.state.inventory);
    expect(duplicate.state).toBe(first.state);
  });
});
