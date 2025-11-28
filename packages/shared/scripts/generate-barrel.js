// generate-barrel.js
const { Project } = require("ts-morph");
const fs = require("fs");
const path = require("path");

const SRC_DIR = path.resolve(__dirname, "..", "src");
const OUT_FILE = path.join(SRC_DIR, "index.ts");

function walk(dir) {
  const files = fs.readdirSync(dir);
  return files.flatMap((file) => {
    const fullPath = path.join(dir, file);

    // Skip the types folder entirely
    if (fullPath.startsWith(path.join(SRC_DIR, "types"))) {
      return [];
    }
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      return walk(fullPath);
    } else if (/\.(ts|tsx)$/.test(file) && !file.endsWith("index.ts")) {
      return fullPath;
    }
    return [];
  });
}

function main() {
  const project = new Project({
    tsConfigFilePath: path.join(__dirname, "..", "tsconfig.json"),
  });

  const files = walk(SRC_DIR);
  const lines = [];

  files.forEach((filePath) => {
    const rel =
      "./" +
      path
        .relative(SRC_DIR, filePath)
        .replace(/\\/g, "/")
        .replace(/\.(ts|tsx)$/, "");
    const sourceFile = project.addSourceFileAtPath(filePath);

    const hasDefault = sourceFile.getDefaultExportSymbol() !== undefined;
    const hasNamed =
      sourceFile.getExportSymbols().length > (hasDefault ? 1 : 0);

    if (hasDefault) {
      const base = path.basename(filePath, path.extname(filePath));
      lines.push(`export { default as ${base} } from "${rel}";`);
    }
    if (hasNamed) {
      lines.push(`export * from "${rel}";`);
    }
  });

  fs.writeFileSync(OUT_FILE, lines.join("\n") + "\n");
  console.log(`Generated ${OUT_FILE} with ${files.length} files processed.`);
}

main();
