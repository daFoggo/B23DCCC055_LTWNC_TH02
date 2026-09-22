import "@tanstack/react-start/server-only";
import { SAMPLE_ASSIGNMENTS } from "./mock";
import type {
	Assignment,
	DeleteAssignmentInput,
	NewAssignmentInput,
	ToggleAssignmentInput,
	UpdateAssignmentInput,
} from "./schemas";

let tempAssignments: Assignment[] = SAMPLE_ASSIGNMENTS.map((assignment) => ({
	...assignment,
}));

export const listAssignments = async (): Promise<Assignment[]> =>
	tempAssignments.map((assignment) => ({ ...assignment }));

export const createAssignment = async (
	input: NewAssignmentInput,
): Promise<Assignment> => {
	const assignment: Assignment = {
		...input,
		id: crypto.randomUUID(),
		completed: false,
		createdAt: new Date().toISOString(),
	};
	tempAssignments = [assignment, ...tempAssignments];
	return { ...assignment };
};

export const toggleAssignment = async (
	input: ToggleAssignmentInput,
): Promise<Assignment> => {
	const assignment = tempAssignments.find((item) => item.id === input.id);
	if (!assignment) {
		throw new Error("Không tìm thấy bài tập");
	}
	assignment.completed = input.completed;
	return { ...assignment };
};

export const updateAssignment = async (
	input: UpdateAssignmentInput,
): Promise<Assignment> => {
	const assignment = tempAssignments.find((item) => item.id === input.id);
	if (!assignment) {
		throw new Error("Không tìm thấy bài tập");
	}
	assignment.courseId = input.courseId;
	assignment.name = input.name;
	assignment.deadline = input.deadline;
	assignment.priority = input.priority;
	return { ...assignment };
};

export const deleteAssignment = async (
	input: DeleteAssignmentInput,
): Promise<{ id: string }> => {
	tempAssignments = tempAssignments.filter((item) => item.id !== input.id);
	return { id: input.id };
};
