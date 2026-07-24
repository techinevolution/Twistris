export interface BankedInventory {
  readonly duds: number;
  readonly pulseCharges: number;
}

export interface HarvestAward {
  readonly id: number | string;
  readonly earned: BankedInventory;
}

export interface SessionEconomyState {
  readonly inventory: BankedInventory;
  readonly appliedHarvestResultIds: ReadonlyArray<string>;
}

export interface HarvestTransaction {
  readonly applied: boolean;
  readonly before: BankedInventory;
  readonly after: BankedInventory;
  readonly resultId: string;
}

function freezeInventory(inventory: BankedInventory): BankedInventory {
  return Object.freeze({
    duds: inventory.duds,
    pulseCharges: inventory.pulseCharges,
  });
}

export function createSessionEconomyState(): SessionEconomyState {
  return Object.freeze({
    inventory: freezeInventory({ duds: 0, pulseCharges: 0 }),
    appliedHarvestResultIds: Object.freeze([]),
  });
}

export function applyHarvestResult(
  state: SessionEconomyState,
  result: HarvestAward,
): {
  readonly state: SessionEconomyState;
  readonly transaction: HarvestTransaction;
} {
  const resultId = String(result.id);
  const before = state.inventory;

  if (state.appliedHarvestResultIds.includes(resultId)) {
    return Object.freeze({
      state,
      transaction: Object.freeze({
        applied: false,
        before,
        after: before,
        resultId,
      }),
    });
  }

  const after = freezeInventory({
    duds: before.duds + result.earned.duds,
    pulseCharges: before.pulseCharges + result.earned.pulseCharges,
  });
  const nextState = Object.freeze({
    inventory: after,
    appliedHarvestResultIds: Object.freeze([
      ...state.appliedHarvestResultIds,
      resultId,
    ]),
  });

  return Object.freeze({
    state: nextState,
    transaction: Object.freeze({
      applied: true,
      before,
      after,
      resultId,
    }),
  });
}
