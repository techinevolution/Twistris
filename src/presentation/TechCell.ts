import Phaser from "phaser";

export function createTechCell(
  scene: Phaser.Scene,
  color: "cyan" | "magenta",
  size: number,
  bright = false,
): Phaser.GameObjects.Container {
  const palette =
    color === "cyan"
      ? {
          edge: bright ? 0xd9f8ff : 0x8fe6ff,
          panel: bright ? 0xa6efff : 0x72cef2,
          shell: bright ? 0x4aa8d8 : 0x10293e,
        }
      : {
          edge: bright ? 0xffd2e4 : 0xff9ac3,
          panel: bright ? 0xffb0cd : 0xf06e9d,
          shell: bright ? 0xc63a62 : 0x351322,
        };
  const container = scene.add.container();
  const graphic = scene.add.graphics();
  const half = size / 2;

  graphic.fillStyle(palette.shell, 1);
  graphic.fillRoundedRect(
    -half,
    -half,
    size,
    size,
    Math.min(3.4, size * 0.14),
  );
  graphic.fillStyle(palette.panel, 0.98);
  graphic.fillRoundedRect(
    -half + size * 0.07,
    -half + size * 0.07,
    size * 0.86,
    size * 0.86,
    2.5,
  );
  graphic.lineStyle(
    Math.max(1, size * 0.07),
    palette.edge,
    0.88,
  );
  graphic.strokeRoundedRect(
    -half + size * 0.07,
    -half + size * 0.07,
    size * 0.86,
    size * 0.86,
    2.5,
  );
  graphic.fillStyle(0xf8fdff, bright ? 0.58 : 0.42);
  graphic.fillRoundedRect(
    -half + size * 0.23,
    -half + size * 0.23,
    size * 0.54,
    size * 0.54,
    2,
  );
  graphic.fillStyle(0xf8fdff, 0.1);
  graphic.fillRect(
    -half + size * 0.13,
    -half + size * 0.13,
    size * 0.44,
    Math.max(1, size * 0.07),
  );
  container.add(graphic);

  return container;
}
