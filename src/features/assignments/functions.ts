import { createServerFn } from "@tanstack/react-start";
import {
	DeleteAssignmentInputSchema,
	NewAssignmentInputSchema,
	ToggleAssignmentInputSchema,
	UpdateAssignmentInputSchema,
} from "./schemas";
import {
	createAssignment,
	deleteAssignment,
	listAssignments,
	toggleAssignment,
	updateAssignment,
} from "./server";

export const listAssignmentsFn = createServerFn({ method: "GET" }).handler(
	async () => listAssignments(),
);

export const createAssignmentFn = createServerFn({ method: "POST" })
	.validator(NewAssignmentInputSchema)
	.handler(async ({ data }) => createAssignment(data));

export const toggleAssignmentFn = createServerFn({ method: "POST" })
	.validator(ToggleAssignmentInputSchema)
	.handler(async ({ data }) => toggleAssignment(data));

export const updateAssignmentFn = createServerFn({ method: "POST" })
	.validator(UpdateAssignmentInputSchema)
	.handler(async ({ data }) => updateAssignment(data));

export const deleteAssignmentFn = createServerFn({ method: "POST" })
	.validator(DeleteAssignmentInputSchema)
	.handler(async ({ data }) => deleteAssignment(data));
