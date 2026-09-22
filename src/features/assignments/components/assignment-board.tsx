import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import {
	closestCorners,
	DndContext,
	DragOverlay,
	defaultDropAnimationSideEffects,
	KeyboardSensor,
	PointerSensor,
	useDndContext,
	useDroppable,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
	IconCalendarClock,
	IconCheck,
	IconClipboardList,
	IconGripVertical,
	IconPencil,
	IconTrash,
} from "@tabler/icons-react";
import type { ComponentProps, ReactNode } from "react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { CourseIcon } from "@/features/course";
import { cn } from "@/lib/utils";
import {
	describeDeadline,
	getAssignmentStatus,
	getDeadlineLabel,
	isAssignmentStatus,
	PRIORITY_META,
	STATUS_META,
} from "../lib";
import type { Assignment, AssignmentId, AssignmentStatus } from "../schemas";
import { useKanbanStore } from "../store";
import { AssignmentToolbar } from "./assignment-toolbar";

interface AssignmentBoardColumnProps extends ComponentProps<"section"> {
	status: AssignmentStatus;
	items?: Assignment[];
	count?: number;
}

const AssignmentBoardColumn = ({
	status,
	items = [],
	count,
	children,
	className,
}: AssignmentBoardColumnProps) => {
	const meta = STATUS_META[status];
	const { setNodeRef, isOver } = useDroppable({
		id: status,
		data: { status },
	});
	const itemIds = useMemo(() => items.map((item) => item.id), [items]);

	return (
		<section className={cn("flex min-h-40 flex-col gap-3", className)}>
			<header className="flex items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<h2 className="text-sm font-semibold text-foreground">
						{meta.label}
					</h2>
					{typeof count === "number" && (
						<Badge variant={status === "overdue" ? "destructive" : "secondary"}>
							{count}
						</Badge>
					)}
				</div>
			</header>
			<div
				ref={setNodeRef}
				className={cn(
					"flex flex-1 flex-col gap-3 rounded-lg p-1 transition-colors",
					isOver && "bg-primary/5 ring-2 ring-primary/30",
				)}
			>
				<SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
					{children}
				</SortableContext>
			</div>
		</section>
	);
};

interface AssignmentCardProps {
	assignment: Assignment;
	courseName: string;
	courseCode?: string;
	onEdit?: (id: AssignmentId) => void;
	onToggle?: (id: AssignmentId, completed: boolean) => void;
	onDelete?: (id: AssignmentId) => void;
	isOverlay?: boolean;
}

const AssignmentCard = ({
	assignment,
	courseName,
	courseCode,
	onEdit,
	onToggle,
	onDelete,
	isOverlay = false,
}: AssignmentCardProps) => {
	const { id, name, deadline, priority, completed } = assignment;
	const label = getDeadlineLabel(deadline);
	const isOverdue = label.kind === "overdue";

	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: assignment.id,
		data: { assignment, status: getAssignmentStatus(assignment) },
		disabled: isOverlay,
	});

	const style = {
		transform: isDragging ? undefined : CSS.Translate.toString(transform),
		transition,
	};

	return (
		<Card
			ref={setNodeRef}
			style={style}
			size="sm"
			className={cn(
				"transition-shadow",
				isDragging && "border-dashed opacity-25 ring-2 ring-primary/40",
				isOverlay && "cursor-grabbing shadow-xl ring-1 ring-primary/40",
			)}
		>
			<CardHeader>
				<div className="flex items-center gap-1">
					{!isOverlay && (
						<button
							type="button"
							{...attributes}
							{...listeners}
							className="cursor-grab p-1 text-muted-foreground/60 transition-colors hover:text-foreground active:cursor-grabbing"
							aria-label={`Kéo "${name}"`}
						>
							<IconGripVertical className="size-4" />
						</button>
					)}
					<CardTitle>{name}</CardTitle>
				</div>
				<CardAction>
					<div className="flex items-center gap-1">
						<Button
							variant="ghost"
							size="icon-sm"
							aria-label={`Sửa "${name}"`}
							onClick={() => onEdit?.(id)}
						>
							<IconPencil />
						</Button>
						<Button
							variant="ghost"
							size="icon-sm"
							aria-label={`Xoá "${name}"`}
							onClick={() => onDelete?.(id)}
						>
							<IconTrash />
						</Button>
					</div>
				</CardAction>
			</CardHeader>
			<CardContent>
				<div className="flex flex-wrap items-center gap-2">
					<Badge variant="outline" className="flex items-center gap-1.5">
						{courseCode && (
							<CourseIcon code={courseCode} className="size-3.5" />
						)}
						<span>{courseName}</span>
					</Badge>
					<Badge variant="secondary">{PRIORITY_META[priority].label}</Badge>
				</div>
				<div
					className={cn(
						"mt-3 flex items-center gap-1.5 text-sm",
						isOverdue ? "text-destructive" : "text-muted-foreground",
					)}
				>
					<IconCalendarClock className="size-4" />
					<span>{describeDeadline(deadline)}</span>
				</div>
			</CardContent>
			<CardFooter>
				<Button
					variant={completed ? "secondary" : "default"}
					size="sm"
					className="w-full"
					onClick={() => onToggle?.(id, !completed)}
				>
					<IconCheck />
					{completed ? "Bỏ hoàn thành" : "Hoàn thành"}
				</Button>
			</CardFooter>
		</Card>
	);
};

