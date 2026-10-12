import type {
	Assignment,
	AssignmentStatus,
	Priority,
	StatusFilter,
} from "./schemas";
import {
	ASSIGNMENT_STATUSES,
	AssignmentSchema,
	PRIORITIES,
	STATUS_FILTERS,
} from "./schemas";
import type { ColumnOrderMap, KanbanSortOption } from "./store";

const isInTuple =
	<T extends readonly string[]>(tuple: T) =>
	(value: unknown): value is T[number] =>
		typeof value === "string" && (tuple as readonly string[]).includes(value);

export const isPriority = isInTuple(PRIORITIES);
export const isAssignmentStatus = isInTuple(ASSIGNMENT_STATUSES);
export const isStatusFilter = isInTuple(STATUS_FILTERS);

export const isAssignment = (value: unknown): value is Assignment =>
	AssignmentSchema.safeParse(value).success;

const DAY_MS = 24 * 60 * 60 * 1000;

export const getDaysUntilDeadline = (
	deadline: string,
	now: Date = new Date(),
): number => Math.ceil((Date.parse(deadline) - now.getTime()) / DAY_MS);

export const calcDaysLeft = (
	deadline: string,
	now: Date = new Date(),
): number => {
	const diff = Date.parse(deadline) - now.getTime();
	return Math.ceil(diff / DAY_MS);
};

export const isOverdue = (
	assignment: Pick<Assignment, "completed" | "deadline">,
	now: Date = new Date(),
): boolean => {
	if (assignment.completed) return false;
	return Date.parse(assignment.deadline) < now.getTime();
};

export interface AssignmentStats {
	total: number;
	completed: number;
	inProgress: number;
	overdue: number;
	byCourse: Record<
		string,
		{ total: number; completed: number; overdue: number } | undefined
	>;
}

export const calcStats = (
	assignments: Assignment[],
	now: Date = new Date(),
): AssignmentStats => {
	const stats: AssignmentStats = {
		total: assignments.length,
		completed: 0,
		inProgress: 0,
		overdue: 0,
		byCourse: {},
	};

	for (const a of assignments) {
		const status = getAssignmentStatus(a, now);
		if (status === "completed") {
			stats.completed += 1;
		} else if (status === "overdue") {
			stats.overdue += 1;
		} else {
			stats.inProgress += 1;
		}

		const currentCourseStat = stats.byCourse[a.courseId] ?? {
			total: 0,
			completed: 0,
			overdue: 0,
		};
		currentCourseStat.total += 1;
		if (status === "completed") {
			currentCourseStat.completed += 1;
		} else if (status === "overdue") {
			currentCourseStat.overdue += 1;
		}
		stats.byCourse[a.courseId] = currentCourseStat;
	}


	return stats;
};

export const getAssignmentStatus = (
	assignment: Pick<Assignment, "completed" | "deadline">,
	now: Date = new Date(),
): AssignmentStatus => {
	if (assignment.completed) return "completed";
	return Date.parse(assignment.deadline) < now.getTime()
		? "overdue"
		: "in-progress";
};

export type DeadlineLabel =
	| { readonly kind: "remaining"; readonly days: number }
	| { readonly kind: "overdue"; readonly days: number }
	| { readonly kind: "today" };

export const getDeadlineLabel = (
	deadline: string,
	now: Date = new Date(),
): DeadlineLabel => {
	const days = getDaysUntilDeadline(deadline, now);
	if (days > 0) return { kind: "remaining", days };
	if (days < 0) return { kind: "overdue", days: -days };
	return { kind: "today" };
};

export const describeDeadline = (
	deadline: string,
	now: Date = new Date(),
): string => {
	const label = getDeadlineLabel(deadline, now);
	switch (label.kind) {
		case "remaining":
			return `Còn ${label.days} ngày`;
		case "overdue":
			return `Quá hạn ${label.days} ngày`;
		case "today":
			return "Hạn nộp hôm nay";
	}
};

export const matchesStatusFilter = (
	assignment: Assignment,
	filter: StatusFilter,
	now: Date = new Date(),
): boolean =>
	filter === "all" || getAssignmentStatus(assignment, now) === filter;

export interface PriorityMeta {
	readonly label: string;
	readonly rank: number;
}

