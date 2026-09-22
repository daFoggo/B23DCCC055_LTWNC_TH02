import { arrayMove } from "@dnd-kit/sortable";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AssignmentStatus, Priority } from "./schemas";

export type KanbanSortOption =
	| "manual"
	| "deadline-asc"
	| "deadline-desc"
	| "priority-desc"
	| "name-asc";

export type ColumnOrderMap = Record<AssignmentStatus, string[]>;

export interface KanbanLayoutState {
	activeDragId: string | null;
	searchQuery: string;
	priorityFilter: Priority | "all";
	courseFilter: string | "all";
	sortBy: KanbanSortOption;
	columnOrder: ColumnOrderMap;
}

export interface KanbanLayoutActions {
	setActiveDragId: (id: string | null) => void;
	setSearchQuery: (query: string) => void;
	setPriorityFilter: (priority: Priority | "all") => void;
	setCourseFilter: (courseId: string | "all") => void;
	setSortBy: (sort: KanbanSortOption) => void;
	setColumnOrder: (order: ColumnOrderMap) => void;
	reorderInColumn: (
		status: AssignmentStatus,
		activeId: string,
		overId: string,
		currentItemIds: string[],
	) => void;
	moveBetweenColumnsOrder: (
		sourceStatus: AssignmentStatus,
		targetStatus: AssignmentStatus,
		activeId: string,
		overId: string | null,
		sourceItemIds: string[],
		targetItemIds: string[],
	) => void;
	resetFilters: () => void;
	resetLayout: () => void;
}

const getMergedOrder = (
	actualIds: string[],
	storedOrder?: string[],
): string[] => {
	if (!storedOrder || storedOrder.length === 0) return [...actualIds];
	const actualSet = new Set(actualIds);
	const ordered = storedOrder.filter((id) => actualSet.has(id));
	const orderedSet = new Set(ordered);
	for (const id of actualIds) {
		if (!orderedSet.has(id)) {
			ordered.push(id);
		}
	}
	return ordered;
};

const initialColumnOrder: ColumnOrderMap = {
	"in-progress": [],
	overdue: [],
	completed: [],
};

const initialLayoutState: KanbanLayoutState = {
	activeDragId: null,
	searchQuery: "",
	priorityFilter: "all",
	courseFilter: "all",
	sortBy: "manual",
	columnOrder: initialColumnOrder,
};

export const useKanbanStore = create<KanbanLayoutState & KanbanLayoutActions>()(
	persist(
		(set, get) => ({
			...initialLayoutState,

			setActiveDragId: (activeDragId) => set({ activeDragId }),
			setSearchQuery: (searchQuery) => set({ searchQuery }),
			setPriorityFilter: (priorityFilter) => set({ priorityFilter }),
			setCourseFilter: (courseFilter) => set({ courseFilter }),
			setSortBy: (sortBy) => set({ sortBy }),
			setColumnOrder: (columnOrder) => set({ columnOrder }),

			reorderInColumn: (status, activeId, overId, currentItemIds) => {
				const currentOrder = getMergedOrder(
					currentItemIds,
					get().columnOrder[status],
				);
				const oldIndex = currentOrder.indexOf(activeId);
				const newIndex = currentOrder.indexOf(overId);
				if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

				const nextOrder = arrayMove(currentOrder, oldIndex, newIndex);
				set((state) => ({
					sortBy: "manual",
					columnOrder: {
						...state.columnOrder,
						[status]: nextOrder,
					},
				}));
			},

			moveBetweenColumnsOrder: (
				sourceStatus,
				targetStatus,
				activeId,
				overId,
				sourceItemIds,
				targetItemIds,
			) => {
				const sourceOrder = getMergedOrder(
					sourceItemIds,
					get().columnOrder[sourceStatus],
				).filter((id) => id !== activeId);

				const targetBase = getMergedOrder(
					targetItemIds,
					get().columnOrder[targetStatus],
				).filter((id) => id !== activeId);

				let targetOrder: string[];
				if (overId && overId !== targetStatus) {
					const targetIndex = targetBase.indexOf(overId);
					if (targetIndex !== -1) {
						targetOrder = [
							...targetBase.slice(0, targetIndex),
							activeId,
							...targetBase.slice(targetIndex),
						];
					} else {
						targetOrder = [...targetBase, activeId];
					}
				} else {
					targetOrder = [...targetBase, activeId];
				}

				set((state) => ({
					sortBy: "manual",
					columnOrder: {
						...state.columnOrder,
						[sourceStatus]: sourceOrder,
						[targetStatus]: targetOrder,
					},
				}));
			},

			resetFilters: () =>
				set({
					searchQuery: "",
					priorityFilter: "all",
					courseFilter: "all",
					sortBy: "manual",
				}),
			resetLayout: () => set(initialLayoutState),
		}),
		{
			name: "kanban-layout-preferences",
			partialize: (state) => ({
				sortBy: state.sortBy,
				priorityFilter: state.priorityFilter,
				courseFilter: state.courseFilter,
				columnOrder: state.columnOrder,
			}),
		},
	),
);
