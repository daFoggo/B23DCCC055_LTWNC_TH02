import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AssignmentBoard, AssignmentCard } from "./components/assignment-board";
import { AssignmentForm } from "./components/assignment-form";
import { AssignmentFormDialog } from "./components/assignment-form-dialog";
import { AssignmentStatsView } from "./components/assignment-stats-view";
import { AssignmentToolbar } from "./components/assignment-toolbar";
import { VirtualizedAssignmentList } from "./components/virtualized-assignment-list";
import type { Assignment, NewAssignmentInput } from "./schemas";

const validCourseId = "5c4a9e3f-6d0a-4b1c-8e8f-3a4b5c6d7e8f";
const validAssignmentId = "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d";

const sampleAssignment: Assignment = {
	id: validAssignmentId,
	courseId: validCourseId,
	name: "Bài tập CSS Grid",
	deadline: "2026-10-25T23:59:00.000Z",
	priority: "high",
	completed: false,
	createdAt: "2026-10-01T00:00:00.000Z",
};

const sampleCourses = [
	{ id: validCourseId, name: "Lập trình web", code: "WEB" },
	{
		id: "6d5b0f4a-7e1b-4c2d-a9fa-4b5c6d7e8f9a",
		name: "Cơ sở dữ liệu",
		code: "DB",
	},
];

describe("AssignmentCard Component", () => {
	it("renders assignment details correctly", () => {
		render(
			<AssignmentCard
				assignment={sampleAssignment}
				courseName="Lập trình web"
				courseCode="WEB"
			/>,
		);

		expect(screen.getByText("Bài tập CSS Grid")).toBeInTheDocument();
		expect(screen.getByText("Lập trình web")).toBeInTheDocument();
		expect(screen.getByText("Cao")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /Hoàn thành/i }),
		).toBeInTheDocument();
	});

	it("calls onToggle when clicking completion button", async () => {
		const user = userEvent.setup();
		const handleToggle = vi.fn();

		render(
			<AssignmentCard
				assignment={sampleAssignment}
				courseName="Lập trình web"
				courseCode="WEB"
				onToggle={handleToggle}
			/>,
		);

		const completeBtn = screen.getByRole("button", { name: /Hoàn thành/i });
		await user.click(completeBtn);

		expect(handleToggle).toHaveBeenCalledWith(validAssignmentId, true);
	});

	it("calls onPin when clicking pin button", async () => {
		const user = userEvent.setup();
		const handlePin = vi.fn();

		render(
			<AssignmentCard
				assignment={sampleAssignment}
				courseName="Lập trình web"
				courseCode="WEB"
				isPinned={false}
				onPin={handlePin}
			/>,
		);

		const pinBtn = screen.getByRole("button", {
			name: /Ghim "Bài tập CSS Grid"/i,
		});
		await user.click(pinBtn);

		expect(handlePin).toHaveBeenCalledWith(validAssignmentId);
	});

	it("displays pinned badge when isPinned is true", () => {
		render(
			<AssignmentCard
				assignment={sampleAssignment}
				courseName="Lập trình web"
				courseCode="WEB"
				isPinned={true}
			/>,
		);

		expect(screen.getByText("Đã ghim")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /Bỏ ghim "Bài tập CSS Grid"/i }),
		).toBeInTheDocument();
	});
});

