import { describe, expect, it } from "vitest";

import {
  analyzeBalance,
  attachesToStructure,
  calculateHarvest,
  createBoard,
  findCenteredSquareLayers,
  rotateBoard,
} from "../src/domain/rules";
import { WorldCameraController } from "../src/presentation/camera/WorldCameraController";

const block = Object.freeze({ color: "#ffffff" });

describe("board rules", () => {
  it("creates an empty square board", () => {
    expect(createBoard(3)).toEqual([
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ]);
  });

  it("requires landed cells to touch the existing structure", () => {
    const board = createBoard(5);
    board[2][2] = block;

    expect(attachesToStructure(board, [{ x: 2, y: 1 }])).toBe(true);
    expect(attachesToStructure(board, [{ x: 0, y: 0 }])).toBe(false);
  });

  it("rotates occupied cells in either direction", () => {
    const board = createBoard(5);
    board[1][2] = block;

    expect(rotateBoard(board, 1, 2)?.[2][3]).toEqual(block);
    expect(rotateBoard(board, -1, 2)?.[2][1]).toEqual(block);
  });

  it("rejects a rotation that would leave the board", () => {
    const board = createBoard(4);
    board[0][0] = block;

    expect(rotateBoard(board, 1, 2)).toBeNull();
  });

  it("detects only contiguous centered square layers", () => {
    const board = createBoard(7);
    for (let y = 2; y <= 4; y += 1) {
      for (let x = 2; x <= 4; x += 1) {
        board[y][x] = block;
      }
    }

    expect(findCenteredSquareLayers(board, 3)).toBe(1);
    board[2][2] = null;
    expect(findCenteredSquareLayers(board, 3)).toBe(0);
  });
});

describe("balance rules", () => {
  const options = {
    center: 3,
    outerRingWeight: 0.35,
    shiftMultiplier: 1.4,
    placementImpulse: 0.18,
    baseThreshold: 0.8,
    coreThresholdStep: 0.08,
    centerBraceBonus: 0.65,
    centeredBuffer: 0.3,
    centeredDistance: 1.5,
  };

  it("keeps centered placements stable", () => {
    const board = createBoard(7);
    board[3][3] = block;
    board[2][3] = block;

    const result = analyzeBalance(board, 0, [{ x: 3, y: 2 }], options);

    expect(result.centeredPlacement).toBe(true);
    expect(result.direction).toBe(0);
  });

  it("tips toward a strongly weighted placement", () => {
    const board = createBoard(7);
    board[3][3] = block;
    board[3][6] = block;

    const result = analyzeBalance(board, 0, [{ x: 6, y: 3 }], options);

    expect(result.tipPressure).toBeGreaterThan(result.stabilityThreshold);
    expect(result.direction).toBe(1);
  });
});

describe("harvest rules", () => {
  it("separates influenced Duds from outer blocks and skips the seed", () => {
    const board = createBoard(7);
    board[3][3] = { ...block, seed: true };
    board[3][2] = block;
    board[3][5] = block;

    const harvest = calculateHarvest(board, {
      center: 3,
      coreLayers: 1,
      resultId: 12,
      pulseCharges: 2,
    });

    expect(harvest.dudCells).toHaveLength(1);
    expect(harvest.outerCells).toHaveLength(1);
    expect(harvest.result).toEqual({
      id: 12,
      earned: { duds: 1, pulseCharges: 2 },
      runStats: { coreLayersReached: 1, bestSquareSide: 3 },
      endReason: "capacity_reached",
    });
  });

  it("returns frozen transaction data", () => {
    const result = calculateHarvest(createBoard(3), {
      center: 1,
      coreLayers: 0,
      resultId: "run-1",
      pulseCharges: 0,
      endReason: "manual",
    });

    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.result)).toBe(true);
    expect(Object.isFrozen(result.result.earned)).toBe(true);
  });
});

describe("world camera modes", () => {
  it("enables free navigation only in Board mode", () => {
    const camera = new WorldCameraController("title-closeup");

    expect(camera.allowsFreeNavigation).toBe(false);
    camera.setMode("pulse-home");
    expect(camera.allowsFreeNavigation).toBe(false);
    camera.setMode("board-free");
    expect(camera.allowsFreeNavigation).toBe(true);
  });
});
