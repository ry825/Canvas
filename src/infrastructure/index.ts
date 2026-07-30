import type { Clock } from "@application/ports/index";

export const INFRASTRUCTURE_LAYER = {
  name: "Infrastructure",
  responsibility: "ブラウザAPIと外部ライブラリへの接続",
} as const;

export const SYSTEM_CLOCK: Clock = {
  now: () => new Date(),
};
