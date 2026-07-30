import { DOMAIN_LAYER } from "@domain/index";

export const APPLICATION_LAYER = {
  name: "Application",
  responsibility: "ユースケースと編集処理の調停",
  dependsOn: DOMAIN_LAYER.name,
} as const;
