import type { QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { createQueryClient } from "@/lib/query-client";
import { routeTree } from "./routeTree.gen";

export interface IRouterContext {
	queryClient: QueryClient;
}

export const getRouter = () => {
	const queryClient = createQueryClient();

	const router = createTanStackRouter({
		routeTree,
		context: {
			queryClient,
		},

		scrollRestoration: true,
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0,
	});

	setupRouterSsrQueryIntegration({
		router,
		queryClient,
		wrapQueryClient: false,
	});

	return router;
};

export interface NavItem {
	title: string;
	to: string;
	icon: React.ComponentType<{ className?: string }>;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}

	interface IStaticDataRouteOption {
		getTitle?: () => string;
		navItems?: NavItem[];
	}

	interface StaticDataRouteOption {
		getTitle?: () => string;
		navItems?: NavItem[];
	}
}
