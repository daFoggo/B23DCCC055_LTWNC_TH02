import { z } from "zod";
import { CourseIdSchema } from "@/features/course/schemas";

export const PRIORITIES = ["low", "medium", "high"] as const;

export type Priority = (typeof PRIORITIES)[number];

export const ASSIGNMENT_STATUSES = [
	"in-progress",
	"overdue",
	"completed",
] as const;

export type AssignmentStatus = (typeof ASSIGNMENT_STATUSES)[number];

export const STATUS_FILTERS = ["all", ...ASSIGNMENT_STATUSES] as const;

export type StatusFilter = (typeof STATUS_FILTERS)[number];

export const PrioritySchema = z.enum(PRIORITIES);
export const AssignmentStatusSchema = z.enum(ASSIGNMENT_STATUSES);
export const StatusFilterSchema = z.enum(STATUS_FILTERS);

export const AssignmentIdSchema = z.string().uuid("ID bài tập không hợp lệ");
export type AssignmentId = z.infer<typeof AssignmentIdSchema>;

export const IsoDateTimeSchema = z.string().datetime({
	offset: true,
	message: "Ngày giờ không hợp lệ",
});

export const AssignmentSchema = z.object({
	id: AssignmentIdSchema,
	courseId: CourseIdSchema,
	name: z
		.string()
		.trim()
		.min(1, "Tên bài tập không được để trống")
		.max(255, "Tên bài tập quá dài"),
	deadline: IsoDateTimeSchema,
	priority: PrioritySchema,
	completed: z.boolean(),
	createdAt: IsoDateTimeSchema,
});
export type Assignment = z.infer<typeof AssignmentSchema>;

export const NewAssignmentInputSchema = z.object({
	courseId: CourseIdSchema,
	name: z
		.string()
		.trim()
		.min(1, "Tên bài tập không được để trống")
		.max(255, "Tên bài tập quá dài"),
	deadline: IsoDateTimeSchema,
	priority: PrioritySchema,
});
export type NewAssignmentInput = z.infer<typeof NewAssignmentInputSchema>;

export const DEFAULT_NEW_ASSIGNMENT_INPUT: NewAssignmentInput = {
	courseId: "",
	name: "",
	deadline: "",
	priority: "medium",
};

export const ToggleAssignmentInputSchema = z.object({
	id: AssignmentIdSchema,
	completed: z.boolean(),
});
export type ToggleAssignmentInput = z.infer<typeof ToggleAssignmentInputSchema>;

export const UpdateAssignmentInputSchema = NewAssignmentInputSchema.extend({
	id: AssignmentIdSchema,
});
export type UpdateAssignmentInput = z.infer<typeof UpdateAssignmentInputSchema>;

export const DeleteAssignmentInputSchema = z.object({
	id: AssignmentIdSchema,
});
export type DeleteAssignmentInput = z.infer<typeof DeleteAssignmentInputSchema>;
