import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as functions from "./functions";
import {
	assignmentKeys,
	useAssignmentsQuery,
	useCreateAssignmentMutation,
	useDeleteAssignmentMutation,
	useToggleAssignmentMutation,
	useUpdateAssignmentMutation,
} from "./queries";
import type { Assignment } from "./schemas";

vi.mock("./functions", () => ({
	listAssignmentsFn: vi.fn(),
	createAssignmentFn: vi.fn(),
	toggleAssignmentFn: vi.fn(),
	updateAssignmentFn: vi.fn(),
	deleteAssignmentFn: vi.fn(),
}));

const mockedFunctions = vi.mocked(functions);

const sampleAssignment: Assignment = {
	id: "asm-1",
	courseId: "course-web",
	name: "Bài tập 1",
	deadline: "2026-10-20T00:00:00.000Z",
	priority: "high",
	completed: false,
	createdAt: "2026-10-01T00:00:00.000Z",
};

const createWrapper = () => {
	const client = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
		},
	});
	const Wrapper = ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={client}>{children}</QueryClientProvider>
	);
	return { client, Wrapper };
};

describe("assignments queries & mutations async tests", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("useAssignmentsQuery async states", () => {
		it("handles loading and successful data fetch state", async () => {
			mockedFunctions.listAssignmentsFn.mockResolvedValue([sampleAssignment]);

			const { Wrapper } = createWrapper();
			const { result } = renderHook(() => useAssignmentsQuery(), {
				wrapper: Wrapper,
			});

			// Initial state is loading/pending
			expect(result.current.isLoading).toBe(true);

			// Await success
			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(result.current.data).toEqual([sampleAssignment]);
			expect(mockedFunctions.listAssignmentsFn).toHaveBeenCalledTimes(1);
		});

		it("handles error state when API call fails", async () => {
			mockedFunctions.listAssignmentsFn.mockRejectedValue(
				new Error("Network connection error"),
			);

			const { Wrapper } = createWrapper();
			const { result } = renderHook(() => useAssignmentsQuery(), {
				wrapper: Wrapper,
			});

			await waitFor(() => {
				expect(result.current.isError).toBe(true);
			});

			expect(result.current.error).toBeInstanceOf(Error);
			expect(result.current.error?.message).toBe("Network connection error");
		});
	});

	describe("assignments mutations", () => {
		it("creates assignment and updates query cache", async () => {
			mockedFunctions.createAssignmentFn.mockResolvedValue(sampleAssignment);

			const { client, Wrapper } = createWrapper();
			client.setQueryData(assignmentKeys.list(), []);

			const { result } = renderHook(() => useCreateAssignmentMutation(), {
				wrapper: Wrapper,
			});

			await act(async () => {
				await result.current.mutateAsync({
					courseId: "course-web",
					name: "Bài tập 1",
					deadline: "2026-10-20T00:00:00.000Z",
					priority: "high",
				});
			});

			expect(mockedFunctions.createAssignmentFn).toHaveBeenCalled();
			expect(client.getQueryData(assignmentKeys.list())).toEqual([
				sampleAssignment,
			]);
		});

		it("toggles assignment status in cache", async () => {
			const completedAssignment = { ...sampleAssignment, completed: true };
			mockedFunctions.toggleAssignmentFn.mockResolvedValue(completedAssignment);

			const { client, Wrapper } = createWrapper();
			client.setQueryData(assignmentKeys.list(), [sampleAssignment]);

			const { result } = renderHook(() => useToggleAssignmentMutation(), {
				wrapper: Wrapper,
			});

			await act(async () => {
				await result.current.mutateAsync({
					id: "asm-1",
					completed: true,
				});
			});

			expect(client.getQueryData(assignmentKeys.list())).toEqual([
				completedAssignment,
			]);
		});

		it("deletes assignment from cache", async () => {
			mockedFunctions.deleteAssignmentFn.mockResolvedValue({ id: "asm-1" });

			const { client, Wrapper } = createWrapper();
			client.setQueryData(assignmentKeys.list(), [sampleAssignment]);

			const { result } = renderHook(() => useDeleteAssignmentMutation(), {
				wrapper: Wrapper,
			});

			await act(async () => {
				await result.current.mutateAsync({ id: "asm-1" });
			});

			expect(client.getQueryData(assignmentKeys.list())).toEqual([]);
		});

		it("updates assignment in cache", async () => {
			const updatedAssignment = { ...sampleAssignment, name: "Tên mới" };
			mockedFunctions.updateAssignmentFn.mockResolvedValue(updatedAssignment);

			const { client, Wrapper } = createWrapper();
			client.setQueryData(assignmentKeys.list(), [sampleAssignment]);

			const { result } = renderHook(() => useUpdateAssignmentMutation(), {
				wrapper: Wrapper,
			});

			await act(async () => {
				await result.current.mutateAsync({
					id: "asm-1",
					courseId: "course-web",
					name: "Tên mới",
					deadline: "2026-10-20T00:00:00.000Z",
					priority: "high",
				});
			});

			expect(client.getQueryData(assignmentKeys.list())).toEqual([
				updatedAssignment,
			]);
		});
	});
});
