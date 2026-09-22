/**
 * Cấu hình thông tin cơ bản của website như title, description và default metadata.
 * Được sử dụng tập trung cho việc hiển thị page title và hỗ trợ SEO.
 */
export const SITE_CONFIG = {
	metadata: {
		title: "startcn-base",
		description:
			"Production-ready web application starter built with TanStack Start, React 19, shadcn/ui, Tailwind CSS v4, and Supabase.",
		keywords: [
			"startcn-base",
			"tanstack start",
			"react 19",
			"shadcn",
			"tailwind v4",
			"supabase",
			"starter template",
		],
	},
	app: {
		title: "Student Deadline Tracker",
		slogan: "Production-ready web application starter.",
		url: "https://startcn-base.vercel.app",
		github: "https://github.com/daFoggo/startcn-base",
		ogImage: "/og-image.png",
	},
} as const;

export type TSiteConfig = typeof SITE_CONFIG;
