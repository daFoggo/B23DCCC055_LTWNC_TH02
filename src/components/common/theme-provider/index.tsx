import { useRouter } from "@tanstack/react-router";
import type { PropsWithChildren } from "react";
import {
	createContext,
	use,
	useEffect,
	useRef,
	useState,
	useTransition,
} from "react";
import type { TTheme } from "@/lib/theme";
import { resolveTheme, setThemeServerFn } from "@/lib/theme";

type TResolvedTheme = "light" | "dark";

type TThemeContextVal = {
	theme: TTheme;
	resolvedTheme: TResolvedTheme;
	setTheme: (val: TTheme) => void;
	isPending: boolean;
};
type TThemeProviderProps = PropsWithChildren<{ theme?: TTheme }>;

const DEFAULT_THEME_CONTEXT: TThemeContextVal = {
	theme: "system",
	resolvedTheme: "light",
	setTheme: () => {},
	isPending: false,
};

const ThemeContext = createContext<TThemeContextVal>(DEFAULT_THEME_CONTEXT);

export const ThemeProvider = ({
	children,
	theme: initialTheme = "system",
}: TThemeProviderProps) => {
	const router = useRouter();
	const [theme, setThemeState] = useState<TTheme>(initialTheme);
	// On the server, we can't match media, so "system" falls back to "light".
	// On the client during hydration, we MUST return the same value as the server
	// to avoid a hydration mismatch. The inline FOUC script in __root.tsx has already
	// set the correct class on <html>; effects below will correct the React state.
	const [resolvedTheme, setResolvedTheme] = useState<TResolvedTheme>(
		initialTheme === "dark" ? "dark" : "light",
	);
	const [isPending, startTransition] = useTransition();

	// Đồng bộ local state khi server side theme thay đổi
	useEffect(() => {
		setThemeState(initialTheme);
		setResolvedTheme(
			resolveTheme(
				initialTheme,
				window.matchMedia("(prefers-color-scheme: dark)").matches,
			),
		);
	}, [initialTheme]);

	const isFirstClassSync = useRef(true);
	// Cập nhật class list để animation mượt mà.
	// Skip the first run: the inline FOUC script in __root.tsx already set the
	// correct class before hydration, so we must not revert it.
	useEffect(() => {
		if (isFirstClassSync.current) {
			isFirstClassSync.current = false;
			return;
		}
		const root = window.document.documentElement;
		root.classList.remove("light", "dark");
		root.classList.add(resolvedTheme);
	}, [resolvedTheme]);

	// Nếu theme đang theo hệ thống, lắng nghe thay đổi từ OS và cập nhật ngay
	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

		const syncResolvedTheme = () => {
			setResolvedTheme(resolveTheme(theme, mediaQuery.matches));
		};

		syncResolvedTheme();

		if (theme !== "system") {
			return;
		}

		mediaQuery.addEventListener("change", syncResolvedTheme);
		return () => mediaQuery.removeEventListener("change", syncResolvedTheme);
	}, [theme]);

	const setTheme = (val: TTheme) => {
		// 1. Cập nhật UI ngay lập tức (Optimistic)
		setThemeState(val);

		// 2. Gọi server function trong background
		startTransition(async () => {
			try {
				await setThemeServerFn({ data: val });
				await router.invalidate();
			} catch (error) {
				// Rollback nếu lỗi
				setThemeState(initialTheme);
				console.error("Failed to sync theme to server:", error);
			}
		});
	};

	return (
		<ThemeContext value={{ theme, resolvedTheme, setTheme, isPending }}>
			{children}
		</ThemeContext>
	);
};

export const useTheme = () => use(ThemeContext);

export { ThemeToggle } from "./theme-toggle";
