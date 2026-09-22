import { z } from "zod";

export const CourseIdSchema = z.string().uuid("ID môn học không hợp lệ");
export type CourseId = z.infer<typeof CourseIdSchema>;

export const CourseSchema = z.object({
	id: CourseIdSchema,
	code: z
		.string()
		.trim()
		.min(1, "Mã môn không được để trống")
		.max(16, "Mã môn quá dài"),
	name: z
		.string()
		.trim()
		.min(1, "Tên môn không được để trống")
		.max(255, "Tên môn quá dài"),
});
export type Course = z.infer<typeof CourseSchema>;

export const NewCourseInputSchema = CourseSchema.omit({ id: true });
export type NewCourseInput = z.infer<typeof NewCourseInputSchema>;

export const isCourse = (value: unknown): value is Course =>
	CourseSchema.safeParse(value).success;

const isArrayOf =
	<T>(guard: (value: unknown) => value is T) =>
	(value: unknown): value is T[] =>
		Array.isArray(value) && value.every(guard);

export const isCourseList = isArrayOf(isCourse);
