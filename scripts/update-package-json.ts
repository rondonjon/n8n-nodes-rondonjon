import { readFileSync, writeFileSync } from "node:fs";
import { glob } from "glob";
import { basename, posix } from "node:path";

/**
 * Rewrites the "n8n" section of the package.json file to properly
 * reflect the paths of all credentials and nodes in this package.
 */
async function main() {
	const p = JSON.parse(readFileSync("package.json", "utf-8"));

	p.n8n = {
		n8nNodesApiVersion: 1,
		credentials: glob
			.sync("credentials/**/*.credentials.ts", {
				posix: true,
			})
			.map((path) => basename(path, ".credentials.ts"))
			.map((path) => posix.join("dist/credentials", `${path}.credentials.js`))
			.sort(),
		nodes: glob
			.sync("nodes/**/*.node.ts", {
				posix: true,
			})
			.map((path) => basename(path, ".node.ts"))
			.map((path) => posix.join("dist/nodes", path, `${path}.node.js`))
			.sort(),
	};

	writeFileSync("package.json", JSON.stringify(p, null, "\t"));
}

main();
