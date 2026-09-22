import { queryOptions, useQuery } from "@tanstack/react-query";
import { listCoursesFn } from "./functions";

export const courseKeys = {
	all: ["courses"] as const,
	list: () => [...courseKeys.all, "list"] as const,
};

export const coursesQueryOptions = () =>
	queryOptions({
		queryKey: courseKeys.list(),
		queryFn: () => listCoursesFn(),
	});

export const useCoursesQuery = () => useQuery(coursesQueryOptions());
