import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { Course } from "@/features/course";
import type { Assignment, NewAssignmentInput } from "../schemas";
import { DEFAULT_NEW_ASSIGNMENT_INPUT } from "../schemas";
import { AssignmentForm } from "./assignment-form";

interface AssignmentFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mode: "create" | "edit";
	assignment?: Assignment;
	courses: Course[];
	onSubmit: (input: NewAssignmentInput) => Promise<void> | void;
}

export const AssignmentFormDialog = ({
	open,
	onOpenChange,
	mode,
	assignment,
	courses,
	onSubmit,
}: AssignmentFormDialogProps) => {
	const defaultValues =
		mode === "edit" && assignment
			? {
					courseId: assignment.courseId,
					name: assignment.name,
					deadline: assignment.deadline,
					priority: assignment.priority,
				}
			: DEFAULT_NEW_ASSIGNMENT_INPUT;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{mode === "edit" ? "Sửa bài tập" : "Thêm bài tập"}
					</DialogTitle>
					<DialogDescription>
						{mode === "edit"
							? "Cập nhật thông tin bài tập."
							: "Nhập thông tin bài tập mới."}
					</DialogDescription>
				</DialogHeader>
				<AssignmentForm
					courses={courses}
					defaultValues={defaultValues}
					submitLabel={mode === "edit" ? "Lưu thay đổi" : "Thêm bài tập"}
					onSubmit={onSubmit}
				/>
			</DialogContent>
		</Dialog>
	);
};
