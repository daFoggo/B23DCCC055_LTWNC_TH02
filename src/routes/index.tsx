import { IconPlus } from "@tabler/icons-react";
import { useSuspenseQueries } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ErrorFallback } from "@/components/common/error-pages";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type {
	Assignment,
	AssignmentStatus,
	NewAssignmentInput,
} from "@/features/assignments";
import {
	ASSIGNMENT_STATUSES,
	AssignmentBoard,
	AssignmentFormDialog,
	assignmentsQueryOptions,
	filterAndSortAssignments,
	useAssignmentsByStatus,
	useCreateAssignmentMutation,
	useDeleteAssignmentMutation,
	useKanbanStore,
	useToggleAssignmentMutation,
	useUpdateAssignmentMutation,
} from "@/features/assignments";
import type { Course } from "@/features/course";
import { coursesQueryOptions } from "@/features/course";
import { useHydrated } from "@/hooks/use-hydrated";
import { getErrorMessage } from "@/lib/error";

type DialogState =
	| { mode: "create" }
	| { mode: "edit"; assignment: Assignment }
	| null;

const HomePage = () => {
	const [{ data: assignments }, { data: courses }] = useSuspenseQueries({
		queries: [assignmentsQueryOptions(), coursesQueryOptions()],
	});
	const [dialog, setDialog] = useState<DialogState>(null);
	const isHydrated = useHydrated();

	const searchQuery = useKanbanStore((s) => s.searchQuery);
	const priorityFilter = useKanbanStore((s) => s.priorityFilter);
	const courseFilter = useKanbanStore((s) => s.courseFilter);
	const sortBy = useKanbanStore((s) => s.sortBy);
	const columnOrder = useKanbanStore((s) => s.columnOrder);

	const toggleMutation = useToggleAssignmentMutation();
	const deleteMutation = useDeleteAssignmentMutation();
	const createMutation = useCreateAssignmentMutation();
	const updateMutation = useUpdateAssignmentMutation();

	const courseById = useMemo(() => {
		const map: Record<string, Course | undefined> = {};
		for (const course of courses) {
			map[course.id] = course;
		}
		return map;
	}, [courses]);

	const courseNameById = useMemo(() => {
		const map: Record<string, string | undefined> = {};
		for (const course of courses) {
			map[course.id] = course.name;
		}
		return map;
	}, [courses]);

	const courseCodeById = useMemo(() => {
		const map: Record<string, string | undefined> = {};
		for (const course of courses) {
			map[course.id] = course.code;
		}
		return map;
	}, [courses]);

	const filteredAssignments = useMemo(() => {
		if (!isHydrated) {
			return filterAndSortAssignments(
				assignments,
				{
					searchQuery: "",
					priorityFilter: "all",
					courseFilter: "all",
					sortBy: "manual",
				},
				courseNameById,
			);
		}
		return filterAndSortAssignments(
			assignments,
			{ searchQuery, priorityFilter, courseFilter, sortBy },
			courseNameById,
		);
	}, [
		assignments,
		isHydrated,
		searchQuery,
		priorityFilter,
		courseFilter,
		sortBy,
		courseNameById,
	]);

	const byStatus = useAssignmentsByStatus(
		filteredAssignments,
		isHydrated && sortBy === "manual" ? columnOrder : undefined,
	);

	const handleSubmit = async (input: NewAssignmentInput) => {
		try {
			if (dialog?.mode === "edit") {
				await updateMutation.mutateAsync({
					...input,
					id: dialog.assignment.id,
				});
				toast.success("Đã cập nhật bài tập");
			} else {
				await createMutation.mutateAsync(input);
				toast.success("Đã thêm bài tập");
			}
			setDialog(null);
		} catch (error) {
			toast.error(getErrorMessage(error, "Không thể lưu bài tập"));
		}
	};

	const handleStatusChange = async (
		id: string,
		targetStatus: AssignmentStatus,
	) => {
		const assignment = assignments.find((a) => a.id === id);
		if (!assignment) return;

		try {
			if (targetStatus === "completed") {
				await toggleMutation.mutateAsync({ id, completed: true });
				toast.success("Đã đánh dấu hoàn thành bài tập");
			} else if (targetStatus === "in-progress") {
				const isOverdue = Date.parse(assignment.deadline) < Date.now();
				if (isOverdue) {
					const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
					await updateMutation.mutateAsync({
						id: assignment.id,
						courseId: assignment.courseId,
						name: assignment.name,
						priority: assignment.priority,
						deadline: nextWeek.toISOString(),
					});
				}
				if (assignment.completed) {
					await toggleMutation.mutateAsync({ id, completed: false });
				}
				toast.success("Đã chuyển bài tập sang Chưa hoàn thành");
			} else {
				const isAlreadyPast = Date.parse(assignment.deadline) < Date.now();
				if (!isAlreadyPast) {
					const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
					await updateMutation.mutateAsync({
						id: assignment.id,
						courseId: assignment.courseId,
						name: assignment.name,
						priority: assignment.priority,
						deadline: yesterday.toISOString(),
					});
				}
				if (assignment.completed) {
					await toggleMutation.mutateAsync({ id, completed: false });
				}
				toast.success("Đã chuyển bài tập sang Quá hạn");
			}
		} catch (error) {
			toast.error(
				getErrorMessage(error, "Không thể cập nhật trạng thái bài tập"),
			);
		}
	};

	return (
		<main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6">
			<header className="flex flex-wrap items-end justify-between gap-4">
				<div className="flex flex-col gap-1.5">
					<h1 className="font-title text-3xl font-bold tracking-tight text-foreground">
						Student Deadline Tracker
					</h1>
					<p className="text-sm text-muted-foreground">
						Theo dõi bài tập theo trạng thái để không bỏ lỡ hạn nộp. Kéo thả thẻ
						để cập nhật trạng thái.
					</p>
				</div>
				<Button onClick={() => setDialog({ mode: "create" })}>
					<IconPlus />
					Thêm bài tập
				</Button>
			</header>

			<AssignmentBoard.Toolbar
				courses={courses}
				totalCount={assignments.length}
				filteredCount={filteredAssignments.length}
			/>

			<AssignmentBoard
				assignments={assignments}
				byStatus={byStatus}
				courseNameById={courseNameById}
				courseCodeById={courseCodeById}
				onStatusChange={handleStatusChange}
			>
				{ASSIGNMENT_STATUSES.map((status) => (
					<AssignmentBoard.Column
						key={status}
						status={status}
						items={byStatus[status]}
						count={byStatus[status].length}
					>
						{byStatus[status].length === 0 ? (
							<AssignmentBoard.Empty status={status} />
						) : (
							byStatus[status].map((assignment) => {
								const course = courseById[assignment.courseId];
								return (
									<AssignmentBoard.Card
										key={assignment.id}
										assignment={assignment}
										courseName={course?.name ?? assignment.courseId}
										courseCode={course?.code}
										onEdit={() => setDialog({ mode: "edit", assignment })}
										onToggle={(id, completed) =>
											toggleMutation.mutate({ id, completed })
										}
										onDelete={(id) => deleteMutation.mutate({ id })}
									/>
								);
							})
						)}
					</AssignmentBoard.Column>
				))}
			</AssignmentBoard>

			{dialog !== null && (
				<AssignmentFormDialog
					key={dialog.mode === "edit" ? dialog.assignment.id : "create"}
					open
					onOpenChange={(open) => {
						if (!open) setDialog(null);
					}}
					mode={dialog.mode}
					assignment={dialog.mode === "edit" ? dialog.assignment : undefined}
					courses={courses}
					onSubmit={handleSubmit}
				/>
			)}
		</main>
	);
};

const HomePending = () => {
	return (
		<main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6">
			<header className="flex flex-col gap-2">
				<Skeleton className="h-9 w-72" />
				<Skeleton className="h-4 w-96 max-w-full" />
			</header>
			<div className="flex flex-wrap items-center justify-between gap-3">
				<Skeleton className="h-8 w-64" />
				<div className="flex gap-2">
					<Skeleton className="h-8 w-44" />
					<Skeleton className="h-8 w-36" />
					<Skeleton className="h-8 w-40" />
				</div>
			</div>
			<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				<Skeleton className="h-40" />
				<Skeleton className="h-40" />
				<Skeleton className="h-40" />
			</div>
		</main>
	);
};

export const Route = createFileRoute("/")({
	loader: async ({ context }) => {
		await Promise.all([
			context.queryClient.query(coursesQueryOptions()),
			context.queryClient.query(assignmentsQueryOptions()),
		]);
	},
	pendingComponent: HomePending,
	errorComponent: ErrorFallback,
	component: HomePage,
});
