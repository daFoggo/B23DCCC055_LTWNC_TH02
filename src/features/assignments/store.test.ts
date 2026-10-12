import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useAssignmentsByStatus } from "./hooks";
import { useKanbanStore, usePinStore } from "./store";

describe("assignments store unit tests", () => {
	beforeEach(() => {
		usePinStore.setState({ pinnedIds: [] });
	});

	it("initializes with empty pinnedIds", () => {
		const { pinnedIds, isPinned } = usePinStore.getState();
		expect(pinnedIds).toEqual([]);
		expect(isPinned("test-id")).toBe(false);
	});

	it("toggles pin on an assignment", () => {
		const { togglePin } = usePinStore.getState();

		act(() => {
			togglePin("assignment-1");
		});

		expect(usePinStore.getState().pinnedIds).toContain("assignment-1");
		expect(usePinStore.getState().isPinned("assignment-1")).toBe(true);

		// Toggle again to unpin
		act(() => {
			usePinStore.getState().togglePin("assignment-1");
		});

		expect(usePinStore.getState().pinnedIds).not.toContain("assignment-1");
		expect(usePinStore.getState().isPinned("assignment-1")).toBe(false);
	});

	it("prepends newly pinned ids", () => {
		const { togglePin } = usePinStore.getState();

		act(() => {
			togglePin("first");
			togglePin("second");
		});

		expect(usePinStore.getState().pinnedIds).toEqual(["second", "first"]);
	});
});

describe("useKanbanStore unit tests", () => {
	beforeEach(() => {
		useKanbanStore.getState().resetLayout();
	});

	it("updates search, priority, course, sort filters", () => {
		const { setSearchQuery, setPriorityFilter, setCourseFilter, setSortBy } =
			useKanbanStore.getState();

		act(() => {
			setSearchQuery("abc");
			setPriorityFilter("high");
			setCourseFilter("c-1");
			setSortBy("deadline-desc");
		});

		const state = useKanbanStore.getState();
		expect(state.searchQuery).toBe("abc");
		expect(state.priorityFilter).toBe("high");
		expect(state.courseFilter).toBe("c-1");
		expect(state.sortBy).toBe("deadline-desc");

		act(() => {
			state.resetFilters();
		});

		const resetState = useKanbanStore.getState();
		expect(resetState.searchQuery).toBe("");
		expect(resetState.priorityFilter).toBe("all");
		expect(resetState.sortBy).toBe("manual");
	});

	it("reorders items in column", () => {
		const { reorderInColumn } = useKanbanStore.getState();
		act(() => {
			reorderInColumn("in-progress", "1", "2", ["1", "2", "3"]);
		});
		expect(useKanbanStore.getState().columnOrder["in-progress"]).toEqual([
			"2",
			"1",
			"3",
		]);
	});

	it("moves items between columns", () => {
		const { moveBetweenColumnsOrder } = useKanbanStore.getState();
		act(() => {
			moveBetweenColumnsOrder(
				"in-progress",
				"completed",
				"1",
				"2",
				["1", "3"],
				["2", "4"],
			);
		});
		expect(useKanbanStore.getState().columnOrder["in-progress"]).toEqual(["3"]);
		expect(useKanbanStore.getState().columnOrder["completed"]).toEqual([
			"1",
			"2",
			"4",
		]);
	});
});

describe("useAssignmentsByStatus hook", () => {
	it("groups assignments correctly", () => {
		const sampleList = [
			{
				id: "1",
				courseId: "course-web",
				name: "Bài 1",
				deadline: "2026-10-25T00:00:00.000Z",
				priority: "high",
				completed: false,
				createdAt: "2026-10-01T00:00:00.000Z",
			},
			{
				id: "2",
				courseId: "course-web",
				name: "Bài 2",
				deadline: "2026-10-25T00:00:00.000Z",
				priority: "medium",
				completed: true,
				createdAt: "2026-10-01T00:00:00.000Z",
			},
		];

		const { result } = renderHook(() => useAssignmentsByStatus(sampleList));
		expect(result.current["completed"].length).toBe(1);
		expect(result.current["in-progress"].length).toBe(1);
	});
});
