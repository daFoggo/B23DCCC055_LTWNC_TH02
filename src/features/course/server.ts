import "@tanstack/react-start/server-only";
import { SAMPLE_COURSES } from "./mock";
import type { Course } from "./schemas";

export const listCourses = async (): Promise<Course[]> =>
	SAMPLE_COURSES.map((course) => ({ ...course }));