describe("AssignmentForm Component", () => {
	it("submits valid values when form is filled and submitted", async () => {
		const user = userEvent.setup();
		const handleSubmit = vi.fn();

		const defaultValues: NewAssignmentInput = {
			courseId: validCourseId,
			name: "Bài tập mới",
			deadline: "2026-10-30T10:00:00.000Z",
			priority: "medium",
		};

		render(
			<AssignmentForm
				courses={sampleCourses}
				defaultValues={defaultValues}
				submitLabel="Lưu bài tập"
				onSubmit={handleSubmit}
			/>,
		);

		const nameInput = screen.getByLabelText(/Tên bài tập/i);
		expect(nameInput).toHaveValue("Bài tập mới");

		const submitBtn = screen.getByRole("button", { name: /Lưu bài tập/i });
		await user.click(submitBtn);

		expect(handleSubmit).toHaveBeenCalledWith(
			expect.objectContaining({
				courseId: validCourseId,
				name: "Bài tập mới",
				priority: "medium",
			}),
		);
	});

	it("validates empty name on blur", async () => {
		const user = userEvent.setup();
		const handleSubmit = vi.fn();

		const defaultValues: NewAssignmentInput = {
			courseId: validCourseId,
			name: "Tên ban đầu",
			deadline: "2026-10-30T10:00:00.000Z",
			priority: "medium",
		};

		render(
			<AssignmentForm
				courses={sampleCourses}
				defaultValues={defaultValues}
				submitLabel="Lưu"
				onSubmit={handleSubmit}
			/>,
		);

		const nameInput = screen.getByLabelText(/Tên bài tập/i);
		await user.clear(nameInput);
		await user.tab(); // trigger blur

		expect(
			await screen.findByText(/Tên bài tập không được để trống/i),
		).toBeInTheDocument();
	});
});

describe("AssignmentStatsView Component", () => {
	it("renders statistical summaries and course breakdown", () => {
		render(
			<AssignmentStatsView
				assignments={[sampleAssignment]}
				courses={sampleCourses}
			/>,
		);

		expect(screen.getByText("Tổng bài tập")).toBeInTheDocument();
		expect(screen.getByText("Thống kê theo môn học")).toBeInTheDocument();
		expect(screen.getByText("Lập trình web")).toBeInTheDocument();
	});
});

describe("VirtualizedAssignmentList Component", () => {
	it("renders virtualized list wrapper", () => {
		render(
			<VirtualizedAssignmentList
				items={[sampleAssignment]}
				courseNameById={{ [validCourseId]: "Lập trình web" }}
				courseCodeById={{ [validCourseId]: "WEB" }}
			/>,
		);

		expect(screen.getByText(/TanStack Virtual/i)).toBeInTheDocument();
	});
});

describe("AssignmentFormDialog Component", () => {
	it("renders dialog with title and form", () => {
		render(
			<AssignmentFormDialog
				open={true}
				onOpenChange={vi.fn()}
				mode="create"
				courses={sampleCourses}
				onSubmit={vi.fn()}
			/>,
		);

		expect(
			screen.getByRole("heading", { name: "Thêm bài tập" }),
		).toBeInTheDocument();
	});
});

describe("AssignmentToolbar Component", () => {
	it("renders toolbar with search and generate button", async () => {
		const user = userEvent.setup();
		const handleGenerate = vi.fn();

		render(
			<AssignmentToolbar
				courses={sampleCourses}
				totalCount={10}
				filteredCount={5}
				onGenerateMock10k={handleGenerate}
			/>,
		);

		expect(
			screen.getByPlaceholderText(/Tìm bài tập hoặc môn học/i),
		).toBeInTheDocument();
		expect(
			screen.getByText("Đang hiển thị 5 trên tổng số 10 bài tập"),
		).toBeInTheDocument();

		const genBtn = screen.getByRole("button", {
			name: /Tạo 10.000 bài tập mẫu/i,
		});
		await user.click(genBtn);
		expect(handleGenerate).toHaveBeenCalled();
	});
});

describe("AssignmentBoard Component", () => {
	it("renders AssignmentBoard with Column and Empty", () => {
		render(
			<AssignmentBoard assignments={[sampleAssignment]}>
				<AssignmentBoard.Column
					status="in-progress"
					items={[sampleAssignment]}
					count={1}
				>
					<AssignmentCard
						assignment={sampleAssignment}
						courseName="Lập trình web"
						courseCode="WEB"
					/>
				</AssignmentBoard.Column>
				<AssignmentBoard.Column status="overdue" items={[]} count={0}>
					<AssignmentBoard.Empty status="overdue" />
				</AssignmentBoard.Column>
			</AssignmentBoard>,
		);

		expect(screen.getByText("Chưa hoàn thành")).toBeInTheDocument();
		expect(screen.getByText("Quá hạn")).toBeInTheDocument();
		expect(screen.getByText("Không có bài tập quá hạn")).toBeInTheDocument();
	});
});
