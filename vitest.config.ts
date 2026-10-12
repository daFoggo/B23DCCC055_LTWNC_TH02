import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: { tsconfigPaths: true },
	plugins: [viteReact()],
	test: {
		environment: "jsdom",
		setupFiles: ["./src/test-setup.ts"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			include: ["src/features/**"],
			exclude: [
				"src/features/**/index.ts",
				"src/features/**/server.ts",
				"src/features/**/functions.ts",
				"src/features/**/mock.ts",
				"src/features/**/*.test.{ts,tsx}",
			],
			thresholds: {
				statements: 70,
			},
		},
	},
});
