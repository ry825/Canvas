import { WelcomeScreen } from "@ui/index";

import { createLayerSummary } from "./composition/createLayerSummary";

export function App() {
  return <WelcomeScreen layerSummary={createLayerSummary()} />;
}
