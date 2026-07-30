import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const SOURCE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs"];
const LAYERS = ["app", "domain", "application", "infrastructure", "ui"];
const ALIASES = new Map([
  ["@app/", "src/app/"],
  ["@domain/", "src/domain/"],
  ["@application/", "src/application/"],
  ["@infrastructure/", "src/infrastructure/"],
  ["@ui/", "src/ui/"],
  ["@test/", "tests/support/"],
]);

const ALLOWED_LAYERS = new Map([
  ["app", new Set(LAYERS)],
  ["domain", new Set(["domain"])],
  ["application", new Set(["application", "domain"])],
  ["infrastructure", new Set(["infrastructure", "application", "domain"])],
  ["ui", new Set(["ui", "application", "domain"])],
]);

function collectSourceFiles(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return collectSourceFiles(entryPath);
    }

    return SOURCE_EXTENSIONS.includes(path.extname(entry.name)) && !entry.name.endsWith(".d.ts")
      ? [entryPath]
      : [];
  });
}

function readModuleSpecifiers(filePath) {
  const sourceText = fs.readFileSync(filePath, "utf8");
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const specifiers = [];

  function visit(node) {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier !== undefined &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      specifiers.push(node.moduleSpecifier.text);
    }

    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length === 1
    ) {
      const argument = node.arguments[0];
      if (argument !== undefined && ts.isStringLiteral(argument)) {
        specifiers.push(argument.text);
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return specifiers;
}

function resolveFile(basePath) {
  const candidates = [
    basePath,
    ...SOURCE_EXTENSIONS.map((extension) => `${basePath}${extension}`),
    ...SOURCE_EXTENSIONS.map((extension) => path.join(basePath, `index${extension}`)),
  ];

  return candidates.find(
    (candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile(),
  );
}

function resolveSpecifier(rootDirectory, sourceFile, specifier) {
  for (const [alias, target] of ALIASES) {
    if (specifier.startsWith(alias)) {
      return resolveFile(path.join(rootDirectory, target, specifier.slice(alias.length)));
    }
  }

  if (specifier.startsWith(".")) {
    return resolveFile(path.resolve(path.dirname(sourceFile), specifier));
  }

  return undefined;
}

function getLayer(rootDirectory, filePath) {
  const relativePath = path.relative(path.join(rootDirectory, "src"), filePath);
  if (relativePath.startsWith("..")) {
    return undefined;
  }

  const [layer] = relativePath.split(path.sep);
  return LAYERS.includes(layer) ? layer : undefined;
}

function formatPath(rootDirectory, filePath) {
  return path.relative(rootDirectory, filePath).split(path.sep).join("/");
}

function validateLayerDependency(rootDirectory, sourceFile, targetFile) {
  const sourceLayer = getLayer(rootDirectory, sourceFile);
  const targetLayer = getLayer(rootDirectory, targetFile);
  if (sourceLayer === undefined || targetLayer === undefined) {
    return undefined;
  }

  const allowedTargets = ALLOWED_LAYERS.get(sourceLayer);
  if (allowedTargets === undefined || !allowedTargets.has(targetLayer)) {
    return `${sourceLayer} -> ${targetLayer} is forbidden`;
  }

  if (sourceLayer === "infrastructure" && targetLayer === "application") {
    const applicationPath = formatPath(rootDirectory, targetFile);
    if (!applicationPath.startsWith("src/application/ports/")) {
      return "infrastructure -> application is limited to application/ports";
    }
  }

  return undefined;
}

function findCycles(graph) {
  const visited = new Set();
  const active = new Set();
  const stack = [];
  const cycles = [];

  function visit(filePath) {
    if (active.has(filePath)) {
      const cycleStart = stack.indexOf(filePath);
      cycles.push([...stack.slice(cycleStart), filePath]);
      return;
    }
    if (visited.has(filePath)) {
      return;
    }

    visited.add(filePath);
    active.add(filePath);
    stack.push(filePath);
    for (const dependency of graph.get(filePath) ?? []) {
      visit(dependency);
    }
    stack.pop();
    active.delete(filePath);
  }

  for (const filePath of graph.keys()) {
    visit(filePath);
  }

  return cycles;
}

export function checkArchitecture(rootDirectory) {
  const normalizedRoot = path.resolve(rootDirectory);
  const files = collectSourceFiles(path.join(normalizedRoot, "src"));
  const graph = new Map(files.map((filePath) => [filePath, []]));
  const violations = [];

  for (const sourceFile of files) {
    for (const specifier of readModuleSpecifiers(sourceFile)) {
      if (specifier.startsWith("@test/")) {
        violations.push({
          file: formatPath(normalizedRoot, sourceFile),
          message: "production code must not import @test modules",
          specifier,
        });
        continue;
      }

      const targetFile = resolveSpecifier(normalizedRoot, sourceFile, specifier);
      if (targetFile === undefined || !graph.has(targetFile)) {
        continue;
      }

      graph.get(sourceFile)?.push(targetFile);
      const layerViolation = validateLayerDependency(normalizedRoot, sourceFile, targetFile);
      if (layerViolation !== undefined) {
        violations.push({
          file: formatPath(normalizedRoot, sourceFile),
          message: layerViolation,
          specifier,
        });
      }
    }
  }

  for (const cycle of findCycles(graph)) {
    violations.push({
      file: formatPath(normalizedRoot, cycle[0]),
      message: `circular dependency: ${cycle
        .map((filePath) => formatPath(normalizedRoot, filePath))
        .join(" -> ")}`,
      specifier: "",
    });
  }

  return violations;
}

function readRootArgument(argumentsList) {
  const rootIndex = argumentsList.indexOf("--root");
  if (rootIndex === -1) {
    return process.cwd();
  }

  const rootValue = argumentsList[rootIndex + 1];
  if (rootValue === undefined || rootValue.startsWith("--")) {
    throw new Error("--root requires a directory path.");
  }

  return rootValue;
}

const entryPath = process.argv[1];

if (entryPath !== undefined && import.meta.url === pathToFileURL(entryPath).href) {
  try {
    const rootDirectory = readRootArgument(process.argv.slice(2));
    const violations = checkArchitecture(rootDirectory);
    if (violations.length > 0) {
      for (const violation of violations) {
        const importDetails = violation.specifier === "" ? "" : ` (${violation.specifier})`;
        console.error(`[architecture] ${violation.file}: ${violation.message}${importDetails}`);
      }
      process.exitCode = 1;
    } else {
      console.log("[architecture] dependency boundaries and cycles are valid.");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown architecture check failure.";
    console.error(`[architecture] ${message}`);
    process.exitCode = 1;
  }
}
