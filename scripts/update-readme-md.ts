import type { CompilerOptions } from "typescript";
import { readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { createDocumentation } from "typescript-documentation";
import { glob, type GlobOptionsWithFileTypesFalse } from "glob";
import { basename } from "node:path";

/**
 * Rewrites the "Credentials" and "Nodes" sections of the README.md file
 * to properly reflect all credentials and nodes in this package.
 */
async function main() {
	// Shared config

	const compilerOptions = JSON.parse(
		readFileSync("tsconfig.json", "utf-8"),
	) as CompilerOptions;

	const getSectionLocation = (section: string) => section;

	const globOptions: GlobOptionsWithFileTypesFalse = {
		posix: true,
	};

	// Generate Credentials Markdown

	const credentialsEntryFile = "credentials/entry.tmp.ts";

	writeFileSync(
		credentialsEntryFile,
		`
			/* This file is auto-generated. Do not edit. */
			${glob
				.sync("credentials/**/*.credentials.ts", globOptions)
				.map((path) => basename(path, ".credentials.ts"))
				.map(
					(className) =>
						`export { ${className} } from "./${className}.credentials";`,
				)
				.join("\n")}
		`,
	);

	const credentialsMarkdown = createDocumentation({
		compilerOptions,
		entry: credentialsEntryFile,
		getSectionLocation,
	}).get("default");

	unlinkSync(credentialsEntryFile);

	// Generate Nodes Markdown

	const nodesEntryFile = "nodes/entry.tmp.ts";

	writeFileSync(
		nodesEntryFile,
		`
			/* This file is auto-generated. Do not edit. */
			${glob
				.sync("nodes/**/*.node.ts", globOptions)
				.map((path) => basename(path, ".node.ts"))
				.map(
					(className) =>
						`export { ${className} } from "./${className}/${className}.node";`,
				)
				.join("\n")}
		`,
	);

	const nodesMarkdown = createDocumentation({
		compilerOptions,
		entry: nodesEntryFile,
		getSectionLocation,
	}).get("default");

	unlinkSync(nodesEntryFile);

	// Update README.md

	const readmeFile = "README.md";

	const readmeText = readFileSync(readmeFile, "utf-8");

	writeFileSync(
		readmeFile,
		readmeText
			.replace(
				/<!-- begin-credentials -->[\s\S]*<!-- end-credentials -->/,
				`<!-- begin-credentials -->\n${credentialsMarkdown}\n<!-- end-credentials -->`,
			)
			.replace(
				/<!-- begin-nodes -->[\s\S]*<!-- end-nodes -->/,
				`<!-- begin-nodes -->\n${nodesMarkdown}\n<!-- end-nodes -->`,
			),
	);
}

main();
