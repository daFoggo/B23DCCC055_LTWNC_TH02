import { createServerFn } from "@tanstack/react-start";
import { listCourses } from "./server";

export const listCoursesFn = createServerFn({ method: "GET" }).handler(
	async () => listCourses(),
);
