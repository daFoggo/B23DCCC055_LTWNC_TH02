import {
	queryOptions,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import {
	createAssignmentFn,
	deleteAssignmentFn,
	listAssignmentsFn,
	toggleAssignmentFn,
	updateAssignmentFn,
} from "./functions";
import type {
	Assignment,
	DeleteAssignmentInput,
	NewAssignmentInput,
	ToggleAssignmentInput,
	UpdateAssignmentInput,
} from "./schemas";

export const assignmentKeys = {
	all: ["assignments"] as const,
	list: () => [...assignmentKeys.all, "list"] as const,
};

export const assignmentsQueryOptions = () =>
	queryOptions({
		queryKey: assignmentKeys.list(),
		queryFn: () => listAssignmentsFn(),
	});

export const useAssignmentsQuery = () => useQuery(assignmentsQueryOptions());

export const useCreateAssignmentMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: NewAssignmentInput) =>
			createAssignmentFn({ data: input }),
		onSuccess: (assignment) => {
			queryClient.setQueryData<Assignment[]>(assignmentKeys.list(), (prev) =>
				prev ? [assignment, ...prev] : [assignment],
			);
		},
	});
};

export const useToggleAssignmentMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: ToggleAssignmentInput) =>
			toggleAssignmentFn({ data: input }),
		onSuccess: (updated) => {
			queryClient.setQueryData<Assignment[]>(assignmentKeys.list(), (prev) =>
				prev?.map((assignment) =>
					assignment.id === updated.id ? updated : assignment,
				),
			);
		},
	});
};

export const useUpdateAssignmentMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: UpdateAssignmentInput) =>
			updateAssignmentFn({ data: input }),
		onSuccess: (updated) => {
			queryClient.setQueryData<Assignment[]>(assignmentKeys.list(), (prev) =>
				prev?.map((assignment) =>
					assignment.id === updated.id ? updated : assignment,
				),
			);
		},
	});
};

export const useDeleteAssignmentMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: DeleteAssignmentInput) =>
			deleteAssignmentFn({ data: input }),
		onSuccess: ({ id }) => {
			queryClient.setQueryData<Assignment[]>(assignmentKeys.list(), (prev) =>
				prev?.filter((assignment) => assignment.id !== id),
			);
		},
	});
};
