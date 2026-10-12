import {
	IconChartBar,
	IconLayoutKanban,
	IconList,
	IconPlus,
} from "@tabler/icons-react";
import { useQueryClient, useSuspenseQueries } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { ErrorFallback } from "@/components/common/error-pages";
import { ThemeToggle } from "@/components/common/theme-provider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type {
	Assignment,
	AssignmentId,
	AssignmentStatus,
	NewAssignmentInput,
} from "@/features/assignments";
import {
	ASSIGNMENT_STATUSES,
	AssignmentBoard,
	AssignmentCard,
	AssignmentFormDialog,
	assignmentKeys,
	assignmentsQueryOptions,
	filterAndSortAssignments,
	generateMockAssignments,
	useAssignmentsByStatus,
	useCreateAssignmentMutation,
	useDeleteAssignmentMutation,
	useKanbanStore,
	usePinStore,
	useToggleAssignmentMutation,
	useUpdateAssignmentMutation,
	VirtualizedAssignmentList,
} from "@/features/assignments";
import type { Course } from "@/features/course";
import { coursesQueryOptions } from "@/features/course";
import { useDebounce } from "@/hooks/use-debounce";
import { useHydrated } from "@/hooks/use-hydrated";
import { getErrorMessage } from "@/lib/error";

// React.lazy cho trang / component Thống kê
const LazyAssignmentStatsView = lazy(
	() => import("@/features/assignments/components/assignment-stats-view"),
);

type DialogState =
	{ mode: "create" } | { mode: "edit"; assignment: Assignment } | null;

type ViewTab = "kanban" | "virtualized" | "stats";

