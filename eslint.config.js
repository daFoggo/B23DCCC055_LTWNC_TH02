//  @ts-check

import { tanstackConfig } from "@tanstack/eslint-config";

export default [
	...tanstackConfig,
	{
		rules: {
			"import/no-cycle": "off",
			"import/order": "off",
			"sort-imports": "off",
			"@typescript-eslint/array-type": "off",
			"@typescript-eslint/require-await": "off",
			"pnpm/json-enforce-catalog": "off",
			"func-style": ["error", "expression", { allowArrowFunctions: true }],
		},
	},
	{
		ignores: [
			"eslint.config.js",
			".prettierrc",
			".output/**",
			".tanstack/**",
			".vinxi/**",
			".wrangler/**",
			"dist/**",
			"dist-ssr/**",
			"src/components/ui/**",
			"src/env.d.ts",
			"src/routeTree.gen.ts",
		],
	},
];
