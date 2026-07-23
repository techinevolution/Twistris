"use strict";

(function exposeTwistrisRules(root) {
  function createBoard(size) {
    return Array.from({ length: size }, () => Array(size).fill(null));
  }

  function cellKey(x, y) {
    return `${x},${y}`;
  }

  function attachesToStructure(board, landedCells) {
    const height = board.length;
    const width = height > 0 ? board[0].length : 0;

    for (const cell of landedCells) {
      const neighbors = [
        { x: cell.x - 1, y: cell.y },
        { x: cell.x + 1, y: cell.y },
        { x: cell.x, y: cell.y - 1 },
        { x: cell.x, y: cell.y + 1 },
      ];

      for (const neighbor of neighbors) {
        if (neighbor.x < 0 || neighbor.x >= width || neighbor.y < 0 || neighbor.y >= height) continue;
        if (board[neighbor.y][neighbor.x]) return true;
      }
    }

    return false;
  }

  function rotateBoard(board, direction, center) {
    const size = board.length;
    const nextBoard = createBoard(size);

    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const block = board[y][x];
        if (!block) continue;

        const relX = x - center;
        const relY = y - center;
        const nextX = direction > 0 ? center - relY : center + relY;
        const nextY = direction > 0 ? center + relX : center - relX;

        if (nextX < 0 || nextX >= size || nextY < 0 || nextY >= size) return null;
        nextBoard[nextY][nextX] = { ...block };
      }
    }

    return nextBoard;
  }

  function findCenteredSquareLayers(board, center, maxLayers = 8) {
    let layers = 0;
    const limit = Math.min(center, maxLayers);

    for (let radius = 0; radius <= limit; radius += 1) {
      let full = true;
      for (let y = center - radius; y <= center + radius && full; y += 1) {
        for (let x = center - radius; x <= center + radius; x += 1) {
          if (!board[y][x]) {
            full = false;
            break;
          }
        }
      }
      if (!full) break;
      layers = radius;
    }

    return layers;
  }

  function averageCenterDistance(cells, center) {
    let total = 0;
    for (const cell of cells) {
      total += Math.hypot(cell.x - center, cell.y - center);
    }
    return total / Math.max(1, cells.length);
  }

  function averageHorizontalOffset(cells, center) {
    let total = 0;
    for (const cell of cells) {
      total += cell.x - center;
    }
    return total / Math.max(1, cells.length);
  }

  function analyzeBalanceProfile(board, coreLayers, options) {
    const { center, outerRingWeight, excludedCells = null } = options;
    let totalWeight = 0;
    let totalTorque = 0;
    let braceWeight = 0;
    const braceRadius = Math.max(1, coreLayers + 1);

    for (let y = 0; y < board.length; y += 1) {
      for (let x = 0; x < board[y].length; x += 1) {
        const block = board[y][x];
        if (!block) continue;
        if (excludedCells && excludedCells.has(cellKey(x, y))) continue;

        const relX = x - center;
        const ring = Math.max(Math.abs(relX), Math.abs(y - center));
        const outerRing = Math.max(0, ring - braceRadius);
        const weight = 1 + outerRing * outerRingWeight;

        totalWeight += weight;
        totalTorque += relX * weight;
        if (ring <= braceRadius) braceWeight += weight;
      }
    }

    return Object.freeze({
      braceRatio: totalWeight > 0 ? braceWeight / totalWeight : 0,
      weightedOffset: totalWeight > 0 ? totalTorque / totalWeight : 0,
    });
  }

  function analyzeBalance(board, coreLayers, landedCells, options) {
    const {
      center,
      outerRingWeight,
      shiftMultiplier,
      placementImpulse,
      baseThreshold,
      coreThresholdStep,
      centerBraceBonus,
      centeredBuffer,
      centeredDistance,
    } = options;
    const excludedCells = new Set(landedCells.map((cell) => cellKey(cell.x, cell.y)));
    const profileOptions = { center, outerRingWeight };
    const previousProfile = analyzeBalanceProfile(board, coreLayers, { ...profileOptions, excludedCells });
    const totalProfile = analyzeBalanceProfile(board, coreLayers, profileOptions);
    const offsetDelta = totalProfile.weightedOffset - previousProfile.weightedOffset;
    const tipPressure =
      totalProfile.weightedOffset +
      offsetDelta * shiftMultiplier +
      averageHorizontalOffset(landedCells, center) * placementImpulse;
    const centeredPlacement = averageCenterDistance(landedCells, center) <= centeredDistance;
    const stabilityThreshold =
      baseThreshold + coreLayers * coreThresholdStep + totalProfile.braceRatio * centerBraceBonus;
    let direction = 0;

    if (!(centeredPlacement && Math.abs(tipPressure) < stabilityThreshold + centeredBuffer)) {
      if (tipPressure > stabilityThreshold) direction = 1;
      if (tipPressure < -stabilityThreshold) direction = -1;
    }

    return Object.freeze({
      centeredPlacement,
      direction,
      stabilityThreshold,
      tipPressure,
      totalProfile,
    });
  }

  function createHarvestResult({ id, dudCount, pulseCharges, coreLayers, endReason }) {
    return Object.freeze({
      id,
      earned: Object.freeze({
        duds: dudCount,
        pulseCharges,
      }),
      runStats: Object.freeze({
        coreLayersReached: coreLayers,
        bestSquareSide: coreLayers * 2 + 1,
      }),
      endReason,
    });
  }

  function calculateHarvest(board, options) {
    const { center, coreLayers, resultId, pulseCharges, endReason = "capacity_reached" } = options;
    const dudCells = [];
    const outerCells = [];

    for (let y = 0; y < board.length; y += 1) {
      for (let x = 0; x < board[y].length; x += 1) {
        const block = board[y][x];
        if (!block || block.seed) continue;

        const cell = Object.freeze({ x, y, color: block.color });
        const influenced =
          coreLayers > 0 && Math.max(Math.abs(x - center), Math.abs(y - center)) <= coreLayers;
        if (influenced) {
          dudCells.push(cell);
        } else {
          outerCells.push(cell);
        }
      }
    }

    return Object.freeze({
      dudCells: Object.freeze(dudCells),
      outerCells: Object.freeze(outerCells),
      result: createHarvestResult({
        id: resultId,
        dudCount: dudCells.length,
        pulseCharges,
        coreLayers,
        endReason,
      }),
    });
  }

  root.TwistrisRules = Object.freeze({
    analyzeBalance,
    analyzeBalanceProfile,
    attachesToStructure,
    averageCenterDistance,
    averageHorizontalOffset,
    calculateHarvest,
    createBoard,
    createHarvestResult,
    findCenteredSquareLayers,
    rotateBoard,
  });
})(globalThis);
