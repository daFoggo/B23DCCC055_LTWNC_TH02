import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDebounce } from "./use-debounce";

describe("useDebounce hook with fake timers", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("returns initial value immediately", () => {
		const { result } = renderHook(() => useDebounce("hello", 300));
		expect(result.current).toBe("hello");
	});

	it("updates value only after specified delay (300ms)", () => {
		const { result, rerender } = renderHook(
			({ value, delay }) => useDebounce(value, delay),
			{
				initialProps: { value: "first", delay: 300 },
			},
		);

		expect(result.current).toBe("first");

		// Change input
		rerender({ value: "second", delay: 300 });

		// Advance time by 200ms - value should still be old
		act(() => {
			vi.advanceTimersByTime(200);
		});
		expect(result.current).toBe("first");

		// Advance another 100ms - value should now be updated
		act(() => {
			vi.advanceTimersByTime(100);
		});
		expect(result.current).toBe("second");
	});

	it("cancels pending timeout on rapid changes", () => {
		const { result, rerender } = renderHook(
			({ value, delay }) => useDebounce(value, delay),
			{
				initialProps: { value: "A", delay: 300 },
			},
		);

		rerender({ value: "B", delay: 300 });
		act(() => {
			vi.advanceTimersByTime(150);
		});
		expect(result.current).toBe("A");

		// Fast change to C before 300ms passed
		rerender({ value: "C", delay: 300 });
		act(() => {
			vi.advanceTimersByTime(200);
		});
		// Only 200ms passed since C was set, so still A
		expect(result.current).toBe("A");

		// Advance remaining 100ms for C
		act(() => {
			vi.advanceTimersByTime(100);
		});
		expect(result.current).toBe("C");
	});
});
