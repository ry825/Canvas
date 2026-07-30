import { APPLICATION_LAYER } from "@application/index";
import { DOMAIN_LAYER } from "@domain/index";
import { INFRASTRUCTURE_LAYER } from "@infrastructure/index";

export function createLayerSummary(): readonly string[] {
  return [DOMAIN_LAYER.name, APPLICATION_LAYER.name, INFRASTRUCTURE_LAYER.name, "UI"] as const;
}
