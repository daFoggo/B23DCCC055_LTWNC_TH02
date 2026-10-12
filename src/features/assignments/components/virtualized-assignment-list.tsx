import { useVirtualizer } from "@tanstack/react-virtual";
import { memo, useRef } from "react";
import type { Assignment, AssignmentId } from "../schemas";
import { AssignmentCard } from "./assignment-board";

interface VirtualizedAssignmentListProps {
	items: Assignment[];
	courseNameById: Record<string, string | undefined>;
	courseCodeById: Record<string, string | undefined>;
	pinnedSet?: Set<string>;
	onPin?: (id: AssignmentId) => void;
	onEdit?: (assignment: Assignment) => void;
	onToggle?: (id: AssignmentId, completed: boolean) => void;
	onDelete?: (id: AssignmentId) => void;
	height?: number;
}

export const VirtualizedAssignmentList = memo(
	function VirtualizedAssignmentListComponent({
		items,
		courseNameById,
		courseCodeById,
		pinnedSet = new Set(),
		onPin,
		onEdit,
		onToggle,
		onDelete,
		height = 650,
	}: VirtualizedAssignmentListProps) {
		const parentRef = useRef<HTMLDivElement>(null);

		const rowVirtualizer = useVirtualizer({
			count: items.length,
			getScrollElement: () => parentRef.current,
			estimateSize: () => 185,
			overscan: 5,
		});

		return (
			<div className="w-full rounded-lg border bg-card p-2 shadow-sm">
				<div className="mb-2 px-2 text-xs font-medium text-muted-foreground">
					Danh sách tối ưu hóa (TanStack Virtual -{" "}
					{items.length.toLocaleString()} bài tập)
				</div>
				<div
					ref={parentRef}
					style={{
						height: `${height}px`,
						overflow: "auto",
					}}
					className="w-full"
				>
					<div
						style={{
							height: `${rowVirtualizer.getTotalSize()}px`,
							width: "100%",
							position: "relative",
						}}
					>
						{rowVirtualizer.getVirtualItems().map((virtualRow) => {
							const item = items[virtualRow.index];

							return (
								<div
									key={virtualRow.key}
									style={{
										position: "absolute",
										top: 0,
										left: 0,
										width: "100%",
										transform: `translateY(${virtualRow.start}px)`,
									}}
									className="px-1 pb-3"
								>
									<AssignmentCard
										assignment={item}
										courseName={courseNameById[item.courseId] ?? item.courseId}
										courseCode={courseCodeById[item.courseId]}
										isPinned={pinnedSet.has(item.id)}
										onPin={onPin}
										onEdit={() => onEdit?.(item)}
										onToggle={onToggle}
										onDelete={onDelete}
									/>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		);
	},
);
