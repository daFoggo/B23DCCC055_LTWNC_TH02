import { useMemo } from "react";
import { groupAssignmentsByStatus } from "./lib";
import type { Assignment, AssignmentStatus } from "./schemas";
import type { ColumnOrderMap } from "./store";

export const useAssignmentsByStatus = (
	assignments: Assignment[],
	columnOrder?: ColumnOrderMap,
): Record<AssignmentStatus, Assignment[]> => {
	return useMemo(
		() => groupAssignmentsByStatus(assignments, undefined, columnOrder),
		[assignments, columnOrder],
	);
};