const COLUMN_EMPTY_TITLES: Record<AssignmentStatus, string> = {
	"in-progress": "Chưa có bài tập đang triển khai",
	overdue: "Không có bài tập quá hạn",
	completed: "Chưa có bài tập hoàn thành",
};

const AssignmentColumnEmpty = ({ status }: { status: AssignmentStatus }) => {
	return (
		<div className="flex items-center gap-2 rounded-lg border border-dashed p-3">
			<IconClipboardList className="size-4 shrink-0 text-muted-foreground" />
			<p className="text-xs text-muted-foreground">
				{COLUMN_EMPTY_TITLES[status]}
			</p>
		</div>
	);
};

const BoardDragOverlay = ({
	activeAssignment,
	courseName,
	courseCode,
}: {
	activeAssignment: Assignment | null;
	courseName: string;
	courseCode?: string;
}) => {
	const { activeNodeRect } = useDndContext();

	if (!activeAssignment) return null;

	const style = activeNodeRect?.width
		? { width: `${activeNodeRect.width}px` }
		: undefined;

	return (
		<DragOverlay
			dropAnimation={{
				sideEffects: defaultDropAnimationSideEffects({
					styles: {
						active: {
							opacity: "0.4",
						},
					},
				}),
			}}
		>
			<div style={style}>
				<AssignmentCard
					assignment={activeAssignment}
					courseName={courseName}
					courseCode={courseCode}
					isOverlay
				/>
			</div>
		</DragOverlay>
	);
};

interface AssignmentBoardRootProps extends ComponentProps<"div"> {
	onStatusChange?: (id: AssignmentId, targetStatus: AssignmentStatus) => void;
	assignments?: Assignment[];
	byStatus?: Record<AssignmentStatus, Assignment[]>;
	courseNameById?: Record<string, string | undefined>;
	courseCodeById?: Record<string, string | undefined>;
	children: ReactNode;
}

const AssignmentBoardRoot = ({
	className,
	onStatusChange,
	assignments = [],
	byStatus,
	courseNameById = {},
	courseCodeById = {},
	children,
}: AssignmentBoardRootProps) => {
	const activeDragId = useKanbanStore((s) => s.activeDragId);
	const setActiveDragId = useKanbanStore((s) => s.setActiveDragId);
	const reorderInColumn = useKanbanStore((s) => s.reorderInColumn);
	const moveBetweenColumnsOrder = useKanbanStore(
		(s) => s.moveBetweenColumnsOrder,
	);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const handleDragStart = (event: DragStartEvent) => {
		setActiveDragId(String(event.active.id));
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		setActiveDragId(null);
		if (!over) return;

		const activeId = String(active.id);
		const overId = String(over.id);

		const activeAssignment = assignments.find((a) => a.id === activeId);
		if (!activeAssignment) return;

		const sourceStatus = getAssignmentStatus(activeAssignment);
		const overAssignment = assignments.find((a) => a.id === overId);

		let targetStatus: AssignmentStatus | undefined;
		if (isAssignmentStatus(overId)) {
			targetStatus = overId;
		} else if (overAssignment) {
			targetStatus = getAssignmentStatus(overAssignment);
		} else {
			const overDataStatus = over.data.current?.status;
			if (isAssignmentStatus(overDataStatus)) {
				targetStatus = overDataStatus;
			}
		}

		if (!targetStatus) return;

		const sourceItemIds = byStatus
			? byStatus[sourceStatus].map((a) => a.id)
			: assignments
					.filter((a) => getAssignmentStatus(a) === sourceStatus)
					.map((a) => a.id);

		const targetItemIds = byStatus
			? byStatus[targetStatus].map((a) => a.id)
			: assignments
					.filter((a) => getAssignmentStatus(a) === targetStatus)
					.map((a) => a.id);

		if (sourceStatus === targetStatus) {
			if (activeId !== overId) {
				reorderInColumn(sourceStatus, activeId, overId, sourceItemIds);
			}
		} else {
			moveBetweenColumnsOrder(
				sourceStatus,
				targetStatus,
				activeId,
				overAssignment ? overId : null,
				sourceItemIds,
				targetItemIds,
			);
			onStatusChange?.(activeId, targetStatus);
		}
	};

	const activeAssignment =
		(activeDragId ? assignments.find((a) => a.id === activeDragId) : null) ??
		null;

	const activeCourseName = activeAssignment
		? (courseNameById[activeAssignment.courseId] ?? activeAssignment.courseId)
		: "";

	const activeCourseCode = activeAssignment
		? courseCodeById[activeAssignment.courseId]
		: undefined;

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCorners}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
		>
			<div
				className={cn(
					"grid gap-6 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(280px,1fr))]",
					className,
				)}
			>
				{children}
			</div>

			<BoardDragOverlay
				activeAssignment={activeAssignment}
				courseName={activeCourseName}
				courseCode={activeCourseCode}
			/>
		</DndContext>
	);
};

export const AssignmentBoard = Object.assign(AssignmentBoardRoot, {
	Column: AssignmentBoardColumn,
	Card: AssignmentCard,
	Empty: AssignmentColumnEmpty,
	Toolbar: AssignmentToolbar,
});
