import { IconRotate, IconSearch, IconX } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@/components/ui/input-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { Course } from "@/features/course";
import { CourseIcon } from "@/features/course";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";
import { PRIORITY_META } from "../lib";
import type { Priority } from "../schemas";
import { PRIORITIES } from "../schemas";
import type { KanbanSortOption } from "../store";
import { useKanbanStore } from "../store";

export interface AssignmentToolbarProps {
	courses: Course[];
	totalCount?: number;
	filteredCount?: number;
	className?: string;
}

const SORT_LABELS: Record<KanbanSortOption, string> = {
	manual: "Thứ tự tùy chỉnh",
	"deadline-asc": "Hạn nộp gần nhất",
	"deadline-desc": "Hạn nộp xa nhất",
	"priority-desc": "Ưu tiên cao nhất",
	"name-asc": "Tên A-Z",
};

export const AssignmentToolbar = ({
	courses,
	totalCount,
	filteredCount,
	className,
}: AssignmentToolbarProps) => {
	const isHydrated = useHydrated();

	const searchQuery = useKanbanStore((s) => s.searchQuery);
	const setSearchQuery = useKanbanStore((s) => s.setSearchQuery);
	const priorityFilter = useKanbanStore((s) => s.priorityFilter);
	const setPriorityFilter = useKanbanStore((s) => s.setPriorityFilter);
	const courseFilter = useKanbanStore((s) => s.courseFilter);
	const setCourseFilter = useKanbanStore((s) => s.setCourseFilter);
	const sortBy = useKanbanStore((s) => s.sortBy);
	const setSortBy = useKanbanStore((s) => s.setSortBy);
	const resetFilters = useKanbanStore((s) => s.resetFilters);

	const activePriority = isHydrated ? priorityFilter : "all";
	const activeCourse = isHydrated ? courseFilter : "all";
	const activeSort = isHydrated ? sortBy : "manual";

	const hasActiveFilters =
		searchQuery.trim() !== "" ||
		activePriority !== "all" ||
		activeCourse !== "all" ||
		activeSort !== "manual";

	const selectedCourse = courses.find((c) => c.id === activeCourse);

	return (
		<div className={cn("flex flex-col gap-3", className)}>
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex min-w-64 flex-1 items-center gap-2 sm:max-w-xs">
					<InputGroup>
						<InputGroupAddon align="inline-start">
							<IconSearch className="size-4" />
						</InputGroupAddon>
						<InputGroupInput
							placeholder="Tìm bài tập hoặc môn học..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
						{searchQuery && (
							<InputGroupButton
								size="icon-xs"
								onClick={() => setSearchQuery("")}
								aria-label="Xóa tìm kiếm"
							>
								<IconX className="size-3.5" />
							</InputGroupButton>
						)}
					</InputGroup>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<Select
						value={activeCourse}
						onValueChange={(val) => setCourseFilter(val ?? "all")}
					>
						<SelectTrigger className="w-44 sm:w-52">
							<SelectValue placeholder="Tất cả môn học">
								{selectedCourse ? (
									<span className="flex items-center gap-1.5 truncate">
										<CourseIcon
											code={selectedCourse.code}
											className="size-3.5"
										/>
										<span className="truncate">{selectedCourse.name}</span>
									</span>
								) : (
									"Tất cả môn học"
								)}
							</SelectValue>
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Tất cả môn học</SelectItem>
							{courses.map((course) => (
								<SelectItem key={course.id} value={course.id}>
									<span className="flex items-center gap-2">
										<CourseIcon code={course.code} className="size-3.5" />
										<span>{course.name}</span>
									</span>
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Select
						value={activePriority}
						onValueChange={(val) => setPriorityFilter(val as Priority | "all")}
					>
						<SelectTrigger className="w-36">
							<SelectValue placeholder="Độ ưu tiên">
								{activePriority === "all"
									? "Độ ưu tiên"
									: PRIORITY_META[activePriority].label}
							</SelectValue>
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Tất cả độ ưu tiên</SelectItem>
							{PRIORITIES.map((p) => (
								<SelectItem key={p} value={p}>
									{PRIORITY_META[p].label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Select
						value={activeSort}
						onValueChange={(val) => setSortBy(val as KanbanSortOption)}
					>
						<SelectTrigger className="w-40">
							<SelectValue placeholder="Sắp xếp">
								{SORT_LABELS[activeSort]}
							</SelectValue>
						</SelectTrigger>
						<SelectContent>
							{(Object.keys(SORT_LABELS) as KanbanSortOption[]).map((key) => (
								<SelectItem key={key} value={key}>
									{SORT_LABELS[key]}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					{hasActiveFilters && (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={resetFilters}
							className="text-xs text-muted-foreground hover:text-foreground"
						>
							<IconRotate className="size-3.5" />
							Đặt lại
						</Button>
					)}
				</div>
			</div>

			{typeof totalCount === "number" &&
				typeof filteredCount === "number" &&
				filteredCount !== totalCount && (
					<div className="flex items-center gap-2">
						<Badge variant="outline" className="text-xs font-normal">
							Đang hiển thị {filteredCount} trên tổng số {totalCount} bài tập
						</Badge>
					</div>
				)}
		</div>
	);
};
