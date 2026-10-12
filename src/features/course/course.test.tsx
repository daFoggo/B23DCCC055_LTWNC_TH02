import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, renderHook, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { CourseIcon } from "./components/course-icon";
import * as functions from "./functions";
import { courseKeys, coursesQueryOptions, useCoursesQuery } from "./queries";
import { isCourse, isCourseList } from "./schemas";

vi.mock("./functions", () => ({
	listCoursesFn: vi.fn(),
}));

const mockedFunctions = vi.mocked(functions);

describe("course feature", () => {
	it("renders all course icons correctly", () => {
		const codes = ["MATH", "DSA", "WEB", "DB", "OS", "NET", "OTHER"];
		for (const code of codes) {
			const { unmount } = render(
				<CourseIcon code={code} data-testid={`icon-${code}`} />,
			);
			unmount();
		}
	});

	it("validates courses with schema guards", () => {
		const validCourse = {
			id: "3a2f7c1d-4b5e-4f8a-9c6d-1e2f3a4b5c6d",
			code: "MATH",
			name: "Toán",
		};
		expect(isCourse(validCourse)).toBe(true);
		expect(isCourse({ id: "invalid" })).toBe(false);
		expect(isCourseList([validCourse])).toBe(true);
		expect(isCourseList([validCourse, { invalid: true }])).toBe(false);
	});

	it("fetches courses via useCoursesQuery", async () => {
		const sampleCourses = [
			{
				id: "3a2f7c1d-4b5e-4f8a-9c6d-1e2f3a4b5c6d",
				code: "MATH",
				name: "Toán",
			},
		];
		mockedFunctions.listCoursesFn.mockResolvedValue(sampleCourses);

		const client = new QueryClient({
			defaultOptions: { queries: { retry: false } },
		});
		const wrapper = ({ children }: { children: ReactNode }) => (
			<QueryClientProvider client={client}>{children}</QueryClientProvider>
		);

		const { result } = renderHook(() => useCoursesQuery(), { wrapper });
		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		expect(result.current.data).toEqual(sampleCourses);
	});
});
