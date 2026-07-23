import { describe, expect, it } from "vitest";

import { PuzzleRun } from "../src/domain/puzzle/PuzzleRun";

describe("PuzzleRun", () => {
  it("starts with the Pulse seed and a deterministic active piece", () => {
    const run = new PuzzleRun({ random: () => 0 });

    expect(run.board[run.center][run.center]?.seed).toBe(true);
    expect(run.current).toBeNull();

    run.start();

    expect(run.current?.shape.name).toBe("I");
    expect(run.nextShape.name).toBe("I");
  });

  it("uses the legacy normal gravity interval", () => {
    const run = new PuzzleRun({ random: () => 0 });
    run.start();
    const startY = run.current?.y;

    run.advance(519);
    expect(run.current?.y).toBe(startY);

    run.advance(1);
    expect(run.current?.y).toBe((startY ?? 0) + 1);
  });

  it("rotates the active piece without mutating its shape definition", () => {
    const run = new PuzzleRun({ random: () => 0 });
    run.start();
    const sourceCells = run.current?.shape.cells.map((cell) => ({ ...cell }));

    expect(run.rotate()).toBe(true);
    expect(run.current?.cells).toEqual([
      { x: 0, y: -1 },
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
    ]);
    expect(run.current?.shape.cells).toEqual(sourceCells);
  });

  it("locks a piece that reaches and attaches to the Pulse", () => {
    const run = new PuzzleRun({ random: () => 0 });
    run.start();

    expect(run.hardDrop()).toBe("locked");
    expect(run.piecesPlaced).toBe(1);
    expect(run.current?.shape.name).toBe("I");

    const occupied = run.board.flat().filter(Boolean);
    expect(occupied).toHaveLength(5);
  });

  it("retries the same shape after a detached drop", () => {
    const run = new PuzzleRun({ random: () => 0 });
    run.start();
    while (run.move(-1, 0)) {
      // Move as far from the Pulse as possible.
    }

    expect(run.hardDrop()).toBe("retried");
    expect(run.piecesPlaced).toBe(0);
    expect(run.current?.shape.name).toBe("I");
    expect(run.board.flat().filter(Boolean)).toHaveLength(1);
  });

  it("computes a ghost without moving the active piece", () => {
    const run = new PuzzleRun({ random: () => 0 });
    run.start();
    const activeY = run.current?.y;
    const ghost = run.ghostCells();

    expect(ghost).toHaveLength(4);
    expect(run.current?.y).toBe(activeY);
    expect(Math.max(...ghost.map((cell) => cell.y))).toBeLessThan(run.size);
  });
});