export const PRIORITY_META: Record<Priority, PriorityMeta> = {
	low: { label: "Thấp", rank: 1 },
	medium: { label: "Trung bình", rank: 2 },
	high: { label: "Cao", rank: 3 },
};

export interface StatusMeta {
	readonly label: string;
}

export const STATUS_META: Record<AssignmentStatus, StatusMeta> = {
	"in-progress": { label: "Chưa hoàn thành" },
	overdue: { label: "Quá hạn" },
	completed: { label: "Đã hoàn thành" },
};

export interface FilterTab {
	readonly value: StatusFilter;
	readonly label: string;
}

export const FILTER_LABELS: Record<StatusFilter, string> = {
	all: "Tất cả",
	"in-progress": "Chưa hoàn thành",
	overdue: "Quá hạn",
	completed: "Đã hoàn thành",
};

export const FILTER_TABS: readonly FilterTab[] = STATUS_FILTERS.map(
	(value) => ({ value, label: FILTER_LABELS[value] }),
);

export const groupAssignmentsByStatus = (
	assignments: Assignment[],
	now: Date = new Date(),
	columnOrder?: ColumnOrderMap,
): Record<AssignmentStatus, Assignment[]> => {
	const groups: Record<AssignmentStatus, Assignment[]> = {
		"in-progress": [],
		overdue: [],
		completed: [],
	};
	for (const assignment of assignments) {
		groups[getAssignmentStatus(assignment, now)].push(assignment);
	}
	if (columnOrder) {
		for (const status of ASSIGNMENT_STATUSES) {
			const order = columnOrder[status];
			if (order.length > 0) {
				groups[status].sort((a, b) => {
					const idxA = order.indexOf(a.id);
					const idxB = order.indexOf(b.id);
					if (idxA === -1 && idxB === -1) return 0;
					if (idxA === -1) return 1;
					if (idxB === -1) return -1;
					return idxA - idxB;
				});
			}
		}
	}
	return groups;
};

export { fromLocalInputValue, toLocalInputValue } from "@/lib/date";

export interface AssignmentFilterCriteria {
	searchQuery?: string;
	priorityFilter?: Priority | "all";
	courseFilter?: string | "all";
	sortBy?: KanbanSortOption;
	pinnedIds?: string[];
}

export const filterAndSortAssignments = (
	assignments: Assignment[],
	criteria: AssignmentFilterCriteria,
	courseNameById: Record<string, string | undefined> = {},
): Assignment[] => {
	const query = (criteria.searchQuery ?? "").trim().toLowerCase();
	const priority = criteria.priorityFilter ?? "all";
	const courseId = criteria.courseFilter ?? "all";
	const sortBy = criteria.sortBy ?? "deadline-asc";
	const pinnedIds = criteria.pinnedIds ?? [];
	const pinnedSet = new Set(pinnedIds);

	const filtered = assignments.filter((assignment) => {
		if (priority !== "all" && assignment.priority !== priority) {
			return false;
		}
		if (courseId !== "all" && assignment.courseId !== courseId) {
			return false;
		}
		if (query) {
			const courseName = (
				courseNameById[assignment.courseId] ?? ""
			).toLowerCase();
			const assignmentName = assignment.name.toLowerCase();
			if (!assignmentName.includes(query) && !courseName.includes(query)) {
				return false;
			}
		}
		return true;
	});

	return [...filtered].sort((a, b) => {
		// Bài tập đã ghim luôn hiện lên đầu danh sách
		const aPinned = pinnedSet.has(a.id);
		const bPinned = pinnedSet.has(b.id);
		if (aPinned && !bPinned) return -1;
		if (!aPinned && bPinned) return 1;

		switch (sortBy) {
			case "deadline-asc":
				return Date.parse(a.deadline) - Date.parse(b.deadline);
			case "deadline-desc":
				return Date.parse(b.deadline) - Date.parse(a.deadline);
			case "priority-desc": {
				const diff =
					PRIORITY_META[b.priority].rank - PRIORITY_META[a.priority].rank;
				if (diff !== 0) return diff;
				return Date.parse(a.deadline) - Date.parse(b.deadline);
			}
			case "name-asc":
				return a.name.localeCompare(b.name, "vi", { sensitivity: "base" });
			default:
				return 0;
		}
	});
};
