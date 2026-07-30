import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

describe("checkArchitecture", () => {
  it("run_forbiddenDomainToUiFixture_returnsFailureWithBoundaryDetails", () => {
    // Given
    const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
    const repositoryRoot = path.resolve(currentDirectory, "../../..");
    const scriptPath = path.join(repositoryRoot, "scripts/checkArchitecture.mjs");
    const fixturePath = path.join(repositoryRoot, "tests/fixtures/architecture/invalid");

    // When
    const result = spawnSync(process.execPath, [scriptPath, "--root", fixturePath], {
      encoding: "utf8",
    });

    // Then
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("domain -> ui is forbidden");
    expect(result.stderr).toContain("@ui/index");
  });
});