const HomePage = () => {
	const [{ data: assignments }, { data: courses }] = useSuspenseQueries({
		queries: [assignmentsQueryOptions(), coursesQueryOptions()],
	});
	const queryClient = useQueryClient();
	const [dialog, setDialog] = useState<DialogState>(null);
	const [activeTab, setActiveTab] = useState<ViewTab>("kanban");
	const [isGeneratingMock, setIsGeneratingMock] = useState(false);
	const isHydrated = useHydrated();

	const searchQuery = useKanbanStore((s) => s.searchQuery);
	const priorityFilter = useKanbanStore((s) => s.priorityFilter);
	const courseFilter = useKanbanStore((s) => s.courseFilter);
	const sortBy = useKanbanStore((s) => s.sortBy);
	const columnOrder = useKanbanStore((s) => s.columnOrder);

	// Zustand pin store
	const pinnedIds = usePinStore((s) => s.pinnedIds);
	const togglePin = usePinStore((s) => s.togglePin);

	// Kỹ thuật useDebounce (300 ms) cho ô tìm kiếm
	const debouncedSearchQuery = useDebounce(searchQuery, 300);

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

	const pinnedSet = useMemo(() => new Set(pinnedIds), [pinnedIds]);

	// Kỹ thuật useMemo cho phần lọc & sắp xếp (kết hợp debounced search và pinnedIds)
	const filteredAssignments = useMemo(() => {
		if (!isHydrated) {
			return filterAndSortAssignments(
				assignments,
				{
					searchQuery: "",
					priorityFilter: "all",
					courseFilter: "all",
					sortBy: "manual",
					pinnedIds: [],
				},
				courseNameById,
			);
		}
		return filterAndSortAssignments(
			assignments,
			{
				searchQuery: debouncedSearchQuery,
				priorityFilter,
				courseFilter,
				sortBy,
				pinnedIds,
			},
			courseNameById,
		);
	}, [
		assignments,
		isHydrated,
		debouncedSearchQuery,
		priorityFilter,
		courseFilter,
		sortBy,
		pinnedIds,
		courseNameById,
	]);

	const byStatus = useAssignmentsByStatus(
		filteredAssignments,
		isHydrated && sortBy === "manual" ? columnOrder : undefined,
	);

	// useCallback cho các handler truyền xuống AssignmentCard
	const handleEdit = useCallback((assignment: Assignment) => {
		setDialog({ mode: "edit", assignment });
	}, []);

	const handleToggle = useCallback(
		(id: AssignmentId, completed: boolean) => {
			toggleMutation.mutate({ id, completed });
		},
		[toggleMutation],
	);

	const handleDelete = useCallback(
		(id: AssignmentId) => {
			deleteMutation.mutate({ id });
		},
		[deleteMutation],
	);

	const handlePin = useCallback(
		(id: AssignmentId) => {
			togglePin(id);
		},
		[togglePin],
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
				const isPast = Date.parse(assignment.deadline) < Date.now();
				if (isPast) {
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

	// Chế độ stress test: Tạo 10.000 bài tập mẫu
	const handleGenerateMock10k = () => {
		setIsGeneratingMock(true);
		try {
			const mockList = generateMockAssignments(10000);
			queryClient.setQueryData<Assignment[]>(assignmentKeys.list(), mockList);
			toast.success("Đã nạp thành công 10.000 bài tập mẫu vào bộ nhớ!");
			// Chuyển sang chế độ xem Virtualized để giao diện mượt mà
			setActiveTab("virtualized");
		} catch (err) {
			toast.error("Không thể tạo dữ liệu mẫu");
		} finally {
			setIsGeneratingMock(false);
		}
	};

	return (
		<main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6">
			<header className="flex flex-wrap items-end justify-between gap-4">
				<div className="flex flex-col gap-1.5">
					<div className="flex items-center gap-3">
						<h1 className="font-title text-3xl font-bold tracking-tight text-foreground">
							Student Deadline Tracker
						</h1>
						<ThemeToggle />
					</div>
					<p className="text-sm text-muted-foreground">
						Theo dõi bài tập theo trạng thái, tối ưu hiệu năng và ghim bài tập
						quan trọng.
					</p>
				</div>
				<div className="flex items-center gap-2">
					<div className="flex rounded-lg border bg-muted/30 p-1">
						<Button
							variant={activeTab === "kanban" ? "default" : "ghost"}
							size="sm"
							onClick={() => setActiveTab("kanban")}
							className="text-xs"
						>
							<IconLayoutKanban className="size-3.5" />
							Kanban
						</Button>
						<Button
							variant={activeTab === "virtualized" ? "default" : "ghost"}
							size="sm"
							onClick={() => setActiveTab("virtualized")}
							className="text-xs"
						>
							<IconList className="size-3.5" />
							Virtualization
						</Button>
						<Button
							variant={activeTab === "stats" ? "default" : "ghost"}
							size="sm"
							onClick={() => setActiveTab("stats")}
							className="text-xs"
						>
							<IconChartBar className="size-3.5" />
							Thống kê
						</Button>
					</div>

					<Button onClick={() => setDialog({ mode: "create" })}>
						<IconPlus />
						Thêm bài tập
					</Button>
				</div>
			</header>

			{activeTab !== "stats" && (
				<AssignmentBoard.Toolbar
					courses={courses}
					totalCount={assignments.length}
					filteredCount={filteredAssignments.length}
					onGenerateMock10k={handleGenerateMock10k}
					isGeneratingMock={isGeneratingMock}
				/>
			)}

			{activeTab === "kanban" && (
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
										<AssignmentCard
											key={assignment.id}
											assignment={assignment}
											courseName={course?.name ?? assignment.courseId}
											courseCode={course?.code}
											isPinned={pinnedSet.has(assignment.id)}
											onPin={handlePin}
											onEdit={() => handleEdit(assignment)}
											onToggle={handleToggle}
											onDelete={handleDelete}
										/>
									);
								})
							)}
						</AssignmentBoard.Column>
					))}
				</AssignmentBoard>
			)}

			{activeTab === "virtualized" && (
				<VirtualizedAssignmentList
					items={filteredAssignments}
					courseNameById={courseNameById}
					courseCodeById={courseCodeById}
					pinnedSet={pinnedSet}
					onPin={handlePin}
					onEdit={handleEdit}
					onToggle={handleToggle}
					onDelete={handleDelete}
				/>
			)}

			{activeTab === "stats" && (
				<Suspense
					fallback={
						<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
							<Skeleton className="h-32" />
							<Skeleton className="h-32" />
							<Skeleton className="h-32" />
							<Skeleton className="h-32" />
						</div>
					}
				>
					<LazyAssignmentStatsView
						assignments={assignments}
						courses={courses}
					/>
				</Suspense>
			)}

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
